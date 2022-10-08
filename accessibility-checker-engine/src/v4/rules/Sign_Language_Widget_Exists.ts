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

import { AncestorUtil } from "../../v2/checker/accessibility/util/ancestor";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";

export let Sign_Language_Widget_Exists: Rule = {
    id: "Sign_Language_Widget_Exists",
    context: "dom:body",
    help: {
        "en-US": {
            "Pass_0": "Sign_Language_Widget_Exists.html",
            "Fail_1": "Sign_Language_Widget_Exists.html",
            "Potential_2": "Sign_Language_Widget_Exists.html",
            "group": "Sign_Language_Widget_Exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Page has a sign language widget",
            "Fail_1": "Page doesn't have a Sign Language Widget",
            "Potential_2": "Page doesn't have a Sign Language Widget potential",
            "group": "Page doesn't have a Sign Language Widget Error"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["41.2.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        if (AncestorUtil.isFrame(contextHierarchies)) {
            return null;
        }
        const scope = context["dom"].node as Element;
        let signLanguageWidget = scope.querySelectorAll("#DeafTranslate");
        if (signLanguageWidget.length) return RulePass("Pass_0");
        signLanguageWidget = scope.querySelectorAll("#SignLanguage");
        if (signLanguageWidget.length) return RulePass("Pass_0");
        signLanguageWidget = scope.querySelectorAll(".sign-language");
        if (signLanguageWidget.length) return RulePass("Pass_0");
        signLanguageWidget = scope.querySelectorAll(".mr-tooltip");
        if (signLanguageWidget.length) return RulePass("Pass_0");
        signLanguageWidget = scope.querySelectorAll("[alt='DEAF']");
        if (signLanguageWidget.length) return RulePass("Pass_0");

        signLanguageWidget = scope.querySelectorAll(
            'script[src*="/integrator.js"],script[src*="/tooltip_add.js"],script[src*="/signsplayer.js"]'
        );
        if (signLanguageWidget.length) {
            return RulePass("Pass_0");
        }
        else {
            console.log(scope.innerHTML);
            return RuleFail("Fail_1");
        }
    }
}