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
import { VisUtil } from "../util/VisUtil";
import { AccNameUtil } from "../util/AccNameUtil";

export const object_text_exists: Rule = {
    id: "object_text_exists",
    context: "dom:object",
    refactor: {
        "WCAG20_Object_HasText": {
            "pass": "pass",
            "fail_no_text_alternative": "fail_no_text_alternative"
        }
    },
    help: {
        "en-US": {
            "group": "object_text_exists.html",
            "pass": "object_text_exists.html",
            "fail_no_text_alternative": "object_text_exists.html"
        }
    },
    messages: {
        "en-US": {
            "group": "<object> element must have a text alternative for the content rendered by the object",
            "pass": "<object> element has a text alternative",
            "fail_no_text_alternative": "An <object> element does not have a text alternative"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: "8fc3b6",
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        
        // Detect if this object is of type text, by checking the object type in the case it is text then do not trigger this rule
        if (ruleContext.hasAttribute("type") && (ruleContext.getAttribute("type")).indexOf("text") !== -1) {
            return null;
        }
        
        // ignore if an explicit role is specified: including 'presentation', 'none', 'application', 'document' or 'img'
        // this case will be covered in other rules
        let role = ruleContext.getAttribute("role");
        if (role) {
            return null;
        }

        // Per ACT, ignore embedded HTML files
        let data = ruleContext.getAttribute("data");
        let ext = data && typeof data === typeof "" ? data.substring(data.lastIndexOf(".")) : "";
        if (ext === ".html" || ext === ".htm") {
            return null;
        }
        
        const pair = AccNameUtil.computeAccessibleName(ruleContext);
        const passed = pair && pair.name && pair.name.trim().length > 0;
        //let passed = ARIAMapper.computeName(ruleContext).trim().length > 0;
        if (passed) {
            return RulePass("pass");
        } else {
            return RuleFail("fail_no_text_alternative");
        }
    }
}