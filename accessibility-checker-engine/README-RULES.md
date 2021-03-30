# accessibility-checker-engine rules

This README is oriented toward rule creation and rule modification. Rules should be test driven so that
modifications can be tested and confirmed over time.

## Specification and structure

Multiple objects are needed for a rule to fire and show up in the tool results:

* Rule object
* Ruleset mapping
* Messages
* Help file
  
### Rule object

These are located in [src/v2/checker/accessibility/rules](src/v2/checker/accessibility/rules). The basic rule format is defined by the Rule type in [src/v2/api/IEngine.ts](src/v2/api/IEngine.ts). The possibilities for the context property is defined in [src/v2/common/Context.ts](src/v2/common/Context.ts). The rule results can be one of:
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
    run: (context: RuleContext, 
    options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        const domAttrs = context["dom"].attributes;

        return return RuleManual("Pass_0");
    }
}
```

### Ruleset mapping

Ruleset mappings are defined in [src/v2/checker/accessibility/rulesets/index.ts](src/v2/checker/accessibility/rulesets/index.ts). Rules are added to an appropriate checkpoint section with a mapping such as:
```
{
    id: "TRIGGER_ALL_BODY",
    level: eRulePolicy.VIOLATION,
    toolkitLevel: eToolkitLevel.LEVEL_ONE
}
```

### Messages

Message mappings are defined in [src/v2/checker/accessibility/nls/index.ts](src/v2/checker/accessibility/nls/index.ts). Mappings are defined as:
```
"TRIGGER_ALL_BODY": {
    0: "Passive message used for rule groupings",
    "Pass_0": "Message with message code PASS_0 and arguments {0}, {1}, etc",
    "Fail_1": "Another message with message code Fail_1."
},
```

### Help file

Help mappings are defined in [src/v2/checker/accessibility/help/index.ts](src/v2/checker/accessibility/help/index.ts). Mappings are defined as:

```
"TRIGGER_ALL_BODY": {
    0: `${Config.helpRoot}/Rpt_Aria_MultipleApplicationLandmarks`,
    "Pass_0": `${Config.helpRoot}/Rpt_Aria_MultipleApplicationLandmarks`,
    "Fail_1": `${Config.helpRoot}/Rpt_Aria_MultipleApplicationLandmarks`
}
```

Help files are found in [help](help).

## Test cases

Test cases are located in [test/v2/checker/accessibility/rules](test/v2/checker/accessibility/rules). The basic template of the test cases is:
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

* Build and start rule server. In `rule-server` run `npm run start` or without help `npm run start:nohelp`.
* Load `https://localhost:9445/` in the browser and type `thisisunsafe` to bypass cert warnings.
* Build extension. In `accessibility-checker-extension` run `npm run build:watch:local`.
* Add the extension in the `accessibility-checker-extension/dist` directory to Chrome. It will have the `(local)` label on the DevTools tab.

Note: Rule changes are not automatically rebuilt. You will have to kill the rule server (Ctrl+C) and then rebuild, rerun. The extension may need to be refreshed to reload the rules.
