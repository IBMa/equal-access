# rule-server

This README covers topics related to build and deploy the rules and rule server.

- For information on creating and modifying the rules, see [README-RULES](../accessibility-checker-engine/README-RULES.md).
- For information on installing the engine in a Node environment, see [README-NPM](../accessibility-checker-engine/README-NPM.md).

## Branches and rule archives

By default, deployments build the current ruleset as the `preview` archive.
However, different branches deploy to different servers.
The `master` branch deploys to [able-main.xcc2slstt6y.us-south.codeengine.appdomain.cloud/rules](https://able-main.xcc2slstt6y.us-south.codeengine.appdomain.cloud/rules).
For end users to see and be able to select the `preview` rule set in the settings, changes must be merged into the `prod` branch.

## Create a new rule set archive

1. **Install**: In `accessibility-checker-engine` and `rule-server` run `npm install`

1. **Build**: Delete `rule-server/dist`. In `rule-server`, `npm run build`

1. **Deploy**: The new archive will be found in `rule-server/dist/static/archives/preview`. Copy and rename `preview` to the archive directory (e.g., `rule-server/src/static/archives/yyyy.mm.dd`)

1. **Metadata**: Add an entry to `rule-server/src/static/archives.json`. See other entries for examples. Ensure that you move the `latest` property to the new archive.

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues). If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
