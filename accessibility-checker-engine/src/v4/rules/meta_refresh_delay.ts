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

import { Rule, RuleResult, RuleContext, RulePotential, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { CacheUtil } from "../util/CacheUtil";

export const meta_refresh_delay: Rule = {
    id: "meta_refresh_delay",
    context: "dom:meta[http-equiv][content]",
    refactor: {
        "RPT_Meta_Refresh": {
            "Pass_0": "pass",
            "Potential_1": "potential_refresh"
        }
    },
    help: {
        "en-US": {
            "group": "meta_refresh_delay.html",
            "pass": "meta_refresh_delay.html",
            "potential_refresh": "meta_refresh_delay.html"
        }
    },
    messages: {
        "en-US": {
            "group": "Pages should not refresh automatically",
            "pass": "Pages do not refresh automatically",
            "potential_refresh": "Verify page is not being caused to refresh automatically",
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["2.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    //act: [ "bisz58", "bc659a" ],
    act: [ "bc659a" ],  // pass if a page is redirected after more than 20 hours (7200)
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.getAttribute("http-equiv").toLowerCase() !== 'refresh')
            return null;

        let doc = ruleContext.ownerDocument;
        if (!doc) return;

        // check if the rule already passed: the first one takes priority
        if (CacheUtil.getCache(doc, "meta_refresh_delay_done", false))
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

        CacheUtil.setCache(doc, "meta_refresh_delay_done", true);
        if (time === 0) 
            return RulePass("pass");
        return RulePotential("potential_refresh");
    }
}