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

import { DOMUtil } from "../../v2/dom/DOMUtil";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let HAAC_Aria_Or_HTML5_Attr: Rule = {
    id: "HAAC_Aria_Or_HTML5_Attr",
    context: "dom:*[aria-required], dom:*[aria-autocomplete], dom:*[aria-readonly], dom:*[aria-disabled], dom:*[aria-placeholder]",
    help: {
        "en-US": {
            "Pass_0": "HAAC_Aria_Or_HTML5_Attr.html",
            "Fail_1": "HAAC_Aria_Or_HTML5_Attr.html",
            "group": "HAAC_Aria_Or_HTML5_Attr.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "HTML5 attribute is in conflict with the associated ARIA attribute used on an input element",
            "group": "HTML5 attributes must not conflict with the associated ARIA attribute used on an input element"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["3.3.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        let passed = true;
        if (ruleContext.hasAttribute("required") && ruleContext.hasAttribute("aria-required") &&
            ruleContext.getAttribute("aria-required").trim().toLowerCase() == "false") {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("placeholder") && ruleContext.hasAttribute("aria-placeholder")) {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("aria-autocomplete")) {
            let ariaAutoCompleteAttr = ruleContext.getAttribute("aria-autocomplete").trim().toLowerCase();
            let myNode = ruleContext;
            let html5AutoCompleteAttr = null;

            // There is no need to do a consideration for hidden in this node walk if the ruleContext node is hidden then
            // this rule will not trigger as hidden takes inheritance from the parent nodes that this is walking up to.
            // In the case that we ever need to consider hidden for this case need to add if (RPTUtil.shouldNodeBeSkippedHidden(myNode)
            // and continue to the next node.
            while ((myNode != null) && (myNode.nodeName.toLowerCase() != 'html') && (!(myNode.hasAttribute("autocomplete")))) {
                myNode = DOMUtil.parentElement(myNode);
            }

            if ((myNode != null) && (myNode.hasAttribute("autocomplete"))) {
                html5AutoCompleteAttr = myNode.getAttribute("autocomplete").trim().toLowerCase();
            }

            // if HTML5 autocomplete attribute is specified and conflicting with aria tag
            if ((html5AutoCompleteAttr != null) &&
                (html5AutoCompleteAttr == "on" &&
                    ariaAutoCompleteAttr == "none")) {
                passed = false;
            }
        }
        if (passed && ruleContext.hasAttribute("readonly") && ruleContext.hasAttribute("aria-readonly") &&
            ruleContext.getAttribute("aria-readonly").trim().toLowerCase() == "false") {
            passed = false;
        }
        if (passed && ruleContext.hasAttribute("aria-disabled")) {
            // && ruleContext.getAttribute("aria-disabled").trim().toLowerCase() == "false"){
            let ariaDisabledAttr = ruleContext.getAttribute("aria-disabled").trim().toLowerCase();
            let myNode = ruleContext;
            let html5DisabledAttr: boolean | string = myNode.hasAttribute("disabled");

            // There is no need to do a consideration for hidden in this node walk if the ruleContext node is hidden then
            // this rule will not trigger as hidden takes inheritance from the parent nodes that this is walking up to.
            // In the case that we ever need to consider hidden for this case need to add if (RPTUtil.shouldNodeBeSkippedHidden(myNode)
            // and continue to the next node.
            while ((myNode != null) && (myNode.nodeName.toLowerCase() != 'html') && (!(myNode.hasAttribute("disabled")))) {
                myNode = DOMUtil.parentElement(myNode);
            }

            if ((myNode != null) && (myNode.hasAttribute("disabled"))) {
                html5DisabledAttr = myNode.getAttribute("disabled");
            }

            // if HTML5 disabled attribute is specified and conflicting with aria tag
            // Note RPT WebApp has a bug that inject disabled or DISABLED as the attribute value.
            if (((html5DisabledAttr == true || html5DisabledAttr == "" || html5DisabledAttr == "DISABLED" || html5DisabledAttr == "disabled") && myNode.nodeName.toLowerCase() != 'html') &&
                (ariaDisabledAttr == "false")) {
                passed = false;
            }
        }

        //return new ValidationResult(passed, [ruleContext], '', '', []);
        if (passed) {
            return RulePass("Pass_0");
        } else {
            return RuleFail("Fail_1");
        }
    }
}