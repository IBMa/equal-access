// Load required modules
let express = require('express')

// Create an express application
let app = express()

// Host the rule server content on the express server
app.use("/", express.static('test/'));
app.use("/", express.static('dist/'));

// Configure and start the server on port 3000
let server = app.listen(8080, function () {

    // Fetch the hostname and port to display them
    let host = server.address().address;
    let port = server.address().port;

    console.log('Local Rule Server listening at http://%s:%s', host, port);

});