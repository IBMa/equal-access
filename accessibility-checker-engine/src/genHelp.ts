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
import { Guideline } from "./v4/api/IGuideline";

//requiring path and fs modules
const path = require('path');
const rulesV4 = require("./v4/rules");
const { a11yRulesets } = require("./v4/rulesets");

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
                if (!rule.help[locale][reasonId] || rule.help[locale][reasonId].length === 0) continue;
                let helpPath = path.join(__dirname, '..', 'help-v4', locale, rule.help[locale][reasonId]);
                if (!existsSync(helpPath)) {
                    console.log("MISSING:",helpPath);
                    continue;
                }
                let helpFile = readFileSync(helpPath).toString();
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

const valueMap = {
    "VIOLATION": {
        "Potential": "Needs review",
        "Fail": "Violation",
        "Pass": "Pass",
        "Manual": "Needs review"
    },
    "RECOMMENDATION": {
        "Potential": "Recommendation",
        "Fail": "Recommendation",
        "Pass": "Pass",
        "Manual": "Recommendation"
    },
    "INFORMATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    }
};

function getSVG(rsLevel, ruleLevel) {
    const val = valueMap[rsLevel][ruleLevel];
    let icon = "";
    if (val === "Violation") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.vst0{fill:none;}
.vst1{fill:#A2191F;}
.vst2{fill:#FFFFFF;fill-opacity:0;}
</style>
<rect class="vst0" width="16" height="16"/>
<path class="vst1" d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
<path class="vst2" d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
</svg>`;
    if (val === "Needs review") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.nrst0{fill:none;}
.nrst1{fill:#F1C21B;}
</style>
<rect class="nrst0" width="16" height="16"/>
<path class="nrst1" d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
<g><g><g>
<rect x="7.45" y="4" width="1.1" height="5"/>
</g></g><g><g>
<circle cx="8" cy="11" r="0.8"/>
</g></g></g>
</svg>`;
    if (val === "Recommendation") icon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve" aria-hidden="true">
<style type="text/css">
.st0{fill:none;}
.st1{fill:#0043CE;}
.st2{fill:#FFFFFF;}
.st3{font-family:'IBMPlexSerif';}
.st4{font-size:12.9996px;}
</style>
<rect class="st0" width="16" height="16"/>
<path class="st1" d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z"/>
<text transform="matrix(1 0 0 1 5.9528 12.5044)" class="st2 st3 st4">i</text>
</svg>`;
    return `<span class="issueLevel">${icon}&nbsp;${val}</span>`;
}

function processRules() {
    let retVal = [];
    for (const ruleset of a11yRulesets as Guideline[]) {
        if (ruleset.type === "extension") continue;
        let rsInfo = {
            id: ruleset.id,
            name: ruleset.name,
            checkpoints: []
        }
        for (let idx=0; idx<ruleset.checkpoints.length; ++idx) {
            const cp = ruleset.checkpoints[idx];
            let cpInfo = {
                num: cp.num,
                name: cp.name,
                wcagLevel: cp.wcagLevel,
                summary: cp.summary,
                rules: []
            }
            for (const ruleId in rulesV4) {
                let includeRuleCodes = new Set<string>();
                let rule: RuleV4 = rulesV4[ruleId];
                let rsLevel = "";
                let toolkitLevel;
                for (const rsInfo of rule.rulesets) {
                    if ((rsInfo.id === ruleset.id || rsInfo.id.includes(ruleset.id)) && (rsInfo.num === cp.num || rsInfo.num.includes(cp.num))) {
                        if (rsInfo.reasonCodes) {
                            rsInfo.reasonCodes.forEach(code => includeRuleCodes.add(code));
                        } else {
                            for (const code in rule.messages["en-US"]) {
                                includeRuleCodes.add(code);
                            }
                        }
                        rsLevel = rsInfo.level;
                        toolkitLevel = rsInfo.toolkitLevel;
                        break;
                    }
                }
                if (includeRuleCodes.size > 0) {
                    let ruleInfo = {
                        level: rsLevel,
                        toolkitLevel: toolkitLevel,
                        rule: rule,
                        reasons: []
                    }
                    includeRuleCodes.forEach((msgCode) => {
                        if (msgCode === "group") return;
                        let re = new RegExp(`\\.Rule([^()) ]+)[ ()]+["']${msgCode}["']`);
                        let reMatch = re.exec(rule.run.toString());
                        if (reMatch && reMatch[1] !== "Pass") {
                            ruleInfo.reasons.push({
                                id: msgCode,
                                message: rule.messages["en-US"][msgCode],
                                help: rule.help["en-US"][msgCode],
                                type: reMatch[1]
                            })
                        }
                    })
                    ruleInfo.reasons.sort((a,b) => {
                        if (a.type === b.type) return 0;
                        if (a.level === "Fail") return -1;
                        if (b.level === "Fail") return 1;
                        if (a.level === "Potential") return -1;
                        if (b.level === "Potential") return 1;
                        if (a.level === "Manual") return -1;
                        if (b.level === "Manual") return 1;
                        return 0;
                    })
                    cpInfo.rules.push(ruleInfo);
                }
            }
            cpInfo.rules.sort((a,b) => {
                if (a.level === b.level) {
                    let retVal = b.reasons.filter(reasonInfo => (reasonInfo.type === "Fail")).length - a.reasons.filter(reasonInfo => (reasonInfo.type === "Fail")).length;
                    if (retVal === 0) {
                        retVal = b.reasons.filter(reasonInfo => (reasonInfo.type === "Potential")).length - a.reasons.filter(reasonInfo => (reasonInfo.type === "Potential")).length;
                    }
                    if (retVal === 0) {
                        retVal = b.reasons.filter(reasonInfo => (reasonInfo.type === "Manual")).length - a.reasons.filter(reasonInfo => (reasonInfo.type === "Manual")).length;
                    }
                    return retVal;
                }
                if (a.level === "VIOLATION") return -1;
                if (b.level === "VIOLATION") return 1;
                if (a.level === "RECOMMENDATION") return -1;
                if (b.level === "RECOMMENDATION") return 1;
                return 0;
            });
            rsInfo.checkpoints.push(cpInfo);
        }
        retVal.push(rsInfo);
    }
    return retVal;
}

