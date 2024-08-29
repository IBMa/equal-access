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

export let aria_attribute_redundant: Rule = {
    id: "aria_attribute_redundant",
    context: "dom:*[aria-required], dom:*[aria-autocomplete], dom:*[aria-readonly], dom:*[aria-disabled], dom:*[aria-placeholder]" 
            + ", dom:*[aria-checked], dom:*[aria-hidden], dom:*[aria-valuemax], dom:*[aria-valuemin], dom:*[aria-colspan]"
            + ", dom:*[aria-rowspan]",
    help: {
        "en-US": {
            "pass": "aria_attribute_redundant.html",
            "fail_redundant": "aria_attribute_redundant.html",
            "group": "aria_attribute_redundant.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The ARIA attribute is not redundant with a corresponding HTML attribute",
            "fail_redundant": "The ARIA attribute \"{0}\" is redundant with the HTML attribute \"{1}\"",
            "group": "An ARIA attribute should not be redundant with a corresponding HTML attribute"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        // dependency check: if the ARIA attribute is completely invalid, skip this check
        let invalidAttributes = AriaUtil.getInvalidAriaAttributes(ruleContext);
        if (invalidAttributes && invalidAttributes.length > 0)
            return null;

        // if conflict already reported, ignore reporting overlap
        let conflictAttributes = AriaUtil.getConflictAriaAndHtmlAttributes(ruleContext);
        if (conflictAttributes && conflictAttributes.length > 0)
            return null;

        let domAttributes = ruleContext.attributes;
        let ariaAttrs = [];
        let htmlAttrs = [];
        if (domAttributes) {
            for (let i = 0; i < domAttributes.length; i++) {
                let attrName = domAttributes[i].name.trim().toLowerCase(); 
                let attrValue = ruleContext.getAttribute(attrName);
                if (attrValue === '') attrValue = null;
                if (attrName.substring(0, 5) === 'aria-') 
                    ariaAttrs.push({name: attrName, value: attrValue});
                else 
                    htmlAttrs.push({name: attrName, value: attrValue});
            }
        }
        let ret = [];
        for (let i = 0; i < ariaAttrs.length; i++) {
            const examinedHtmlAtrNames = AriaUtil.getConflictOrOverlappingHtmlAttribute(ariaAttrs[i], htmlAttrs, 'overlapping');
            if (examinedHtmlAtrNames === null) continue;
            examinedHtmlAtrNames.forEach(item => {
                if (item['result'] === 'Pass') { //pass
                    ret.push(RulePass("pass"));
                } else if (item['result'] === 'Failed') { //failed
                    ret.push(RuleFail("fail_redundant", [ariaAttrs[i]['name'], item['attr']]));
                }
            });    
        }    
        if (ret.length > 0)
            return ret;
        return null;
    }
}