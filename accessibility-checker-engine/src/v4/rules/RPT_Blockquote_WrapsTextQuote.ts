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

export let RPT_Blockquote_WrapsTextQuote: Rule = {
    id: "RPT_Blockquote_WrapsTextQuote",
    context: "dom:*",
    help: {
        "en-US": {
            "Pass_0": "RPT_Blockquote_WrapsTextQuote.html",
            "Potential_1": "RPT_Blockquote_WrapsTextQuote.html",
            "group": "RPT_Blockquote_WrapsTextQuote.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "If the following text is a quotation, mark it as a <q> or <blockquote> element: {0}",
            "group": "Quotations should be marked with <q> or <blockquote> elements"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.1"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const validateParams = {
            minWords: {
                value: 3,
                type: "integer"
            }
        }
        const ruleContext = context["dom"].node as Element;
        let minWords = validateParams.minWords.value;

        let passed = true;
        let walkNode = ruleContext.firstChild as Node;
        let violatedtext = null;
        while (passed && walkNode) {
            // Comply to the Check Hidden Content setting will be done by default as this rule triggers on each element
            // and for each element it only checks that single elements text nodes and nothing else. So all inner elements will be
            // covered on their own. Currently for this rule by default Check Hidden Content will work, as we are doing
            // a node walk only on siblings so it would not get text nodes from other siblings at all.
            // In the case in the future something chnges, just need to add && !RPTUtil.shouldNodeBeSkippedHidden(walkNode) to the below
            // if.
            if (walkNode.nodeName == "#text") {
                let txtVal = walkNode.nodeValue;
                // Do the regex tests first - should be fast

                // Remove apostrophe's
                txtVal = txtVal.replace(/(\S)'(\S)/g, "$1$2");
                let dblQuotes = txtVal.match(/("[^"]+")/g);
                let snglQuotes = txtVal.match(/('[^']+')/g);
                // Walk the parents - only continue testing if we found a quote, but
                // we're not already marked up
                // Also skip if we're in a script - there's lots of quotes used in scripts
                if ((dblQuotes != null || snglQuotes != null) &&
                    RPTUtil.getAncestor(walkNode, ["blockquote", "q", "script", "style"]) == null) {
                    if (dblQuotes != null) {
                        for (let i = 0; passed && i < dblQuotes.length; ++i)
                            passed = RPTUtil.wordCount(dblQuotes[i]) < minWords;
                    }
                    if (snglQuotes != null) {
                        for (let i = 0; passed && i < snglQuotes.length; ++i)
                            passed = RPTUtil.wordCount(snglQuotes[i]) < minWords;
                    }

                    // Remove any linefeed inside the quote
                    // violatedtext = txtVal.replace(new RegExp("\\r?\\n|\\r","g"),"");
                    if (dblQuotes == null) {
                        violatedtext = snglQuotes.join(", ").replace(new RegExp("\\r?\\n|\\r", "g"), "");
                    }
                    else if (snglQuotes == null) {
                        violatedtext = dblQuotes.join(", ").replace(new RegExp("\\r?\\n|\\r", "g"), "");
                    }
                    else {
                        violatedtext = dblQuotes.concat(snglQuotes).join(", ").replace(new RegExp("\\r?\\n|\\r", "g"), "");
                    }
                }
            }
            walkNode = walkNode.nextSibling;
        }

        if (!passed) {
            // Don't trigger if we're not in the body or if we're in a script or code segment
            let checkAncestor = RPTUtil.getAncestor(ruleContext, ["body", "script", "code"]);
            passed = checkAncestor == null || checkAncestor.nodeName.toLowerCase() != "body";
        }

        //if the violatedtext is longer than 69 chars, only keep the first 32, the " ... ", and the last 32 chars 
        if (!passed && violatedtext.length && violatedtext.length > 69) {
            violatedtext = violatedtext.substring(0, 32) + " ... " + violatedtext.substring(violatedtext.length - 32);
        }

        return passed ? RulePass("Pass_0") : RulePotential("Potential_1", [violatedtext]);
    }
}