function buildRuleViewer() {
    let rsInfo = processRules();
    let switcherItems = "";
    let rsSections = "";
    for (const ruleset of rsInfo) {
        if (ruleset.type === "extension") continue;
        switcherItems += `<bx-content-switcher-item value="${ruleset.id}">${ruleset.name}</bx-content-switcher-item>`;

        let cpSections = "";
        for (const cp of ruleset.checkpoints) {
            let cpRules = "";
            for (const ruleInfo of cp.rules) {
                let reasonSection = "";
                for (const reasonInfo of ruleInfo.reasons) {
                    let helpDetail = {
                        message: reasonInfo.message,
                        msgArgs: ["{0}", "{1}", "{3}", "{4}"],
                        value: [ruleInfo.level, reasonInfo.type.toUpperCase()],
                        reasonId: reasonInfo.id
                    }
                    reasonSection += `<bx-list-item>${getSVG(ruleInfo.level,reasonInfo.type)} &mdash; 
                        <a target="_blank" rel="noopener noreferrer" href="./en-US/${reasonInfo.help}#${encodeURIComponent(JSON.stringify(helpDetail))}">${reasonInfo.message.replace(/</g, "&lt;").replace(/>/, "&gt;")}</a></bx-list-item>`
                }
                cpRules += `<bx-list-item><strong>${ruleInfo.rule.id}</strong>: ${ruleInfo.rule.messages["en-US"].group.replace(/</g, "&lt;").replace(/>/, "&gt;")}
                    <bx-unordered-list nested>
                    ${reasonSection}
                    </bx-unordered-list>
                </bx-list-item>`
            }
            cpSections += `<div>
    <h2>${cp.num} ${cp.name} [${cp.wcagLevel}]</h2>
    <div>${cp.summary}</div>
    ${cpRules.length > 0 ? `<bx-unordered-list style="margin-top: .5rem">${cpRules}</bx-unordered-list>` : ""}
</div>`;
        }
        rsSections += `<div id="${ruleset.id}" style="padding: 1rem; display:${ruleset.id === rsInfo[0].id ? "block": "none"}">
${cpSections}
    </div>`
    }
    let rulesHTML = `<html lang="en-US">
    <head>
        <title>Accessibility Checker Rules</title>
        <link rel="icon" href="https://ibm.com/able/favicon-32x32.png" type="image/png">
        <link rel="icon" href="https://ibm.com/able/favicon.svg" type="image/svg+xml">
        <link rel="stylesheet" href="./common/rules.css" />
        <script type="module">
            import "https://1.www.s81c.com/common/carbon/web-components/tag/latest/code-snippet.min.js";
            import "https://1.www.s81c.com/common/carbon/web-components/tag/latest/list.min.js";
            import "https://1.www.s81c.com/common/carbon/web-components/tag/latest/content-switcher.min.js";
        </script>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script>
            function hookEvents() {
                let mainSwitcher = document.getElementById("rsSwitcher");
                mainSwitcher.addEventListener("bx-content-switcher-selected", (evt) => {
                    let oldValue = mainSwitcher.getAttribute("value") || "${rsInfo[0].id}";
                    let newValue = mainSwitcher.value;
                    document.getElementById(oldValue).style.display="none";
                    document.getElementById(newValue).style.display="block";
                })
            }
        </script>
    <head>
    <body onload="hookEvents();">
        <main>
            <bx-content-switcher value="${rsInfo[0].id}" id="rsSwitcher">
            ${switcherItems}
            </bx-content-switcher>
            ${rsSections}
        </main>
    </body>
</html>`
    writeFileSync(path.join(__dirname, '..', 'dist', "help", "rules.html"), rulesHTML);
}

(async () => {
    await buildV4();
    await buildRuleViewer();
})();