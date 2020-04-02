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

import cfenv = require("cfenv");
import { join } from "path";
import * as fs from "fs";

const appEnv = (cfenv as any).getAppEnv();

export class Config {
    public static PLATFORM_ENDPOINT = !process.env.VCAP_SERVICES ? null : appEnv.url;

    // Configure the deployed host where the server is hosted
    public static deployedHost: string = Config.PLATFORM_ENDPOINT || "localhost";

    // Configure the deployed port where the server is to be hosted on
    public static deployedPort = process.env.DEPLOYED_PORT || 9445;

    // Configure the deployed schema for the server
    public static deployedSchema: string = process.env.DEPLOYED_SCHEMA || "https";

    // Configure the path to where the PEM file resides for https support
    public static certPEMPath: string = process.env.CERT_PEM_PATH ? process.env.CERT_PEM_PATH : "./certs/app.crt";

    // Configure the path to where the KEY file resides for https support
    public static certKEYPath: string = process.env.CERT_KEY_PATH ? process.env.CERT_KEY_PATH : "./certs/app.key";

    // Configure if this microservice should allow self signed certs or not.
    public static secure: boolean = process.env.ALLOW_SELF_SIGNED_CERTS === "true" ? false : true;

    // Set up the APP Name to be used for logging
    public static app: { name: string; } = { name: (fs.existsSync("./package.json") ? require("./package.json") : require("../package.json")).name };

    // // Configure the debug level to set for the logger
    // // Available debug levels "fatal", "error", "warn", "info", "debug", "trace"
    public static debugLevel: string = process.env.DEBUG_LEVEL ? process.env.DEBUG_LEVEL : "error";

    // Configuration if running in development mode or production mode
    public static __DEVELOPMENT__: boolean = process.env.NODE_ENV !== "production";

    // Build endpoint URL
    public static endpoint: string = Config.PLATFORM_ENDPOINT || (Config.deployedSchema + "://" + Config.deployedHost + ":" + Config.deployedPort);

    // // Absolute path to swagger json for API Middleware
    public static swaggerDir: string = join(__dirname, "../api/swagger.json");

    public static __LOCAL__: boolean = !process.env.TRAVIS_BRANCH && !process.env.VCAP_SERVICES;

    public static VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : null;
}
/* istanbul ignore if */
if (!Config.secure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

console.info("[INFO] Endpoint:", Config.endpoint);