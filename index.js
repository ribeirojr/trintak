var Hapi = require('hapi');
var Joi = require('joi');
var Wreck = require('wreck');


var URL = 'http://finance.yahoo.com/d/quotes.csv?e=.csv&f=sl1d1t1&s={0}{1}=X';
var CurrencyClient = Wreck.defaults({ redirects: 3});
var currencies = ['BRL','EUR','USD','GBP'];

// Create a server with a host and port
var server = new Hapi.Server();

server.connection({
	port: process.env.PORT || 1229
});


server.method('currency.fetch', function(currency, value, callback) {
	var result = []
	var total = 0;
	currencies.forEach(function(item, index){

		var url = URL.replace('{0}', currency).replace('{1}', item);

		CurrencyClient.get(url, function(err, response, body) {
			if (err)
				return callback(err);

			var csv = body.toString();
			var rate = csv.split(',')[1];
			result.push({
					value: rate * value,
					currency: item,
			});
			
			total++;
			if (total == currencies.length)
				return callback(null, result);
		});
	});
}, { cache: {
	expiresIn: 60,
	generateTimeout: false
}});

// Add the route
server.route({
	method: 'GET',
	path:'/{currency}/{value}',
	config: {
		validate: {
			params: {
				currency: Joi.string().length(3).uppercase(),
				value: Joi.number()
			}
		}
	},
	handler: function (request, reply) {
		var currency = request.params.currency;
		var value = request.params.value;
		
		request.server.methods.currency.fetch(currency, value, function(err, rate){
			if (err)
				return reply({error: 'shit happened'}).code(400);
			console.log(rate);
			reply(JSON.stringify(rate));
		});
	}
});

server.start(function () {
	console.log('Server running at:', server.info.uri);
});