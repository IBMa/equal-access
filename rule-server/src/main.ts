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

import compression from "compression";
import express from "express";
import fs from "fs";
import https from "https";
import mkdirp from "mkdirp";
import path from "path";
import bodyParser from "body-parser";

import { Config } from "./config";
import { RegisterRoutes } from './routes/routes';  // here

process.on("uncaughtException", (err) => console.error("[Uncaught]",err));

export class Server {
    private static oneDay = Config.__LOCAL__ ? 0 : 86400000;

    constructor(private app: express.Application) {
    }

    public async init() {

        try {
            this.app.disable("etag");

            // Hook up the CORS middleware to allow cross-domain requests for swagger editor
            if (Config.__DEVELOPMENT__) {
                let cors = require("cors");
                this.app.use(cors());
            }

            // Enable reverse proxy support in Express. This causes the
            // the "X-Forwarded-Proto" header field to be trusted so its
            // value can be used to determine the protocol. See
            // http://expressjs.com/api#app-settings for more details.
            // A.K.A Enable "trust-proxy" as this allows us to get the original client ip instead of the proxy ip
            this.app.enable("trust proxy");

            // Hook up the Content compression middleware
            this.app.use(compression());

            // Add a handler to inspect the req.secure flag (see 
            // http://expressjs.com/api#req.secure). This allows us 
            // to know whether the request was via http or https.
            this.app.use(function (req, res, next) {
                if (req.secure) {
                    // request was via https, so do no special handling
                    next();
                } else {
                    // request was via http, so redirect to https
                    res.redirect('https://' + req.headers.host + req.url);
                }
            });
            this.app.use(function(req, res, next) {
                let change = req.url.replace(/\/tools\/help\/([^/]*).*$/, "/archives/preview/doc/en-US/$1.html");
                if (change !== req.url) {
                    res.redirect(change);
                } else {
                    next();
                }
            });
             
            this.app.use("/rules", express.static(path.join(__dirname, "static"), { maxAge: Server.oneDay }));

            this.app.use("/rules/api", bodyParser.json({ type: 'application/json'}));
            RegisterRoutes(this.app);  // and here

            const archives = require("./static/archives");
            let latest = "2020FebDeploy";
            let latestVersion;
            for (const archive of archives) {
                if (archive.id === "latest") {
                    latestVersion = archive.version;
                }
            }
            for (const archive of archives) {
                if (archive.version === latestVersion) {
                    latest = archive.path;
                }
            }
            console.log("Latest:",path.join(__dirname, latest));
            this.app.use("/rules/archives/latest", express.static(path.join(__dirname, "static", latest), { maxAge: Server.oneDay }));
        } catch (err) {
            console.error("[ERROR] Fatal error occurred", err);
            throw err;
        }
    }

    /**
     * This function is responsible for running the NodeJS Express server on provided port.
     */
    public async run() {
        try {

            // Check if it's local env
            if (!Config.__CLOUD__ || Config.testMode === true) {

                // Check weather or not cert file exists and have read access to file, otherwise create it and use
                fs.access(Config.certPEMPath, fs.constants.R_OK, (err) => {

                    // If files does not exist or don't have read access to it, create one and use.
                    if (err) {
                        // no-op if the directory already exists
                        mkdirp(path.dirname(Config.certPEMPath), null);
                        let pem = require("pem");

                        // Auto generate a self signed certificate
                        pem.createCertificate({
                            days: 1,
                            selfSigned: true
                        }, (pemErr, keys) => {
                            pemErr && console.error(pemErr);
                            // Write the generated pem and keys
                            fs.writeFileSync(Config.certPEMPath, keys.certificate);
                            fs.writeFileSync(Config.certKEYPath, keys.serviceKey);

                            // Start up the https NodeJS Express Server
                            https.createServer({
                                key: keys.serviceKey,
                                cert: keys.certificate,
                                rejectUnauthorized: Config.secure
                            }, this.app).listen(Config.deployedPort, () => {
                                console.info({ app: Config.app.name, url: Config.endpoint }, "App started (cert generated)");
                            });
                        });

                    } else {
                        // PEM and KEY exists so start up the https NodeJS Express Server
                        https.createServer({
                            key: fs.readFileSync(Config.certKEYPath),
                            cert: fs.readFileSync(Config.certPEMPath),
                            rejectUnauthorized: Config.secure
                        }, this.app).listen(Config.deployedPort, () => {
                            console.info({ app: Config.app.name, url: Config.endpoint }, "App started");
                        });
                    }
                });
                // Production enviornment
            } else {
                this.app.listen(Config.deployedPort, () => {
                    console.info({ app: Config.app.name, url: Config.endpoint }, "App started");
                });
            }
        } catch (err) {
            console.error({ error: err }, "Fatal error occurred", err);
            throw err;
        }
    }
}

const server = new Server(express());
server.init();
server.run();
