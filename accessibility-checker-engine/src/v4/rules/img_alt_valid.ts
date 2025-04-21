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
import { VisUtil } from "../util/VisUtil";

export const img_alt_valid: Rule = {
    id: "img_alt_valid",
    context: "dom:img",
    refactor: {
        "WCAG20_Img_HasAlt": {
            "pass": "pass",
            "fail_blank_alt": "fail_blank_alt",
            "fail_no_alt": "fail_no_alt",
            "fail_blank_title": "fail_blank_title"}
    },
    help: {
        "en-US": {
            "pass": "img_alt_valid.html",
            "fail_blank_alt": "img_alt_valid.html",
            "fail_no_alt": "img_alt_valid.html",
            "fail_blank_title": "img_alt_valid.html",
            "group": "img_alt_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "The image has an accessible name or is correctly marked as decorative or redundant",
            "fail_blank_alt": "Image 'alt' attribute value consists only of blank space(s)",
            "fail_no_alt": "The image has neither an accessible name nor is marked as decorative or redundant",
            "fail_blank_title": "The image does not have an 'alt' attribute or ARIA label, and the 'title' attribute value consists only of blank space(s)",
            "group": "Images must have accessible names unless they are decorative or redundant"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "23a2a8",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLImageElement;
        // JOHO - for AI need image src
        // const imgSrc =  ruleContext.getAttribute('src');
        const imgSrc =  new URL(ruleContext.src, window.location.href).href;
        // If not visible to the screen reader, ignore
        if (VisUtil.isNodeHiddenFromAT(ruleContext))
            return null;
        
        if (AriaUtil.getAriaLabel(ruleContext).trim().length !== 0) {
            // the img has non-empty aria label
            return RulePass("pass");
        }

        let alt = ruleContext.hasAttribute("alt") ? ruleContext.getAttribute("alt") : null;
        
        // check title attribute
        if (alt === null) {
            // the img has no alt or attribute, examine the title attribute
            let title = ruleContext.hasAttribute("title") ? ruleContext.getAttribute("title") : null;
            if (title === null || title.length === 0) {
                // no title or title is empty, examine alt further
                if (alt === null) {
                    let role = AriaUtil.getResolvedRole(ruleContext, false);
                    if (role === 'presentation' || role === 'none')
                        return RulePass("pass");
                    
                    return RuleFail("fail_no_alt", ["ai-Context", imgSrc]);
                }    
                if (alt.length === 0)
                    return RulePass("pass"); 
            } else {
                if (title.trim().length === 0) {
                    // title contains blank space only (title="  ")
                    return RuleFail("fail_blank_title", ["ai-Context", imgSrc]); 
                }
                // title contains some text (title="some text")
                return RulePass("pass");
            }
        } else {
            if (alt.length === 0 || alt.trim().length > 0) {
                // the img has empty alt (alt="") or non-empty alt (alt="some text")
                return RulePass("pass"); 
            } else {
                // alt contains blank space only (alt=" ")
                return RuleFail("fail_blank_alt", ["ai-Context", imgSrc]); 
            }    
        }        
    }
}