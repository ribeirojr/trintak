var Wreck = require('wreck');

Wreck.get('http://finance.yahoo.com/d/quotes.csv?e=.csv&f=sl1d1t1&s=BRLEUR=X', { redirects: 3  }, function(err, res, body) {
	 console.log(body.toString());		
});
