# accessibility-checker-engine rules

This README is oriented toward rule creation or modification. Users who want to modify an existing rule or create a new rule should read this document. Any rule addition or change should be fully reviewed and tested before being approved for public release.

## Specification and structure

Multiple objects are needed for a rule to fire and show up in the tool results:

* Rule object
* Ruleset mapping
* Messages
* Help file
  
### Rule object

The basic rule format is defined by the Rule type in [src/v4/api/IRule.ts](src/v4/api/IRule.ts). Rule implementation is located in [src/v4/rules](src/v4/rules).  The rule context, including DOM object hierarchies, attributes, explicit/implicit CSS and ARIA attributes, that may trigger a rule, are defined in [src/v2/common/Context.ts](src/v2/common/Context.ts). The rule results can be one of:
* RulePass("MSG_ID")
* RuleFail("MSG_ID")
* RulePotential("MSG_ID")
* RuleManual("MSG_ID")
  
Each of these can take message arguments as a string array in the second parameter. They may also pass parameters to other APIs as an array in the third argument.

An example rule might look like:
```
{
    id: "TRIGGER_ALL_BODY",
    context: "dom:body",
    help: {
        "en-US": {
            0: `TRIGGER_ALL_BODY.html`,
            "Pass_0": `TRIGGER_ALL_BODY.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Grouping label for the rule",
            "Pass_0": "Check the body element for something"
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

        return return RuleManual("Pass_0");
    }
}
```

Help files are found in [help-v4](help-v4).

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
            ruleIds: ["TRIGGER_ALL_BODY"],
            results: [{
                "ruleId": "TRIGGER_ALL_BODY",
                "category": "Accessibility",
                "value": [
                    "INFORMATION", "FAIL"
                ],
                "path": {
                    "dom": "/html[1]/body[1]",
                    "aria": "/document[1]"
                },
                "reasonId": "Fail_1",
                "message": "Another message with message code Fail_1.",
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

* Create a rule id for a new rule. 
* Create the rule and ruleset mapping to [src/v2/checker/accessibility/rulesets/index.ts](src/v2/checker/accessibility/rulesets/index.ts). 
* Create the help file in [help-v4](help-v4).
* Create the rule implementation in [src/v4/rules](src/v4/rules). The rule implementation includes the rule context, logic and outcome (Pass or Fail).
* Create test cases for the rule in [test/v2/checker/accessibility/rules](test/v2/checker/accessibility/rules).
* Test the rules with the test cases. You may run the test cases locally, or run with the local rule server. 