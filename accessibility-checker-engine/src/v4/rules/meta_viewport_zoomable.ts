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

export let meta_viewport_zoomable: Rule = {
    id: "meta_viewport_zoomable",
    context: "dom:meta[name][content]",
    refactor: {
        "meta_viewport_zoom": {
            "Pass_0": "pass",
            "Potential_1": "potential_zoomable"
        }
    },
    help: {
        "en-US": {
            "group": "meta_viewport_zoomable.html",
            "pass": "meta_viewport_zoomable.html",
            "potential_zoomable": "meta_viewport_zoomable.html"
        }
    },
    messages: {
        "en-US": {
            "group": "The 'meta[name=viewport]' should not prevent the browser zooming the content",
            "pass": "The 'meta[name=viewport]' does not prevent the browser zooming the content",
            "potential_zoomable": "Confirm the 'meta[name=viewport]' with \"{0}\" can be zoomed by user"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.4.4"],
        "level": eRulePolicy.RECOMMENDATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [{
        "b4f0c3": {
            "Pass_0": "pass",
            "Potential_1": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        if (ruleContext.getAttribute("name").toLowerCase() !== 'viewport')
            return null;

        let content = ruleContext.getAttribute("content").toLowerCase();
        // neither maximum-scale nor user-scalable (default yes)
        if (!content || content.trim() === '' || (!content.includes('maximum-scale') && !content.includes('user-scalable')))
            return null;

        let user_msg = null;
        let max_msg = null;
        const props = content.split(",");
        let user_scale_value = 'yes';
        let maximum_scale_value = '2.0';
        for (const prop of props) {
            const pieces = prop.trim().split('=');
            if (pieces.length < 2) continue;
            if (prop.includes('user-scalable')) {
                user_msg = prop;
                user_scale_value = pieces[1].trim();
                if (user_scale_value.startsWith("'") || user_scale_value.startsWith('"')) {
                    user_scale_value = user_scale_value.substring(1, user_scale_value.length - 1);
                }
            } else if (prop.includes('maximum-scale')) {
                max_msg = prop;
                maximum_scale_value = pieces[1].trim();
                if (maximum_scale_value.startsWith("'") || maximum_scale_value.startsWith('"')) {
                    maximum_scale_value = maximum_scale_value.substring(1, maximum_scale_value.length - 1).trim();
                }
            }
        }

        let value = Number(user_scale_value);
        if (!isNaN(value)) {
            if (value >= 1 || value <= -1) user_scale_value = 'yes';
        }

        let maximum_scale = 2.0;
        value = Number(maximum_scale_value);
        if (!isNaN(value)) {
            if (value < 0) maximum_scale = 2.0;
            else maximum_scale = value;
        } else {
            if (maximum_scale_value === 'yes') maximum_scale = 1.0;
            else maximum_scale = 0.1;
        }

        // user-scalable is not set to 'yes', ignore maximum_scale
        if (user_scale_value !== 'yes') {
            return RulePotential("potential_zoomable", [user_msg]);
        }
        // user-scalable is 'yes', but maximum_scale is too small
        if (maximum_scale < 2.0) {
            return RulePotential("potential_zoomable", [max_msg]);
        }
        return RulePass("pass");
    }
}