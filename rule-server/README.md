# rule-server

This README covers some topics related to build and deploy the rules / rule server.

## Branches and rule archives

By default, deployments build the current rulepack as the `preview` archive.
However, different branches deploy to different servers.
The `master` branch deploys to `rules-dev.mybluemix.net/rules`.
For end users to see the `preview` archive, changes must be merged into the `prod` branch.

## Create a new archive

1. Install

* In `accessibility-checker-engine` and `rule-server` run `npm install`

2. Build

* Delete `rule-server/dist`
* In `rule-server`, `npm run build`
* The new archive will be found in `rule-server/dist/static/archives/preview`. Copy and rename `preview` to the archive directory (e.g., `rule-server/src/static/archives/yyyy.mm.dd`)

3. Metadata

* Add an entry to `rule-server/src/static/archives.json`. See other entries for examples. Ensure that you move the `latest` property to the new archive.

#### License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
