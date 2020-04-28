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

 const express = require("express");
const morgan = require("morgan");
const openBrowser = require("react-dev-utils/openBrowser");

const app = express();
const currentDirectory = process.cwd();
const { HOST, PORT } = process.env;

app.use(morgan("tiny")); // XHR request logging framework
app.use(express.static("build")); // express will serve up production assets
app.get("*", (req, res) =>
  res.sendFile(`${currentDirectory}/build/index.html`)
); // express will serve up the front-end index.html file if it doesn't recognize the route

app.listen(PORT, err => {
  if (!err) {
    const url = `${HOST}${PORT}`;
    console.log(`\nYour application is running on \x1b[1m${url}\x1b[0m\n`);
    openBrowser(url);
  } else {
    console.err(`\nUnable to start server: ${err}`);
  }
});
