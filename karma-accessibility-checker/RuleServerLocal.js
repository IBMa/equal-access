/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

// Load required modules
var express = require('express');
var serveIndex = require('serve-index');

// Create an express application
var app = express();

// // Check if the tools-rules-engine dir exists
// if (fs.existsSync("./test/client/htmlFiles/")) {
//     // Copy all the files into package/v2/a11y folder as they are required for RuleServer
//     fs.copySync('./test/client/htmlFiles/', './dependencies/tools-rules-html/v2/a11y/test/client/htmlFiles/');
// }

// Host the rule server content on the express server
app.use("/test/", express.static('../accessibility-checker-engine/test'));
app.use("/test/", express.static("test"));
// Enable server index, to allow for browsing
app.use("/test/", serveIndex('../accessibility-checker-engine/test', {
    'icons': true,
    'hidden': true,
    'view': 'details'
}));

// Configure and start the server on port 3000
var server = app.listen(3000, function () {

    // Fetch the hostname and port to display them
    var host = server.address().address;
    var port = server.address().port;

    console.log('Local Rule Server listening at http://%s:%s', host, port);

});
