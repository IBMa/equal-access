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

import { readdirSync, readFileSync, writeFileSync } from "fs";

//requiring path and fs modules
const path = require('path');
const rulesV2 = require("./v2/checker/accessibility/rules");
const helpMap = require("./v2/checker/accessibility/help").a11yHelp;
const helpNls = require("./v2/checker/accessibility/nls").a11yNls;
const rulesets = require("./v2/checker/accessibility/rulesets").a11yRulesets;

function getBlock(fileContent) {
    fileContent = fileContent.substring(fileContent.indexOf("{"));
    let depth = 1;
    let iter = 1;
    while (depth > 0 && iter < fileContent.length) {
        let ch = fileContent.charAt(iter++);
        if (ch === "/" && fileContent.charAt(iter) === "/") {
            // skip comment
            while (fileContent.charAt(iter++) !== "\n") {}
        }
        if (ch === "}") {
            --depth;
        } else if (ch === "{") {
            ++depth;
        }
    }
    let chunk = fileContent.substring(0,iter);
    fileContent = fileContent.substring(iter);
    fileContent = fileContent.substring(fileContent.indexOf("{"));
    return {chunk, result: fileContent};
}

async function buildV2() {
    let files = readdirSync(path.join(__dirname, "v2", "checker", "accessibility", "rules"));
    let index = `export * from "./aria/application/HAAC_Application_Role_Text";
    export * from "./aria/attributes/aria_hidden_focus_misuse";
    export * from "./aria/attributes/Rpt_Aria_RequiredProperties";
    export * from "./aria/attributes/Rpt_Aria_ValidProperty";
    export * from "./aria/attributes/Rpt_Aria_ValidRole";
    export * from "./aria/link/WCAG20_A_HasText";
    export * from "./html/a/WCAG20_A_TargetAndText";
    export * from "./html/applet/WCAG20_Applet_HasAlt";
    export * from "./html/area/WCAG20_Area_HasAlt";
    export * from "./html/blink/WCAG20_Blink_AlwaysTrigger";
    export * from "./html/html/RPT_Html_SkipNav";
    export * from "./html/html/WCAG20_Html_HasLang";
    export * from "./html/tabbable/detector_tabbable";
    export * from "./style/blink/RPT_Blink_CSSTrigger1";
`
    for (const file of files) {
        if (file.includes("index.ts")) continue;
        let fileContent = readFileSync(path.join(__dirname, "v2", "checker", "accessibility", "rules", file)).toString();
        fileContent = fileContent.substring(fileContent.indexOf("Rule[] = ["));
        fileContent = fileContent.substring(0, fileContent.lastIndexOf("]"));
        fileContent = fileContent.substring(0, fileContent.lastIndexOf("}")+1);
        while (fileContent.length > 0) {
            let { chunk, result } = getBlock(fileContent);
            let s = chunk.substring(chunk.indexOf("run:"));
            s = s.substring(s.indexOf("=>"));
            s = s.substring(s.indexOf("{")-1);
            let { chunk: runChunk } = getBlock(s);
            fileContent = result.trim();
            let m = chunk.match(/id:\s*["']([^'"]*)['"]/);
            if (m) {
                let id = m[1];
                let rule = rulesV2.a11yRules.filter(rule => rule.id === id)[0];
                let helpInfo = helpMap[id];
                if (helpInfo) {
                    helpInfo.group = helpInfo.group || helpInfo[0];
                    delete helpInfo[0];
                    for (const key in helpInfo) {
                        helpInfo[key] = helpInfo[key].replace(/\/en-US\//, "");
                    }
                }
                let msgInfo = helpNls[id];
                if (msgInfo) {
                    msgInfo.group = msgInfo.group || msgInfo[0];
                    delete msgInfo[0];
                }

                let ruleRS : any = {
                    id: [],
                    num: [],
                    //level: eRulePolicy.VIOLATION,
                    //toolkitLevel: eToolkitLevel.LEVEL_ONE
                }
                for (const ruleset of rulesets) {
                    for (const checkpoint of ruleset.checkpoints) {
                        for (const rule of checkpoint.rules) {
                            if (rule.id === id) {
                                if (!ruleRS.id.includes(ruleset.id)) {
                                    ruleRS.id.push(ruleset.id);
                                }
                                if (!ruleRS.num.includes(checkpoint.num)) {
                                    ruleRS.num.push(checkpoint.num);
                                }
                                ruleRS.level = rule.level;
                                ruleRS.toolkitLevel = rule.toolkitLevel;
                            }
                        }
                    }
                }
        
                let outFile = `/******************************************************************************
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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../../../api/IRule";
import { RPTUtil } from "../../../../v2/checker/accessibility/util/legacy";

export let ${id}: Rule = {
    id: "${id}",
    context: "${rule.context}",${rule.dependencies ? `
    dependencies: ${JSON.stringify(rule.dependencies)},` : ""}
    help: {
        "en-US": ${JSON.stringify(helpInfo, null, 14)}
    },
    messages: {
        "en-US": ${JSON.stringify(msgInfo, null, 14)}
    },
    rulesets: [${JSON.stringify(ruleRS)
        .replace(/"level":"VIOLATION"/, `"level": eRulePolicy.VIOLATION`)
        .replace(/"level":"RECOMMENDATION"/, `"level": eRulePolicy.RECOMMENDATION`)
        .replace(/"level":"INFORMATION"/, `"level": eRulePolicy.INFORMATION`)
        .replace(/"toolkitLevel":"1"/,`"toolkitLevel": eToolkitLevel.LEVEL_ONE`)
        .replace(/"toolkitLevel":"2"/,`"toolkitLevel": eToolkitLevel.LEVEL_TWO`)
        .replace(/"toolkitLevel":"3"/,`"toolkitLevel": eToolkitLevel.LEVEL_THREE`)
        .replace(/"toolkitLevel":"4"/,`"toolkitLevel": eToolkitLevel.LEVEL_FOUR`)
    }],
    act: {},
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => ${runChunk}
}`
                writeFileSync(path.join(__dirname, "v4", "rules", "sort", "me", id+".ts"), outFile);
                index += `export * from "./sort/me/${id}";
`
            }
        }
    }
    writeFileSync(path.join(__dirname, "v4", "rules", "index.ts"), index);
    /**
    for (const rule of rulesV2.a11yRules as RuleV2[]) {
        const ruleId = rule.id;
        let helpInfo = helpMap[ruleId];
        let msgInfo = helpNls[ruleId];
        if (msgInfo) {
            msgInfo.group = msgInfo.group || msgInfo[0];
        }

        if (helpInfo) {
            let helpToken = helpInfo[0];
            let helpPath = path.join(__dirname, '..', 'help-v4', helpToken);
            if (!existsSync(helpPath)) {
                console.log("MISSING:",helpPath);
                continue;
            }
            let helpFile = readFileSync(helpPath).toString();
            helpFile = helpFile.replace(/\<head\>/, `<head>
<title>${rule.id} - Accessibility Checker Help</title>
<script>
    RULE_MESSAGES = {"en-US":${JSON.stringify(msgInfo)}};
    RULE_ID = "${ruleId}";
</script>
`)
            writeFileSync(path.join(__dirname, '..', 'dist', 'help', helpToken), helpFile);
        }
    }
     */
}

(async () => {
    await buildV2();
})();