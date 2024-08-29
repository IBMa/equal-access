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
import { RPTUtil } from "../util/AriaUtil";

export let element_mouseevent_keyboard: Rule = {
    id: "element_mouseevent_keyboard",
    context: "dom:*[ondblclick], dom:*[onmousemove], dom:*[onmousedown], dom:*[onmouseup], dom:*[onmouseover], dom:*[onmouseout], dom:*[onclick]",
    refactor: {
        "RPT_Elem_EventMouseAndKey": {
            "Pass_0": "Pass_0",
            "Manual_1": "Manual_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "element_mouseevent_keyboard.html",
            "Manual_1": "element_mouseevent_keyboard.html",
            "group": "element_mouseevent_keyboard.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Manual_1": "Confirm the <{0}> element with mouse event handler(s) '{1}' has a corresponding keyboard handler(s)",
            "group": "All interactive content with mouse event handlers must have equivalent keyboard access"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.1.1"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let nodeName = ruleContext.nodeName.toLowerCase();
        let passed = ruleContext.hasAttribute("href") ||
            (!ruleContext.hasAttribute("ondblclick") &&
                !ruleContext.hasAttribute("onmousemove") &&
                (!ruleContext.hasAttribute("onmousedown") || ruleContext.hasAttribute("onkeydown")) &&
                (!ruleContext.hasAttribute("onmouseup") || ruleContext.hasAttribute("onkeyup")) &&
                (!ruleContext.hasAttribute("onmouseover") || ruleContext.hasAttribute("onfocus")) &&
                (!ruleContext.hasAttribute("onmouseout") || ruleContext.hasAttribute("onblur")) &&
                (!ruleContext.hasAttribute("onclick") || ruleContext.hasAttribute("onkeypress") ||
                    nodeName == "a" || nodeName == "button"));

        let failedMouseEvents = new Array();
        if (!passed) {
            //store and display event name and node name in the tokens
            if (ruleContext.hasAttribute("ondblclick")) {
                failedMouseEvents.push("ondblclick");
            }
            if (ruleContext.hasAttribute("onmousemove")) {
                failedMouseEvents.push("onmousemove");
            }
            if (ruleContext.hasAttribute("onmousedown") && !ruleContext.hasAttribute("onkeydown")) {
                failedMouseEvents.push("onmousedown");
            }
            if (ruleContext.hasAttribute("onmouseup") && !ruleContext.hasAttribute("onkeyup")) {
                failedMouseEvents.push("onmouseup");
            }
            if (ruleContext.hasAttribute("onmouseover") && !ruleContext.hasAttribute("onfocus")) {
                failedMouseEvents.push("onmouseover");
            }
            if (ruleContext.hasAttribute("onmouseout") && !ruleContext.hasAttribute("onblur")) {
                failedMouseEvents.push("onmouseout");
            }
            if (ruleContext.hasAttribute("onclick") && !ruleContext.hasAttribute("onkeypress")) {
                if (!(nodeName == "a" || nodeName == "button"))
                    failedMouseEvents.push("onclick");
            }
        }
        return passed ? RulePass("Pass_0") : RuleManual("Manual_1", [nodeName, failedMouseEvents.join(", ")]);
    }
}