/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass } from "../../../api/IEngine";
import { RPTUtil } from "../util/legacy";
import { ARIADefinitions } from "../../../aria/ARIADefinitions";
import { FragmentUtil } from "../util/fragment";
import { DOMUtil } from "../../../dom/DOMUtil";

let a11yRulesLabeling: Rule[] = [
    {
        /**
         * Description: Triggers if a region role is not labeled with an aria-label or aria-labelledby
         * also, check <section> element as this element has 'region' as implicit role
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_RegionLabel_Implicit",
        context: "dom:*[role], dom:section",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let tagName = ruleContext.tagName.toLowerCase();

            if (tagName === "section" && !RPTUtil.hasRole(ruleContext, "region", false)) {
                return null;
            }
            if (tagName !== "section" && !RPTUtil.hasRoleInSemantics(ruleContext, "region")) {
                return null;
            }

            let passed = RPTUtil.hasAriaLabel(ruleContext);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                
                return RuleFail(tagName === "section" ? "Fail_1" : "Fail_2");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple main landmarks are present and they don't have unique labels
         * Also, conside elements with implicit roles such as <main> element
         * Origin:  CI162 Web checklist checkpoint 2.4a  Rule 1182
         */
        id: "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2",
        context: "aria:main",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let contextLabel = RPTUtil.getAriaLabel(ruleContext);

            let parentDocRole = RPTUtil.getAncestorWithRole(ruleContext, "document", true);
            let mains = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "main", true, true);
            let result = null;
            for (let i = 0; i < mains.length; ++i) {
                if (mains[i] === ruleContext) continue;
                result = RulePass("Pass_0");
                let thisParentDocRole = RPTUtil.getAncestorWithRole(mains[i], "document", true);
                if (thisParentDocRole == parentDocRole) {
                    if (RPTUtil.getAriaLabel(mains[i]) === contextLabel) {
                        result = RuleFail("Fail_1");
                        break;
                    }
                }
            }
            return result;
        }
    },
    {
        /**
         * Description: Triggers if multiple main landmarks are present and
         * they don't have unique, visible labels.
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleMainsVisibleLabel_Implicit",
        context: "dom:body",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Consider the Check Hidden Content setting that is set by the rules
            //call getElementsByRoleHidden with considerImplicit flag as true 
            //so that the method returs <main> elements 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "main", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let passed = RPTUtil.hasUniqueAriaLabelledby(landmarks);

            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple banner landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleBannerLandmarks_Implicit",
        context: "aria:banner",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "banner", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleBannerLandmarks_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleBannerLandmarks_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if there are multiple banner landmarks in a set of siblings
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_OneBannerInSiblingSet_Implicit",
        context: "dom:*[role], dom:header",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (!RPTUtil.hasRoleInSemantics(ruleContext, "banner")) {
                return null;
            }

            let passed = RPTUtil.getSiblingWithRoleHidden(ruleContext, "banner", true, true) == null;
            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    },
    {
        /**
        * Description: Triggers if a complementary role is not labeled with an aria-label or aria-labelledby
         * also, consider <aside> as this element has implicit 'complementary' role.
         * Origin:  CI162 Web checklist checkpoint 2.4a
        */
        id: "Rpt_Aria_ComplementaryRequiredLabel_Implicit",
        context: "dom:*[role], dom:aside",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (!RPTUtil.hasRoleInSemantics(ruleContext, "complementary")) {
                return null;
            }

            let passed = RPTUtil.hasAriaLabel(ruleContext);
            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    },
    {
        /**
         * Description: Triggers if a complementary role is not labeled with an aria-labelledby
         * Origin:  CI162 Web checklist checkpoint 2.4a
         * Note this is a recommendation. Rpt_Aria_ComplementaryRequiredLabel is required.
         */
        id: "Rpt_Aria_ComplementaryLandmarkLabel_Implicit",
        context: "dom:*[role], dom:aside",
        dependencies: ["Rpt_Aria_ComplementaryRequiredLabel_Implicit"],
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (!RPTUtil.hasRoleInSemantics(ruleContext, "complementary")) {
                return null;
            }

            let passed = RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby");
            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (passed) {
                return RulePass("Pass_0");
            } else {
                return RuleFail("Fail_1");
            }
        }
    },

    {
        /**
         * Description: Triggers if multiple complementary landmarks are present and 
         * they don't have unique labels.
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleComplementaryLandmarks_Implicit",
        context: "aria:complementary",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "complementary", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleComplementaryLandmarks_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleComplementaryLandmarks_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Triggers if multiple contentinfo landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleContentinfoLandmarks_Implicit",
        context: "aria:contentinfo",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "contentinfo", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleContentinfoLandmarks_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleContentinfoLandmarks_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if there is more than one contentinfo nodes in a set of siblings.
         * Also, consider <footer> element which has implicit role
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit",
        context: "dom:*[role], dom:footer, dom:address",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //find out if <footer> element has siblings as <footer> has implicit contentinfo role
            if (!RPTUtil.hasRoleInSemantics(ruleContext, "contentinfo")) {
                return null;
            }

            let passed = !RPTUtil.getSiblingWithRoleHidden(ruleContext, "contentinfo", true, true);

            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if a contentinfo role is present, but no main role is present.
         * Also, consider implict roles for <main>, <footer> and <address> elements as these elements
         * have implicit contentinfo roles.
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_ContentinfoWithNoMain_Implicit",
        context: "dom:*[role], dom:footer, dom:address",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            //consider implicit role
            if (!RPTUtil.hasRoleInSemantics(ruleContext, "contentinfo")) {
                return null;
            }

            // Consider the Check Hidden Content setting that is set by the rules
            let passed = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "main", true, true).length > 0;

            //return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple form landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleFormLandmarks",
        context: "dom:body",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Consider the Check Hidden Content setting that is set by the rules
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "form", true, true);
            if (landmarks.length === 0) {
                return null;
            }

            let passed = RPTUtil.hasUniqueAriaLabelsLocally(landmarks, false);

            //return new ValidationResult(passed, landmarks, '', '', []);
            if (!passed) {
                return RuleFail(2);
            } else {
                return RulePass(1);
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple form landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleFormLandmarks_Implicit",
        context: "aria:form",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Per https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/landmarks/HTML5.html
            // form element should only be considered if it has an aria label or title
            if (ruleContext.getAttribute("role") === "form"
                || ruleContext.hasAttribute("aria-label")
                || ruleContext.hasAttribute("aria-labelledby")
                || ruleContext.hasAttribute("title")) {
                // Consider the Check Hidden Content setting that is set by the rules
                // Also, consider Implicit role checking. 
                let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "form", true, true);
                if (landmarks.length === 0 || landmarks.length === 1) {
                    return null;
                }

                let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleFormLandmarks_Implicit", null);
                if (!dupes) {
                    dupes = RPTUtil.findAriaLabelDupes(landmarks);
                    RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleFormLandmarks_Implicit", dupes);
                }
                let myLabel = RPTUtil.getAriaLabel(ruleContext);
                let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);
                if (!passed) {
                    return RuleFail("Fail_1", [myLabel]);
                } else {
                    return RulePass("Pass_0");
                }
            } else {
                return null;
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple navigation landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleNavigationLandmarks_Implicit",
        context: "aria:navigation",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "navigation", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleNavigationLandmarks_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleNavigationLandmarks_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple search landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleSearchLandmarks",
        context: "aria:search",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Consider the Check Hidden Content setting that is set by the rules
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "search", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleSearchLandmarks", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleSearchLandmarks", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            // return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * <cp> Description: Triggers if multiple region role are present and they don't have unique labels
         * Also, consider  <section> element as this element has implicit 'region' role
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit",
        context: "aria:region",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Per https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/landmarks/HTML5.html
            // form element should only be considered if it has an aria label or title
            if (ruleContext.getAttribute("role") === "region"
                || ruleContext.hasAttribute("aria-label")
                || ruleContext.hasAttribute("aria-labelledby")
                || ruleContext.hasAttribute("title")) {
                // Consider the Check Hidden Content setting that is set by the rules
                // Also, consider Implicit role checking. 
                let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "region", true, true);
                if (landmarks.length === 0 || landmarks.length === 1) {
                    return null;
                }

                let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit", null);
                if (!dupes) {
                    dupes = RPTUtil.findAriaLabelDupes(landmarks);
                    RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit", dupes);
                }
                let myLabel = RPTUtil.getAriaLabel(ruleContext);
                let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);
                if (!passed) {
                    return RuleFail("Fail_1", [myLabel]);
                } else {
                    return RulePass("Pass_0");
                }

            } else {
                return null;
            }
        }
    },
    {
        /**
         * Description: Triggers if an application role is not labeled with an aria-labelledby or aria-label
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_ApplicationLandmarkLabel",
        context: "aria:application",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.hasAriaLabel(ruleContext);
            // return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple application landmarks are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleApplicationLandmarks",
        context: "aria:application",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "application", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleApplicationLandmarks", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleApplicationLandmarks", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple document roles are present and they don't have unique labels
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleDocumentRoles",
        context: "aria:document",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "document", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleDocumentRoles", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleDocumentRoles", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel === "" || (!(myLabel in dupes) || dupes[myLabel] <= 1);

            // return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]); 
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if an article role is not labeled with an aria-labelledby or aria-label
         * consider <article> element with implicit role article
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_ArticleRoleLabel_Implicit",
        context: "aria:article",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.hasAriaLabel(ruleContext);
            // return new ValidationResult(passed, [ruleContext], 'role', '', []);
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers if multiple article roles are present and they don't have unique labels
         * Also, consider <article> element with implicit article role. 
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleArticleRoles_Implicit",
        context: "aria:article",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "article", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleArticleRoles_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleArticleRoles_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel === "" || !(myLabel in dupes) || dupes[myLabel] <= 1;

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]); 
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Triggers if a group role is not labeled with an aria-labelledby or aria-label
         * Also, consider <details> element which has implicit article role. 
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_GroupRoleLabel_Implicit",
        context: "dom:*[role], dom:details",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let roleName = "group";
            if (!RPTUtil.hasRoleInSemantics(ruleContext, roleName)) {
                return null;
            }

            let passed = RPTUtil.hasAriaLabel(ruleContext);
            if (!passed) {
                passed = RPTUtil.getAncestorWithRole(ruleContext, "menubar") ||
                    RPTUtil.getAncestorWithRole(ruleContext, "menu") ||
                    RPTUtil.getAncestorWithRole(ruleContext, "tree");
                if (passed) {
                    // Rule does not apply in a menubar/menu/tree
                    return null;
                }
            }

            let retToken1 = new Array();
            retToken1.push(ruleContext.nodeName.toLowerCase());
            let retToken2 = new Array();
            retToken2.push(roleName);
            //return new ValidationResult(passed, [ruleContext], 'role', '', passed == true ? [] : [retToken1, retToken2]);
            if (!passed) {
                return RuleFail("Fail_1", [retToken1.toString(), retToken2.toString()]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Triggers if multiple group roles are present and they don't have unique labels
         * Also, consider <details> element which has implicit 'group' role
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_MultipleGroupRoles_Implicit",
        context: "aria:group",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;

            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "group", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleGroupRoles_Implicit", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleGroupRoles_Implicit", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel === "" || !(myLabel in dupes) || dupes[myLabel] <= 1;

            //return new ValidationResult(passed, ruleContext, '', '', [ myLabel ]);
            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },


    {
        /**
         * Description: Triggers if a WAI-ARIA widget does not have an accessible name via an ARIA label or inner text
         * Also, consider widgets with implicit roles.
         * Origin:  CI162 Web checklist checkpoint 2.4a
         */
        id: "Rpt_Aria_WidgetLabels_Implicit",
        context: "dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            /* removed the role check role= presentation and role=none since these 2 roles are not in the list of widget type roles */
            if ((ruleContext.hasAttribute("type") && ruleContext.getAttribute("type") == "hidden")
                || (RPTUtil.getAncestorWithRole(ruleContext, "combobox") &&
                    !(RPTUtil.hasRoleInSemantics(ruleContext, "textbox") ||
                        RPTUtil.hasRoleInSemantics(ruleContext, "searchbox")))) { // we need to diagnose that a combobox input textbox has a label(github issue #1104) 
                return null;
            }

            // Form/input elements are checked by G41, we skip them from this rule. Github issue 449
            let skipElements = ["input", "textarea", "select", "button", "datalist", "optgroup", "option", "keygen", "output", "progress", "meter"];
            if (skipElements.indexOf(ruleContext.nodeName.toLowerCase()) != -1) {
                return null;
            }

            // exclude <link>, <area> and <a>(#775) that has href.
            if ((ruleContext.nodeName.toLowerCase() === "link" ||
                ruleContext.nodeName.toLowerCase() === "a" ||
                ruleContext.nodeName.toLowerCase() === "area") && ruleContext.hasAttribute("href")) {
                return null;
            }

            // avoid diagnosing the popup list of a combobox.
            let rolesToCheck = ["listbox", "tree", "grid", "dialog"];
            for (let j = 0; j < rolesToCheck.length; j++) {
                if (RPTUtil.hasRoleInSemantics(ruleContext, rolesToCheck[j])) {
                    let comboboxes = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "combobox", true, true);
                    for (let k = 0; k < comboboxes.length; k++) {
                        let combobox = comboboxes[k];
                        let aria_owns = RPTUtil.getElementAttribute(combobox, "aria-owns");
                        if (aria_owns) {
                            let owns = RPTUtil.normalizeSpacing(aria_owns.trim()).split(" ");
                            for (let i = 0; i < owns.length; i++) {
                                let owned = FragmentUtil.getById(ruleContext, owns[i]);
                                if (owned === ruleContext) {
                                    return null;
                                }
                            }
                        }
                    }
                }
            }

            let passed = true;
            let prohibited = false;
            let designPatterns = ARIADefinitions.designPatterns;
            //get attribute roles as well as implicit roles.
            let roles = RPTUtil.getRoles(ruleContext, true);
            let numWidgetsTested = 0;
            let interactiveRoleTypes = ["widget", "liveRegion", "window"];
            for (let i = 0, length = roles.length; passed && i < length; ++i) {

                let pattern = designPatterns[roles[i]];
                if (pattern 
                    && pattern.nameRequired 
                    && pattern.roleType 
                    && interactiveRoleTypes.includes(pattern.roleType))
                { 
                    ++numWidgetsTested;

                    // All widgets may have an author supplied accessible name.
                    // Title is legal, but don't advertise its use in documentation.
                    // Encourage use of aria-label, aria-labelledby or html label element.
                    passed = RPTUtil.hasAriaLabel(ruleContext) || RPTUtil.attributeNonEmpty(ruleContext, "title") || RPTUtil.getLabelForElementHidden(ruleContext, true);

                    if (!passed && pattern.nameFrom && pattern.nameFrom.indexOf("contents") >= 0) {

                        // See if widget's accessible name is supplied by element's inner text
                        // nameFrom: ["author", "contents"]
                        passed = RPTUtil.hasInnerContentOrAlt(ruleContext);
                    }

                    if (!passed) { // check if it has implicit label, like <label><input ....>abc </label>
                        passed = RPTUtil.hasImplicitLabel(ruleContext);
                    }

                    if (!passed && ruleContext.tagName.toLowerCase() === "img" && !ruleContext.hasAttribute("role") && ruleContext.hasAttribute("alt")) {
                        passed = DOMUtil.cleanWhitespace(ruleContext.getAttribute("alt")).trim().length > 0;
                    }
                    
                    if (pattern.nameFrom.indexOf("prohibited") >= 0) {
                        prohibited = true;
                    }
                }
            }
            //return new ValidationResult(passed, [ruleContext], '', '', []);
            if (numWidgetsTested === 0) {
                return null;
            } else if (!passed) {
                return RuleFail("Fail_1");
            } else {
                //TODO
//                if (prohibited) {
//                    return RuleFail("Fail_2");
//                } else {
                    return RulePass("Pass_0");
//                }
            }
        }
    },

    {
        /**
         * Description: Triggers if multiple toolbars are present and they don't have unique labels
         * Origin:  WAI-ARIA
         * 			https://www.w3.org/TR/wai-aria-1.1/#toolbar
         */
        id: "Rpt_Aria_MultipleToolbarUniqueLabel",
        context: "aria:toolbar",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // Consider the Check Hidden Content setting that is set by the rules
            // Also, consider Implicit role checking. 
            let landmarks = RPTUtil.getElementsByRoleHidden(ruleContext.ownerDocument, "toolbar", true, true);
            if (landmarks.length === 0 || landmarks.length === 1) {
                return null;
            }

            let dupes = RPTUtil.getCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleToolbarUniqueLabel", null);
            if (!dupes) {
                dupes = RPTUtil.findAriaLabelDupes(landmarks);
                RPTUtil.setCache(ruleContext.ownerDocument, "Rpt_Aria_MultipleToolbarUniqueLabel", dupes);
            }
            let myLabel = RPTUtil.getAriaLabel(ruleContext);
            let passed = myLabel !== "" && (!(myLabel in dupes) || dupes[myLabel] <= 1);

            if (!passed) {
                return RuleFail("Fail_1", [myLabel]);
            } else {
                return RulePass("Pass_0");
            }
        }
    }


]
export { a11yRulesLabeling }
