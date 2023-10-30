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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { getCache, setCache } from "../util/CacheUtil";
import { VisUtil } from "../../v2/dom/VisUtil";

function patternDetect(elem: Element): String {
    // check 'explicit' role combobox and that it is not <select>. 
    if (elem.tagName.toLowerCase() === "select" && elem.getAttribute("role") !== "combobox") {
        return "implicit";
    } else if (elem.nodeName.toLowerCase() === "input"
        && (!elem.hasAttribute("type") || elem.getAttribute("type") === "text")
        && elem.hasAttribute("aria-owns") && !elem.hasAttribute("aria-controls")) {
        // Looks like this is an ARIA 1.0 pattern, which the ARIA 1.2 spec says to continue to allow
        return "1.0";
    } else if (elem.nodeName.toLowerCase() !== "input"
        && elem.hasAttribute("aria-owns") && !elem.hasAttribute("aria-controls")) {
        // Looks like this is an ARIA 1.1 pattern, which the ARIA 1.2 spec says is now invalid
        return "1.1";
    }
    // Assume they're trying to do the latest, 1.2 pattern
    return "1.2";
}

export let combobox_design_valid: Rule = {
    id: "combobox_design_valid",
    context: "aria:combobox",
    refactor: {
        "combobox_version": {
            "Pass_1.0": "Pass_1.0",
            "Fail_1.1": "Fail_1.1",
            "Pass_1.2": "Pass_1.2"}
    },
    help: {
        "en-US": {
            "Pass_1.0": "combobox_design_valid.html",
            "Fail_1.1": "combobox_design_valid.html",
            "Pass_1.2": "combobox_design_valid.html",
            "group": "combobox_design_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_1.0": "The combobox design pattern is detected as ARIA 1.0, which is allowed by ARIA 1.2",
            "Fail_1.1": "The combobox design pattern is detected as ARIA 1.1, which is not allowed by ARIA 1.2",
            "Pass_1.2": "The combobox design pattern is detected as ARIA 1.2",
            "group": "The combobox design pattern must be valid for ARIA 1.2"
        }
    },
    rulesets: [{ 
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"], 
        "num": ["4.1.2"], 
        "level": eRulePolicy.VIOLATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_ONE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (!VisUtil.isNodeVisible(ruleContext) || RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }
        let pattern = patternDetect(ruleContext);

        // We don't assess native select elements here
        if (pattern === "implicit") {
            return null;
        }

        let tagName = ruleContext.tagName.toLowerCase();
        let expanded = (RPTUtil.getAriaAttribute(ruleContext, "aria-expanded") || "").trim().toLowerCase() === "true";
        let editable = tagName === "input" && (!ruleContext.hasAttribute("type") || ruleContext.getAttribute("type").toLowerCase() === "text");

        let key = context["dom"].rolePath;
        if (key) {
            let cache = getCache(ruleContext.ownerDocument, "combobox", {});
            cache[key] = {
                "inputElement": editable ? ruleContext : null,
                "pattern": pattern,
                "expanded": expanded
            };
            setCache(ruleContext.ownerDocument, "combobox", cache);
        } else {
            // No xpath?
            return null;
        }

        if (pattern === "1.0") {
            return RulePass("Pass_1.0");
        } else if (pattern === "1.1") {
            return RuleFail("Fail_1.1");
        } else if (pattern === "1.2") {
            return RulePass("Pass_1.2");
        }
    }
}