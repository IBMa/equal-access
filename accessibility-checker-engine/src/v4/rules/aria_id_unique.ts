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
import { CommonUtil } from "../util/CommonUtil";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";
import { VisUtil } from "../util/VisUtil";

export let aria_id_unique: Rule = {
    id: "aria_id_unique",
    context: "dom:*",
    refactor: {
        "Rpt_Aria_ValidIdRef": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1"}
    },
    help: {
        "en-US": {
            "Pass_0": "aria_id_unique.html",
            "Fail_1": "aria_id_unique.html",
            "group": "aria_id_unique.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "The 'id' \"{0}\" specified for the ARIA property '{1}' value is not valid",
            "group": "The ARIA property must reference a non-empty unique id of an existing element that is visible"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["4.1.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: 6a7281 - Need a separate reason code when the property is not required. ACT says it's okay to be
    // invalid when not required. I think we should still fail, but flag it as a different reason so that we can have a subset
    // aligns with ACT.
    act: ["59796f", "6a7281"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        let pass = true;
        let attrNameArr = new Array();
        let nonExistantIDs = new Array();
        let ownerDocument = FragmentUtil.getOwnerFragment(ruleContext);
        let contextAttributes = ruleContext.attributes;
        let idTokens = new Array();
        let testedReferences = 0;

        if (contextAttributes) {
            for (let i = 0, attrLength = contextAttributes.length; i < attrLength; i++) {
                pass = true;
                let attrName = contextAttributes[i].name;
                if (AriaUtil.isDefinedAriaAttribute(ruleContext, attrName)) {
                    let dataTypes = ARIADefinitions.propertyDataTypes[attrName];
                    if (dataTypes && dataTypes.type) {
                        let supportsOneIDRef = (dataTypes.type == "http://www.w3.org/2001/XMLSchema#idref") ? true : false;
                        //If the data type supports one or more id refs do error checking
                        if (supportsOneIDRef || (dataTypes.type == "http://www.w3.org/2001/XMLSchema#idrefs")) {
                            testedReferences++;
                            let nodeValueLength = CommonUtil.normalizeSpacing(contextAttributes[i].nodeValue).length;
                            let idArray = contextAttributes[i].nodeValue.split(" ");

                            // Check for an empty ID Ref
                            if (nodeValueLength < 1) {
                                pass = false;
                                idTokens.push("\"" + contextAttributes[i].nodeValue + "\"");
                            }
                            // check to see if too many IDRefs
                            else if (supportsOneIDRef) {
                                //If has too many IDRefs it is an error
                                if (nodeValueLength >= 1) {
                                    if (idArray.length > 1) {
                                        pass = false;
                                        // Need to capture all the IDRefs for idTokens
                                        for (let z = 0, length = idArray.length; z < length; ++z) {
                                            if (idArray[z] != "") {
                                                idTokens.push(idArray[z]);
                                            }
                                        }
                                    }
                                }
                            }
                            // check to see if id refs are invalid
                            if (pass && nodeValueLength >= 1) {
                                for (let j = 0, length = idArray.length; j < length; ++j) {
                                    if (idArray[j].length > 0) { // it is an empty string if spaces are one after the other
                                        // Get the element by Id
                                        let elementById = ownerDocument.getElementById(idArray[j]);

                                        // Pass if the element exists
                                        pass = elementById != null;

                                        // If the element exists and this is an aria attribute that doesn't support hidden ID reference
                                        // then perform a isNodeVisible check, in the case the node is not visible then we return
                                        // false and true otherwise.
                                        if (pass && !dataTypes.hiddenIDRefSupported) {
                                            pass = VisUtil.isNodeVisible(elementById);
                                        }

                                        if (!pass) {
                                            if (idArray[j] != "") {
                                                idTokens.push(idArray[j]);
                                            }
                                        }
                                        // Only one of the id references need to be valid to mark the rule as passed.
                                        // Therefore if we find a single visible element then stop checking and mark as
                                        // passed.
                                        else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!pass) attrNameArr.push(attrName);
                }
            }
        }
        let passed = attrNameArr.length == 0;
        let retToken1 = new Array();
        let retToken2 = new Array();
        let retToken3 = new Array();
        if (!passed) {

            retToken2.push(attrNameArr.join(", "));
            retToken3.push(ruleContext.nodeName.toLowerCase());
            if (idTokens.length > 0) {
                retToken1.push(idTokens.join(", "));
            }
        }

        //return new ValidationResult(passed, [ruleContext], attrNameArr, '', passed == true ? [] : [retToken1, retToken2, retToken3]);
        if (testedReferences == 0) {
            return null;
        } else if (!passed) {
            return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString(), retToken3.toString()]);
        } else {
            return RulePass("Pass_0");
        }
    }
}