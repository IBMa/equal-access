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
import { CacheUtil } from "../util/CacheUtil";

export const meta_redirect_optional: Rule = {
    id: "meta_redirect_optional",
    context: "dom:meta[http-equiv][content]",
    refactor: {
        "WCAG20_Meta_RedirectZero": {
            "pass": "pass",
            "fail": "fail",
            "fail_longrefresh": "fail_longrefresh"
        }
    },
    help: {
        "en-US": {
            "group": "meta_redirect_optional.html",
            "pass": "meta_redirect_optional.html",
            "fail": "meta_redirect_optional.html",
            "fail_longrefresh": "meta_redirect_optional.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Page should not automatically refresh without warning or option to turn it off or adjust the time limit",
            "pass": "Rule Passed",
            "fail": "Check page does not automatically refresh without warning or options",
            "fail_longrefresh": "Check page does not automatically refresh without warning or options"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    // Removed ACT bisz58 AAA
    /**act: [{ 
        "bc659a" : {
            "pass": "pass",
            "fail": "fail",
            "fail_longrefresh": "pass"
        }
    }],*/
    act: [ "bisz58"],  // fail even if a page is redirected after more than 20 hours (7200)
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh') {
            return null;
        }

        let doc = ruleContext.ownerDocument;
        if (!doc) return;

        // check if the rule already passed or failed: only the first one tridders if multiple
        if (CacheUtil.getCache(doc, "meta_redirect_optional_done", false))
            return null;    

        let content = ruleContext.getAttribute("content").toLowerCase();
        if (!content || content.trim().length ===0)
            return null;

        let time:number = -1;
        if (content.match(/^\d+$/)) 
            time = parseInt(content);
        else if (content.match(/^\d+;/)) {
            let pos = content.indexOf(";");
            time = parseInt(content.substring(0, pos));
        }
        // Invalid content field
        if (time === -1) {
            return null;
        }

        CacheUtil.setCache(doc, "meta_redirect_optional_done", true);
        if (time === 0)
            return RulePass("pass");
        else if (time < 72001)
            return RuleFail("fail");
        
        return RuleFail("fail_longrefresh");
    }
}