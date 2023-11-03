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

import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { Rule, RuleResult, RuleContext, RulePass, RuleContextHierarchy, RulePotential } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { VisUtil } from "../../v2/dom/VisUtil";

export let element_draggable_alternative: Rule = {
    id: "element_draggable_alternative",
    context: "dom:*[draggable]",
    dependencies: [],
    help: {
        "en-US": {
            "group": "element_draggable_alternative.html",
            "pass": "element_draggable_alternative.html",
            "potential_obscured": "element_draggable_alternative.html"
        }
    },
    messages: {
        "en-US": {
            "group": "When an element receives focus, it is not entirely covered by other content",
            "pass": "The element is not entirely covered by other content",
            "potential_obscured": "Confirm that when the element receives focus, it is not covered or, if covered by user action, can be uncovered without moving focus"
        }
    },
    rulesets: [{
        id: ["WCAG_2_2"],
        num: ["2.5.7"],
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        if (!VisUtil.isNodeVisible(ruleContext))
            return null;
        
        const nodeName = ruleContext.nodeName.toLocaleLowerCase(); 
          
        //ignore certain elements
        if (RPTUtil.getAncestor(ruleContext, ["pre", "code", "script", "meta"]) !== null 
            || nodeName === "body" || nodeName === "html" )
            return null;
        
        const bounds = context["dom"].bounds;    
        
        //in case the bounds not available
        if (ruleContext.getAttribute("draggable") === 'true') 
            if (ruleContext.hasAttribute("ondragstart"))
                return RulePotential("potential_alternative", [nodeName]);
            else
                return RulePotential("potential_draggable", [nodeName]);

        else if (ruleContext.getAttribute("draggable") === 'false') 
            return RulePass("pass_undraggable", [nodeName]);

        else 
            return null;
    }
}
