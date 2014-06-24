'use strict';


var kraken = require('kraken-js'),
    app = require('express')(),
    options = require('./lib/spec')(app),
    port = process.env.PORT || 8001;

app.use(kraken(options));

// simple logger
app.use(function(req, res, next) {
    console.log('                 --------------------------------------');
    console.log('%s %s', req.method, req.url/*, req.headers*/);
    if (req.method != 'GET')
    req.on('data', function(chunk) {
        console.log("Received body data: " + chunk.toString());
    });
    next();
});

module.exports = app.listen(port, function (err) {
    if (err) {
        console.error(err.stack);
    }
});