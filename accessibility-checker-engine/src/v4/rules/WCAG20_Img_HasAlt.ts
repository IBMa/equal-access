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
import { VisUtil } from "../../v2/dom/VisUtil";

export let WCAG20_Img_HasAlt: Rule = {
    id: "WCAG20_Img_HasAlt",
    context: "dom:img",
    help: {
        "en-US": {
            "pass": "WCAG20_Img_HasAlt.html",
            "fail_blank_alt": "WCAG20_Img_HasAlt.html",
            "fail_no_alt": "WCAG20_Img_HasAlt.html",
            "fail_blank_title": "WCAG20_Img_HasAlt.html",
            "group": "WCAG20_Img_HasAlt.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Images has required 'alt' attribute, ARIA label or title if they convey meaning, or 'alt=\"\" if decorative",
            "fail_blank_alt": "Image 'alt' attribute value consists only of blank space(s)",
            "fail_no_alt": "The image has neither an alt atttribute nor an ARIA label or title",
            "fail_blank_title": "The image does not have an alt attribute or ARIA label and 'title' attribute value consists only of blank space(s)",
            "group": "Images require an 'alt' attribute with a short text alternative if they convey meaning, or 'alt=\"\" if decorative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "23a2a8",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        // If not visible to the screen reader, ignore
        if (VisUtil.isNodeHiddenFromAT(ruleContext))
            return null;
        
        //pass if images with a valid 'alt'    
        let alt = ruleContext.getAttribute("alt");
        if (alt !== null) {
            if (alt.trim().length > 0)
                return RulePass("pass");   
            else { 
                // alt.trim().length === 0
                if (alt.length > 0) {
                    // alt contains blank space only (alt=" ")
                    return RuleFail("fail_blank_alt");  
                } else {
                    // alt.length === 0, presentational image, title is optional, handled by other rule(s)
                    return  RulePass("pass");
                }
            }
        } else {
            // no alt
            let label = RPTUtil.getAriaLabel(ruleContext);
            if (label && label.trim().length > 0)
                return RulePass("pass");
            else {
                let title = ruleContext.getAttribute("title");
                if (title) {
                    if (title.trim().length > 0)
                        return RulePass("pass");   
                    else { 
                        // title.trim().length === 0
                        if (title.length > 0) {
                            // title contains blank space only (title=" ")
                            return RuleFail("fail_blank_title");  
                        }    
                    }
                } else {
                    // neither alt nor aria label or title 
                    return RuleFail("fail_no_alt"); 
                }  
            } 
        }
    }
}