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
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { VisUtil } from "../util/VisUtil";

export let svg_graphics_labelled: Rule = {
    id: "svg_graphics_labelled",
    context: "dom:svg",
    help: {
        "en-US": {
            "group": "svg_graphics_labelled.html",
            "pass": "svg_graphics_labelled.html",
            "fail_acc_name": "svg_graphics_labelled.html"
        }
    },
    messages: {
        "en-US": {
            "group": "A none decorative SVG element must have an accessible name",
            "pass": "The SVG element has an accessible name",
            "fail_acc_name": "The SVG element has no accessible name"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"], 
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [{
        "7d6734": {
            "pass": "pass",
            "fail_acc_name": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        // 1. aria-labelledby or aria-label 
        let label = RPTUtil.getAriaLabel(ruleContext);
        if (label && label.length > 0)
            return RulePass("pass");
        
        // 2. a direct child title element 
        let svgTitle = ruleContext.querySelector(":scope > title");
        if (svgTitle && RPTUtil.hasInnerContent(svgTitle))
            return RulePass("pass");

        // 3. xlink:title attribute on a link
        let linkTitle = ruleContext.querySelector("a");
        if (linkTitle && linkTitle.hasAttribute("xlink:title") && linkTitle.getAttribute("xlink:title").trim().length > 0)
            return RulePass("pass");

        /** 4. for text container elements, the text content. 
         * note the SVG text content elements are: ‘text’, ‘textPath’ and ‘tspan’.
         *  svg element can be nested. One of the purposes is to to group SVG shapes together as a collection for responsive design.
         * 
         * select text content excluded the text from the nested svg elements and their children 
         */ 
        let text = "";
        ruleContext.querySelectorAll(":scope > *").forEach((element) => {
            if (element.nodeName.toLowerCase() !== 'svg' && RPTUtil.hasInnerContent(element))
                text += RPTUtil.getInnerText(element);
        });
        if (text !== '')
            return RulePass("pass");

        // 5. aria-describedby or aria-description 
        let descby = RPTUtil.getAriaDescription(ruleContext);
        if (descby && descby.length > 0)
            return RulePass("pass");

        // 6. a direct child desc element
        let desc = ruleContext.querySelector(":scope > desc");
        if (desc && RPTUtil.hasInnerContent(desc))
            return RulePass("pass");
        
        // 7. title attribue that provides a tooltip 
        // not clear from the svg mapping spec yet, but Chrome uses svg title attribute in the accessible name, but Firefox doesn't
        if (ruleContext.hasAttribute("title") && ruleContext.getAttribute("title").trim().length > 0)
            return RulePass("pass");

        return RuleFail("fail_acc_name")
    }
}
