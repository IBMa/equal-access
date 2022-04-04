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
import { Rule, RuleResult, RuleFail, RuleContext, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";

export let aria_attribute_overlaps: Rule = {
    id: "aria_attribute_overlaps",
    context: "dom:*[aria-required], dom:*[aria-autocomplete], dom:*[aria-readonly], dom:*[aria-disabled], dom:*[aria-placeholder]" 
            + ", dom:*[aria-checked], dom:*[aria-hidden], dom:*[aria-valuemax], dom:*[aria-valuemin], dom:*[aria-colspan]"
            + ", dom:*[aria-rowspan]",
    help: {
        "en-US": {
            "pass": "aria_attribute_overlaps.html",
            "fail_conflict": "aria_attribute_overlaps.html",
            "group": "aria_attribute_overlaps.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "potential_overlap": "The ARIA attribute \"{0}\" should not overlap with the HTML attribute \"{0}\"",
            "group": "An ARIA attribute should not overlap with the corresponding HTML attribute"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["4.1.2"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // dependency check: if the ARIA attribute is completely invalid, skip this check
        if (RPTUtil.getCache(ruleContext, "aria_semantics_attribute", "") === "Fail_1") return null;
         
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
        console.log('node name=' + ruleContext.nodeName + ', arias=' + JSON.stringify(ariaAttrs) +", natives="+ JSON.stringify(htmlAttrs));
        let ret = [];
        for (let i = 0; i < ariaAttrs.length; i++) {
            const examinedHtmlAtrNames = RPTUtil.getOverlappingHtmlAttribute(ariaAttrs[i], htmlAttrs);
            if (examinedHtmlAtrNames === null) continue;
            examinedHtmlAtrNames.forEach(item => {
                if (item['result'] === 'Pass') { //pass
                    ret.push(RulePass("pass"));
                    console.log('pass node name=' + ruleContext.nodeName + ', aria=' + ariaAttrs[i]['name'] +", native="+ item['attr']);
                } else if (item['result'] === 'Failed') { //failed
                    ret.push(RuleFail("potential_overlap", [ariaAttrs[i]['name'], item['attr']]));
                    console.log('fail node name=' + ruleContext.nodeName + ', aria=' + ariaAttrs[i]['name'] +", native="+ item['attr']);
                }
            });    
        }    
        return ret;
    }
}