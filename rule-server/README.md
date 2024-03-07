# rule-server

This README covers topics to build and deploy the rules and rule server.

All the extensions and automated tools deployed at [IBM Equal Access Accessibility Checker](https://www.ibm.com/able/toolkit/tools#develop) use the same engine and rule server making it easy to replicate finding issues.

- For information on creating and modifying the rules, see [README-RULES](../accessibility-checker-engine/README-RULES.md).
- For information on installing the engine in a Node or browser environment, see [README-NPM](../accessibility-checker-engine/README-NPM.md).

The rule server, engine, and tools are supporting components of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).
The Toolkit provides the tools and guidance to create experiences that are delightful for people of all abilities.
The guidance is organized by phase, such as Plan, Design, Develop, and Verify, and explains how to integrate the automated testing tools into the [Verify phase](https://www.ibm.com/able/toolkit/verify/overview).
The Toolkit is a major part of the accessibility information and applications at [ibm.com/able](https://ibm.com/able/).

### Rules and Rulesets

* Rules are based on the [IBM Accessibility requirements](https://www.ibm.com/able/requirements/requirements/), which is a unified set of WCAG, EN 301 549, and US 508 standards.
* Rules are harmonized with the open rules published by the [W3C ACT-Rules Community](https://www.w3.org/community/act-r/) group as reported in the [IBM Equal Access Accessibility Checker ACT implementation report](https://wai-wcag-act-rules.netlify.app/standards-guidelines/act/implementations/equal-access/).
* Rule sets, such as `IBM Accessibility v7.2`, `WCAG 2.2 (A & AA)`, `WCAG 2.1 (A & AA)`, and `WCAG 2.0 (A & AA)`and mappings of the rules to the standards (Requirements), Rule IDs, the individual failure messages, and links to the Help files are published at [Checker rule sets](https://www.ibm.com/able/requirements/checker-rule-sets).
* Mappings of the rules are defined in the [individual rule_ID_name.ts files](https://github.com/IBMa/equal-access/tree/master/accessibility-checker-engine/src/v4/rules).

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

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Aengine), tagged with `engine`.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
