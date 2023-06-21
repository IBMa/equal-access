# rule-server

This README covers topics related to build and deploy the rules and rule server.

## Branches and rule archives

By default, deployments build the current ruleset as the `preview` archive.
However, different branches deploy to different servers.
The `master` branch deploys to [able-main.xcc2slstt6y.us-south.codeengine.appdomain.cloud/rules](https://able-main.xcc2slstt6y.us-south.codeengine.appdomain.cloud/rules).
For end users to see and be able to select the `preview` rule set in the settings, changes must be merged into the `prod` branch.

## Create a new rule set archive

1. Install

* In `accessibility-checker-engine` and `rule-server` run `npm install`

2. Build

* Delete `rule-server/dist`
* In `rule-server`, `npm run build`

3. Deploy

* The new archive will be found in `rule-server/dist/static/archives/preview`. 
* Copy and rename `preview` to the archive directory (e.g., `rule-server/src/static/archives/yyyy.mm.dd`)

4. Metadata

* Add an entry to `rule-server/src/static/archives.json`. See other entries for examples. Ensure that you move the `latest` property to the new archive.

#### License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
