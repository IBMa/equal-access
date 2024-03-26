const aChecker = require("accessibility-checker");
const { RuleFail } = require("accessibility-checker/lib/common/engine/IRule");
const { readFileSync } = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let sampNames = [
    "faq.dita"
];

(async () => {
    await aChecker.addRule({
        id: "dita_hello",
        context: "dom:concept",
        help: {
            "en-US": {
                "group": `dita_hello.html`,
                "fail_0": "dita_hello.html"
            }
        },
        messages: {
            "en-US": {
                "group": "DITA group",
                "fail_0": "Hello DITA World"
            }
        },
        rulesets: [{
            "id": [ "DITA" ],
            "num": [ "1" ],
            "level": "VIOLATION",
            "toolkitLevel": "1"
        }],
        run: (context) => {
            const ruleContext = context["dom"].node;
            return RuleFail("fail_0");
        }
    })
    await aChecker.addRuleset({
        "id": "DITA",
        "name": "DITA Rules",
        "category": "Accessibility",
        "description": "Rules for DITA",
        "checkpoints": [
          {
            "num": "1",
            "name": "DITA CP 1",
            "wcagLevel": "A",
            "summary": "Rules for DITA",
            "rules": [
              {
                "id": "dita_hello",
                "level": "VIOLATION",
                "toolkitLevel": "3"
              }
            ]
          }
        ]
      });

    let idx=0;
    try {

        let results = await Promise.all(
            sampNames.map(label => {
                const dom = new JSDOM(readFileSync("./faq.dita"));
                return aChecker.getCompliance(dom.window.document.documentElement, label+(++idx));
            })
        );
        aChecker.close();
        console.log(`Done scanning ${results.length} pages`);
        // console.log(process._getActiveHandles());
    } catch (err) {
        console.error(err);
    }
})()
