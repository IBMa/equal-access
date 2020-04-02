// Load required modules
var express = require('express')
var serveIndex = require('serve-index')

// Create an express application
var app = express()

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pass to next layer of middleware
    next();
});

// Host the rule server content on the express server
app.use(express.static('sample'));

// Enable server index, to allow for browsing
app.use(serveIndex('sample', {
    'icons': true,
    'hidden': true,
    'view': 'details'
}))

// Confiugure and start the server on port 3003
var server = app.listen(3003, function () {

    // Fetch the hostname and port to display them
    var host = server.address().address;
    var port = server.address().port;

    console.log('Local Test Server listening at http://%s:%s', host, port);

});
