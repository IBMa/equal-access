/******************************************************************************
    Copyright:: 2022- IBM, Inc
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

import { exec } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Rule as RuleV4 } from "./v4/api/IRule";
import { Rule as RuleV2 } from "./v2/api/IEngine";

//requiring path and fs modules
const path = require('path');
const rulesV4 = require("./v4/rules");
const rulesV2 = require("./v2/checker/accessibility/rules");
const helpMap = require("./v2/checker/accessibility/help").a11yHelp;
const helpNls = require("./v2/checker/accessibility/nls").a11yNls;

function myExec(cmd: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });    
    });
}

async function buildV4() {
    await myExec(`shx rm -rf ${path.join(__dirname, '..', 'dist', 'help')}`);
    try {
        await myExec(`shx mkdir ${path.join(__dirname, '..', 'dist')}`);
    } catch (err) {}
    await myExec(`shx cp -r ${path.join(__dirname, '..', 'help-v4')} ${path.join(__dirname, '..', 'dist', 'help')}`);

    for (const ruleId in rulesV4) {
        const rule : RuleV4 = rulesV4[ruleId];
        for (const locale in rule.help) {
            for (const reasonId in rule.help[locale]) {
                let helpFile = readFileSync(path.join(__dirname, '..', 'help-v4', locale, rule.help[locale][reasonId])).toString();
                helpFile = helpFile.replace(/\<head\>/, `<head>
    <title>${rule.id} - Accessibility Checker Help</title>
    <script>
        RULE_MESSAGES = ${JSON.stringify(rule.messages)};
        RULE_ID = "${rule.id}"
    </script>
`)
                writeFileSync(path.join(__dirname, '..', 'dist', 'help', locale, rule.help[locale][reasonId]), helpFile);
            }
        }
    }
}

async function buildV2() {
    // console.log(helpMap);
    let helpFiles = {};
    for (const rule of rulesV2.a11yRules as RuleV2[]) {
        const ruleId = rule.id;
        let helpInfo = helpMap[ruleId];
        let msgInfo = helpNls[ruleId];
        if (msgInfo) {
            msgInfo.group = msgInfo.group || msgInfo[0];
        }

        if (helpInfo) {
            let helpToken = helpInfo[0].replace("https://able.ibm.com/rules/tools/help/", "").replace("/en-US","").replace(".html","");
            let helpFile = "../help"+helpToken+".mdx";
            if (existsSync(path.join(__dirname, helpFile))) {
                let inputFile = readFileSync(path.join(__dirname, helpFile));
                let outputFile = inputFile.toString();
                outputFile = outputFile.substring(outputFile.indexOf(`"toolMain">`)+11).trim();
                outputFile = `<html lang="en-US">
<head>
    <title>${ruleId} - Accessibility Checker Help</title>
    <script>
        RULE_MESSAGES = {"en-US":${JSON.stringify(msgInfo)}};
        RULE_ID = "${ruleId}";
    </script>

    <!-- Title and messages generated at build time -->
    <link rel="icon" href="https://ibm.com/able/favicon-32x32.png" type="image/png">
    <link rel="icon" href="https://ibm.com/able/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../common/help.css" />
    <script type="module">
        import "https://1.www.s81c.com/common/carbon/web-components/tag/latest/code-snippet.min.js";
        import "https://1.www.s81c.com/common/carbon/web-components/tag/latest/list.min.js";
    </script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="../common/help.js"></script>
</head>
<body>
    <div class="bx--grid toolHelp">
        <div class="bx--row">
            <div class="bx--col-sm-4 bx--col-md-8 bx--col-lg-16 toolHead">
                <!-- Group message injected here -->
                <h3 id="groupLabel"></h3>
                <!-- Severity level injected here -->
                <div id="locLevel"></div>
                <!-- Rule specific message injected here -->
                <p id="ruleMessage"></p>
            </div>
        </div>
        <div class="bx--row">
            <div class="bx--col-sm-4 bx--col-md-5 bx--col-lg-8 toolMain">
<!-- Start main panel -->
<mark-down><script type="text/plain">

`+outputFile;
                outputFile = outputFile.replace(/\<\/Column\>[^\>]*\>/, `</script></mark-down>
<!-- End main panel -->
                <!-- This is where the rule id is injected -->
                <div id="ruleInfo"></div>
            </div>
            <div class="bx--col-sm-4 bx--col-md-3 bx--col-lg-4 toolSide">
<!-- Start side panel -->
<mark-down><script type="text/plain">`)
                outputFile = outputFile.replace(/\<\/Column\>(.|\r|\n)*$/, `</script></mark-down>
<!-- End side panel -->
            </div>
        </div>
    </div>
</body>
</html>
`);
                outputFile = outputFile.replace(/\<div id="locSnippet"\>\<\/div\>/, `<!-- This is where the code snippet is injected -->
<div id="locSnippet"></div>`);

                outputFile = outputFile.replace(/&gt;/g, ">");
                outputFile = outputFile.replace(/&lt;/g, "<");
                outputFile = outputFile.replace(/&amp;/g, "&");
                outputFile = outputFile.replace(/\<CodeSnippet[^>]*\> *[\r\n]*/g, "```\n");
                outputFile = outputFile.replace(/[\r\n]* *\<\/CodeSnippet[^>]*\>/g, "\n```");

                writeFileSync(path.join(__dirname, '..', 'dist', 'help', "en-US", helpToken+".html"), outputFile);
            } else {
                console.log("MISSING:", helpFile);
            }
        }
    }
}

(async () => {
    await buildV4();
    await buildV2();
})();