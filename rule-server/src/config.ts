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

import { join } from "path";

export class Config {
    public static __DEVELOPMENT__: boolean = process.env.NODE_ENV !== "production";
    public static __CODEENGINE__: boolean = !!process.env.CE_APP;
    public static __CLOUDFOUNDRY__: boolean = !!process.env.VCAP_SERVICES;
    public static __CLOUD__: boolean = Config.__CLOUDFOUNDRY__ || Config.__CODEENGINE__;
    public static __PRODUCTION__: boolean = Config.__CLOUD__;
    public static __LOCAL__: boolean = !process.env.TRAVIS_BRANCH && !Config.__CLOUD__;
    public static __LOCAL_REACT__: boolean = Config.__LOCAL__ && process.env.__LOCAL_REACT__ === "true";
    public static __NODB__: boolean = process.env.__NODB__ === "true";

    // See also package.json / homepage in src-ui
    public static BASE_PATH = "/rules";
    public static CODEENGINE_PREFIX = "rules";

    // Set up the APP Name to be used for logging
    public static app: { name: string; } = { name: process.env.CE_APP || "rule-server" };
    public static deployedPort = process.env.DEPLOYED_PORT || 9445;
    public static endpoint = Config.__CODEENGINE__ ? `https://${process.env.CE_APP}.${process.env.CE_SUBDOMAIN}.${process.env.CE_DOMAIN}` : `https://localhost:${Config.deployedPort}`

    // Absolute path to swagger json for API Middleware
    public static swaggerDir: string = join(__dirname, "../api/swagger.json");
    // Configure if HTTP Requests should be logged or not
    public static logHttpRequests: boolean = process.env.LOG_HTTP_REQUESTS === "true" ? true : false;

    // Configure if the viewing the API Docs should be disabled or not
    public static disableApiDocs: boolean = process.env.DISABLE_API_DOCS !== "true" ? false : true;

    // Configure the path to where the PEM file resides for https support
    public static certPEMPath: string = process.env.CERT_PEM_PATH ? process.env.CERT_PEM_PATH : "./certs/app.crt";

    // Configure the path to where the KEY file resides for https support
    public static certKEYPath: string = process.env.CERT_KEY_PATH ? process.env.CERT_KEY_PATH : "./certs/app.key";

    // Configure if this microservice should allow self signed certs or not.
    public static secure: boolean = process.env.ALLOW_SELF_SIGNED_CERTS === "true" ? false : true;

    // Configure if testMode set as Evn
    public static testMode: boolean = process.env.TEST_MODE === "true" ? true : false;

    public static bodyParserOptionsLimit: string = process.env.BODY_PARSER_OPTION_LIMIT || "5mb";

    public static AAT_DB: string = process.env.AATCLOUDANT_URL;
    public static AAT_DB_APIKEY = process.env.AATCLOUDANT_APIKEY;
    public static COUCHDB_USER = process.env.COUCHDB_USER || "admin";
    public static COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD || "couchadmin";
}

if (Config.__CODEENGINE__) {
    if (Config.endpoint.includes(`${Config.CODEENGINE_PREFIX}-sandbox`)) {
        Config.endpoint = "https://able-sandbox.xbhbw9w198q.us-south.codeengine.appdomain.cloud"
    }
    if (Config.endpoint.includes(`${Config.CODEENGINE_PREFIX}-main`)) {
        Config.endpoint = "https://able-main.xcc2slstt6y.us-south.codeengine.appdomain.cloud"
    }
    if (Config.endpoint.includes(`${Config.CODEENGINE_PREFIX}-prod`)) {
        Config.endpoint = "https://able.ibm.com"
    }
}

/* istanbul ignore if */
if (!Config.__CLOUD__) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

console.info("[INFO] Endpoint:", Config.endpoint);