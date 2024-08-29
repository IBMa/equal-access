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

import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { AriaUtil } from "../util/AriaUtil";
import { CommonUtil } from "../util/CommonUtil";

export let aria_eventhandler_role_valid: Rule = {
    id: "aria_eventhandler_role_valid",
    context: "dom:*[onclick],dom:*[onblur], dom:*[ondblclick], dom:*[onfocus], dom:*[onkeydown],dom:*[onkeypress], dom:*[onkeyup], dom:*[onmousedown], dom:*[onmouseup], dom:*[onmousemove], dom:*[onmouseout], dom:*[onmouseover], dom:*[onresize], dom:*[onchange]",
    refactor: {
        "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_eventhandler_role_valid.html",
            "Fail_1": "aria_eventhandler_role_valid.html",
            "group": "aria_eventhandler_role_valid.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The <{0}> element with '{1}' does not have a valid ARIA role specified",
            "group": "Elements with event handlers must have a valid ARIA role"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // Don't trigger this for SVG element for now until a determination is made (by Rich)
        // to support SVG at a point when the SVG a11y spec is ready.
        if (CommonUtil.getAncestor(ruleContext, "svg")) {
            return null;
        }

        //this rule is passed if a element has attribut role 
        //also, passed of element has any implicit roles. 
        if (AriaUtil.hasAnyRole(ruleContext, true)) {
            return RulePass("Pass_0");
        }

        //pass if this element is received focus by default
        if (CommonUtil.isfocusableByDefault(ruleContext)) {
            return RulePass("Pass_0");
        }

        //validate if this element has any of the given event handler's
        let retToken1 = new Array();
        retToken1.push(ruleContext.nodeName.toLowerCase());
        let eventArr = new Array();
        // From WCAG20_Script_UseW3CDomFunctions
        //let events = ["onblur", "onfocus", "onchange", "onclick", "oncontextmenu", "ondblclick", "onkeydown",
        //              "onkeypress", "onkeyup", "onload", "onmousedown", "onmouseup", "onmousemove", "onmouseout",
        //              "onmouseover", "onmousewheel", "onreset", "onpaste", "onresize", "onscroll",
        //              "onselect", "onsubmit", "onactivate", "ondeactivate", "onmouseenter", "onmouseleave"];
        let events = ["onblur", "onfocus", "onchange", "onclick", "ondblclick", "onkeydown",
            "onkeypress", "onkeyup", "onmousedown", "onmouseup", "onmousemove", "onmouseout",
            "onmouseover", "onresize"
        ];
        for (let i = 0; i < events.length; ++i) {
            if (ruleContext.hasAttribute(events[i]))
                eventArr.push(events[i]);
        }
        let retToken2 = new Array();
        retToken2.push(eventArr.join(", "));
        //return new ValidationResult(false, [ruleContext], '', '', [retToken1, retToken2]);
        return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
    }
}