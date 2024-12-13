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
import { CommonUtil } from "../util/CommonUtil";

export const asciiart_alt_exists: Rule = {
    id: "asciiart_alt_exists",
    context: "dom:pre, dom:listing, dom:xmp, dom:plaintext",
    refactor: {
        "RPT_Pre_ASCIIArt": {
            "Pass_0": "Pass_0",
            "Potential_1": "Potential_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "asciiart_alt_exists.html",
            "Potential_1": "asciiart_alt_exists.html",
            "group": "asciiart_alt_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that ASCII art has a text alternative",
            "group": "ASCII art must have a text alternative"
        }
    },
    /**
     * Decision in planning 9/7/23 that this rule causes more reviews that we see actual problems in content, so turn these rules off
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.1.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    */
    rulesets: [],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        // Fix for IDWB writers. Don't trigger if content is in a code element.  The code element is searched for
        // in various places because of the weird way various browsers render <code><pre></pre></code.  Firefox,
        // HtmlUnit and Chrome all render differently.  Firefox: <code></code><pre></pre>  HtmlUnit: </code><pre><code></code></pre>
        // See unit test CodeElementAbovePreElement.html.  Don't know how RPT renders, so cover all the bases.
        if (ruleContext.nodeName.toLowerCase() == "pre") {
            if ((ruleContext.previousSibling && ruleContext.previousSibling.nodeName.toLowerCase() == "code") ||
                ruleContext.getElementsByTagName("code").length > 0 ||
                CommonUtil.getAncestor(ruleContext, "code")) {

                return RulePass("Pass_0");
            }
        }

        let passed = true;
        let txtValue = CommonUtil.getInnerText(ruleContext);
        let nonAlphaNumericNorSpaceCount = 0;
        let alphNumSameCharacterCount = 0;
        let lastCharacter = "";

        // Iterate through the text content
        for (let idx = 0; passed && (idx < txtValue.length); ++idx) {
            let chStr = txtValue.substr(idx, 1);
            // Check if it is alphanumeric or punctuation
            if (/[\w!@#$%&\*().,?\[\]{}<>=":\/\\-]/.test(chStr)) {
                // Detect same character sequence
                if (lastCharacter == chStr) {
                    alphNumSameCharacterCount = alphNumSameCharacterCount + 1;;
                } else {
                    alphNumSameCharacterCount = 0;
                }
            } else if (/\s/.test(chStr)) {
                alphNumSameCharacterCount = 0;
            } else {
                nonAlphaNumericNorSpaceCount = nonAlphaNumericNorSpaceCount + 1;
                alphNumSameCharacterCount = 0;
            }
            lastCharacter = chStr;

            // Make the decision
            if (nonAlphaNumericNorSpaceCount >= 5 || alphNumSameCharacterCount >= 4) {
                passed = false;
            }
        }
        if (passed) return RulePass("Pass_0");
        if (!passed) return RulePotential("Potential_1");
    }
}