# accessibility-checker-engine RULES

This README is oriented toward rule creation or modification. Users who want to modify an existing rule or create a new rule should read this document. Any rule addition or change should be fully reviewed and tested before being approved for public release.

## Specification and structure

Multiple objects are needed for a rule to fire and show up in the tool results:

* [Rule object](#rule-object)
* [Messages](#messages)
* [Help](#help)
* [Test cases](#test-cases)
  
### Rule object

The basic rule format is defined by the Rule type in [src/v4/api/IRule.ts](src/v4/api/IRule.ts). Rule implementation is located in [src/v4/rules](src/v4/rules).  The rule context, including DOM object hierarchies, attributes, explicit/implicit CSS and ARIA attributes, that may trigger a rule, are defined in [src/v2/common/Context.ts](src/v2/common/Context.ts). 

#### Messages

The rule results can be one of:
* RulePass("pass_reason")
* RuleFail("fail_reason")
* RulePotential("potential_reason")
* RuleManual("manual_reason")
  
Each of these can take message arguments as a string array in the second parameter. They may also pass parameters to other APIs as an array in the third argument.

An example rule might look like:
```
{
    id: "body_all_trigger",
    context: "dom:body",
    refactor: {
        "OLDID_Trigger": {
            "Manual_0": "manual_always"
        }
    },
    help: {
        "en-US": {
            0: `body_all_trigger.html`,
            "manual_always": `body_all_trigger.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Grouping label for the rule",
            "manual_always": "Check the body element for something"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "2.1.1", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.RECOMMENDATION,
        toolkitLevel: eToolkitLevel.LEVEL_FOUR
    }],
    act: {},
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        const domAttrs = context["dom"].attributes;

        return RuleManual("manual_always");
    }
}
```

## Help

Help source files are found in [help-v4](help-v4). 
Help integrates the following:

* Failure message
  * Rule type
  * Rule ID
  * Reason ID
* Why is it important?
  * Element location
* What to do
  * Examples
* About this requirement
* Who does this affect?

### Rule sets and Mappings

* Rule sets such as `IBM Accessibility v7.2`, `WCAG 2.2 (A & AA)`, etc., and mappings of the latest rules to the standards (Requirement and Rule IDs), the individual failure messages (by Reasons ID), and links to the Help files are listed in the published  [Checker rule sets](https://www.ibm.com/able/requirements/checker-rule-sets)
* `npm run build:help` in the `.../accessibility-checker-engine` directory creates `dist/help/rules.html` that can be reviewed
* Each build creates the `Rules listing` artifact in **Actions** that can be reviewed prior to deployment.

## Test cases

Each rule may have one or more test cases. Test cases are located in [test/v2/checker/accessibility/rules](test/v2/checker/accessibility/rules). The basic template of the test cases is:
```
<!DOCTYPE html>
<html lang="en">
<head><title>Test case title</title></head>
<body><main>
    <!-- Testcase HTML -->
</main></body>

    <script type="text/javascript">
        UnitTest = {
            ruleIds: ["body_all_trigger"],
            results: [{
                "ruleId": "body_all_trigger",
                "category": "Accessibility",
                "value": [
                    "INFORMATION", "MANUAL"
                ],
                "path": {
                    "dom": "/html[1]/body[1]",
                    "aria": "/document[1]"
                },
                "reasonId": "manual_always",
                "message": "Check the body element for something",
                "messageArgs": [],
                "apiArgs": []
            }]
        }
    </script>
</body>

</html>
```

The ruleIds parameter defines which rules are tested. Note that it can be helpful to leave the results parameter blank and use the error results of testing (below) as a starting point. 

## Running test cases

To run all testcases, `npm test`. To test a single testcase or a smaller set of testcases, edit [karma.conf.js](karma.conf.js). Replace these lines with the desired pattern:
```
{ pattern: 'test/**/*_ruleunit/*.html', watched: true },
{ pattern: 'test/**/*_ruleunit/*.htm', watched: true },
```
Then, run `npm test` again.

`npm test` will watch files and automatically re-run when the test case or rules are changed.

## Run local server with local browser extension

You can run test cases to verify a rule implementation, or you can deploy the rules to a local rule server, and then build the browser extension to access the rules deployed in the local server to test. The steps to use a local server are:

* Build and start rule server. In `rule-server` run `npm run start`.
* Load `https://localhost:9445/` in the browser and type `thisisunsafe` to bypass cert warnings.
* Build extension. In `accessibility-checker-extension` run `npm run build:watch:local`.
* Add the extension in the `accessibility-checker-extension/dist` directory to Chrome. It will have the `(local)` label on the DevTools tab.

Note: Rule changes are not automatically rebuilt. You will have to kill the rule server (Ctrl+C) and then rebuild, rerun. The extension may need to be refreshed to reload the rules.

## Summary of steps to implement/update and test a new rule

* Create a rule id for a new rule, using the 3-word format with underscores: `type_property_test`. 
* Create the help file in [help-v4](help-v4).
* Create the rule implementation in [src/v4/rules](src/v4/rules). The rule implementation includes the rule context, message, help, ruleset mappings, logic, and outcome.
* Create test cases for the rule in [test/v2/checker/accessibility/rules](test/v2/checker/accessibility/rules).
* Test the rules with the test cases. You may run the test cases locally, or run with the local rule server. 

## Feedback and reporting bugs

If you think you've found a bug, or have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues). If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
