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

export let input_autocomplete_valid: Rule = {
    id: "input_autocomplete_valid",
    context: "dom:input[autocomplete], dom:textarea[autocomplete], dom:select[autocomplete]",
    refactor: {
        "WCAG21_Input_Autocomplete": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2",
            "Fail_attribute_incorrect": "Fail_attribute_incorrect"
        }
    },
    help: {
        "en-US": {
            "group": "input_autocomplete_valid.html",
            "Pass_0": "input_autocomplete_valid.html",
            "Fail_1": "input_autocomplete_valid.html",
            "Fail_2": "input_autocomplete_valid.html",
            "Fail_attribute_incorrect": "input_autocomplete_valid.html"
        }
    },
    messages: {
        "en-US": {
            "group": "The 'autocomplete' attribute's token(s) must be appropriate for the input form field",
            "Pass_0": "Rule Passed",
            "Fail_1": "The 'autocomplete' attribute's token(s) are not appropriate for the input form field",
            "Fail_2": "The 'autocomplete' attribute's token(s) are not appropriate for an input form field of any type",
            "Fail_attribute_incorrect": "The 'autocomplete' attribute has an incorrect value"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0"],
        "num": ["1.3.5"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    
    act: [{
        "73f2c2": {
            "Pass_0": "pass",
            "Fail_1": "fail",
            "Fail_2": "pass",
            "Fail_attribute_incorrect": "fail"
        }
    }],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const cache = {
            "tokensOnOff": ["on", "off"],
            "tokenOptionalSection": "section-",
            "tokensOptionalPurpose": ["shipping", "billing"],
            "tokensMandatoryGroup1_password": ["new-password", "current-password", "one-time-code"],
            "tokensMandatoryGroup1_multiline": ["street-address"],
            "tokensMandatoryGroup1_month": ["cc-exp"],
            "tokensMandatoryGroup1_numeric": ["cc-exp-month",
                "cc-exp-year",
                "transaction-amount",
                "bday-day",
                "bday-month",
                "bday-year"],
            "tokensMandatoryGroup1_date": ["bday"],
            "tokensMandatoryGroup1_url": ["url", "photo"],
            "tokensMandatoryGroup1_text": ["name",
                "honorific-prefix",
                "given-name",
                "additional-name",
                "family-name",
                "honorific-suffix",
                "nickname",
                "username",
                "organization-title",
                "organization",
                "address-line1",
                "address-line2",
                "address-line3",
                "address-level4",
                "address-level3",
                "address-level2",
                "address-level1",
                "country",
                "country-name",
                "postal-code",
                "cc-name",
                "cc-given-name",
                "cc-additional-name",
                "cc-family-name",
                "cc-number",
                "cc-csc",
                "cc-type",
                "transaction-currency",
                "language",
                "sex"],
            "tokensMandatoryGroup1_all": ["name",
                "honorific-prefix",
                "given-name",
                "additional-name",
                "family-name",
                "honorific-suffix",
                "nickname",
                "username",
                "new-password",
                "current-password",
                "organization-title",
                "organization",
                "street-address",
                "address-line1",
                "address-line2",
                "address-line3",
                "address-level4",
                "address-level3",
                "address-level2",
                "address-level1",
                "country",
                "country-name",
                "postal-code",
                "cc-name",
                "cc-given-name",
                "cc-additional-name",
                "cc-family-name",
                "cc-number",
                "cc-exp",
                "cc-exp-month",
                "cc-exp-year",
                "cc-csc",
                "cc-type",
                "transaction-currency",
                "transaction-amount",
                "language",
                "bday",
                "bday-day",
                "bday-month",
                "bday-year",
                "sex",
                "url",
                "photo"],
            "tokensOptionalGroup2": ["home",
                "work",
                "mobile",
                "fax",
                "pager"],

            "tokensMandatoryGroup2_tel": ["tel"],
            "tokensMandatoryGroup2_email": ["email"],
            "tokensMandatoryGroup2_url": ["impp"],
            "tokensMandatoryGroup2_text": ["tel-country-code",
                "tel-national",
                "tel-area-code",
                "tel-local",
                "tel-local-prefix",
                "tel-local-suffix",
                "tel-extension"],
            "tokensMandatoryGroup2_all": ["tel",
                "tel-country-code",
                "tel-national",
                "tel-area-code",
                "tel-local",
                "tel-local-prefix",
                "tel-local-suffix",
                "tel-extension",
                "email",
                "impp"]
        }
        let valid_values = [];
        for (var key in cache)
            valid_values=valid_values.concat(cache[key]);
        
        const ruleContext = context["dom"].node as Element;
        let foundMandatoryToken = false;
        let foundRecognizedToken = true;
        let nodeName = ruleContext.nodeName.toLowerCase();
        if (!VisUtil.isNodeVisible(ruleContext) ||
            RPTUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        let type = ruleContext.hasAttribute("type") ? ruleContext.getAttribute("type").trim().toLowerCase() : "text";

        let autocompleteAttr = ruleContext.getAttribute("autocomplete").trim().toLowerCase();

        let tokens = autocompleteAttr.split(/\s+/);
        if (tokens.length === 0 || autocompleteAttr.length === 0) {
            return null;
        }
        
        if (!tokens.every(r => valid_values.includes(r) || r.startsWith(cache['tokenOptionalSection'])))
            return RuleFail("Fail_attribute_incorrect");
        
        let tokensMandatoryGroup1 = [];
        let tokensMandatoryGroup2 = [];

        if (nodeName === "textarea" || nodeName === "select") {
            // accept all tokens
            tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_all;
            tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
        } else if (nodeName === "input") {
            // handle the various 'input' types
            switch (type) {

                // Disable check for input type=hidden for now based on scrum discussion
                /*
                case "hidden":
                    // accept all tokens
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_all;
                    tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
                    break;
                */

                case "text":
                case "search":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_text.concat(cache.tokensMandatoryGroup1_password,
                        cache.tokensMandatoryGroup1_url,
                        cache.tokensMandatoryGroup1_numeric,
                        cache.tokensMandatoryGroup1_month,
                        cache.tokensMandatoryGroup1_date);
                    tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_all;
                    break;
                case "password":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_password;
                    break;
                case "url":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_url;
                    tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_url;
                    break;
                case "email":
                    tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_email;
                    break;
                case "tel":
                    tokensMandatoryGroup2 = cache.tokensMandatoryGroup2_tel;
                    break;
                case "number":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_numeric;
                    break;
                case "month":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_month;
                    break;
                case "date":
                    tokensMandatoryGroup1 = cache.tokensMandatoryGroup1_date;
                    break;
                default:
                    // unsupported type for this rule.
                    return null;
            }

        } else {
            // should never get here.
            return null;
        }

        // Disable check for input type=hidden for now based on scrum discussion
        let autofillMantle = /* (nodeName==="input" && type==="hidden") ? "anchor" : */ "expectation";

        if (autofillMantle === "expectation") {
            // check on|off for expectation mantle.
            if (tokens.includes("on") || tokens.includes("off")) {
                // on|off should be the only token
                if (tokens.length === 1) {
                    return RulePass(1);
                } else {
                    return RuleFail(2);
                }
            }
        }

        // check detail autofill tokens
        let currIndex = 0;
        let currRecognizedIndex = 0;

        // check optional 'section-*' tokens
        if (tokens[currIndex].startsWith(cache.tokenOptionalSection) &&
            tokens[currIndex].length > 8) {
            currIndex++; // consume token
            currRecognizedIndex++;
        }

        // check optional 'shipping|billing' tokens
        if (tokens.length > currIndex &&
            cache.tokensOptionalPurpose.includes(tokens[currIndex])) {
            currIndex++; // consume  token
            currRecognizedIndex++;
        }

        // check either mandatory group 1 or 2 tokens
        if (tokens.length > currIndex) {
            // check mandatory group 1
            if (tokensMandatoryGroup1.includes(tokens[currIndex])) {
                foundMandatoryToken = true;
                currIndex++;
            } else {
                // check optional tokens for group 2
                if (cache.tokensOptionalGroup2.includes(tokens[currIndex])) {
                    currIndex++;
                }
                // check mandatory group 2
                if (tokensMandatoryGroup2.includes(tokens[currIndex])) {
                    foundMandatoryToken = true;
                    currIndex++;
                }
            }
        }

        // check either mandatory group 1 or 2 tokens
        if (tokens.length > currRecognizedIndex) {
            // check mandatory group 1
            if (cache.tokensMandatoryGroup1_all.includes(tokens[currRecognizedIndex])) {
                foundRecognizedToken = true;
                currRecognizedIndex++;
            } else {
                // check optional tokens for group 2
                if (cache.tokensOptionalGroup2.includes(tokens[currRecognizedIndex])) {
                    currRecognizedIndex++;
                }
                // check mandatory group 2
                if (cache.tokensMandatoryGroup2_all.includes(tokens[currRecognizedIndex])) {
                    foundRecognizedToken = true;
                    currRecognizedIndex++;
                }
            }
        }

        // Only pass if we have seen either of the mandatory groups and all tokens have been consumed
        if (foundMandatoryToken && tokens.length === currIndex) {
            return RulePass("Pass_0");
        } else if (foundRecognizedToken && tokens.length === currRecognizedIndex) {
            return RuleFail("Fail_2");
        } else {
            return RuleFail("Fail_1");
        }
    }
}