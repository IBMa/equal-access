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
import { RPTUtil, NodeWalker } from "../util/legacy";

let a11yRulesImg: Rule[] = [

    {
        /**
         * Description: Triggers if an image has no alt attribute
         * Origin: WCAG 2.0 Technique H37
         */
        id: "WCAG20_Img_HasAlt",
        context: "dom:img",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            let passed = ruleContext.hasAttribute("alt");
            if (passed) {
                let alt = ruleContext.getAttribute("alt");
                if (alt.trim().length == 0 && alt.length != 0) {
                    // Alt, but it's whitespace (alt=" ")
                    return RuleFail("Fail_1");
                }
            }
            if (!passed) {
                // No Alt
                return RuleFail("Fail_2");
            } else {
                // Alt content or alt == ""
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Triggers when a non-null alt attribute is applied to an image and role="presentation" or role="none"  is set on the image.
         * Origin: CI162 Checkpoint 1.1a
         */
        id: "WCAG20_Img_PresentationImgHasNonNullAlt",
        context: "dom:img[alt]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = true;
            if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none")) {
                passed = ruleContext.getAttribute("alt").length == 0;
            }
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Triggers if there are redundancies between link text and image alt text.
         * Origin: WCAG 2.0 Technique WCAG_H2
         */
        id: "WCAG20_Img_LinkTextNotRedundant",
        context: "dom:img[alt]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let aNode = RPTUtil.getAncestor(ruleContext, "a");
            //If not in an anchor, Out of Scope
            if (aNode == null) return null;

            let altText = ruleContext.getAttribute("alt").trim().toLowerCase();
            if (altText.length == 0) {
                // If alt text is empty, there's no text to be redundant - let WCAG20_A_HasText
                // trigger in that case. 
                // So Out of Scope for this rule
                return null;
            }
            let innerText = aNode.innerText;
            let linkText = "";

            if (innerText != null) {
                linkText = innerText.trim().toLowerCase();
            }
            if (linkText.length > 0) {
                if (altText == linkText) {
                    // Text in link
                    return RuleFail("Fail_1");
                }
            } else {
                let passed = true;
                //alt is non-zero, but no link text - ensure adjacent link text isn't redundant 
                let walk = new NodeWalker(aNode);
                while (passed && walk.prevNode()) {
                    // Get the node and nodeName
                    let node = walk.node;
                    let nodeName = node.nodeName.toLowerCase();
                    if ((nodeName == "#text" && node.nodeValue.length > 0) ||
                        (nodeName == "img" && RPTUtil.attributeNonEmpty(node, "alt"))) {
                        break;
                    }
                    // Comply with the Check Hidden Content Setting if the a element should be checked or not
                    else if (nodeName === "a" && !RPTUtil.shouldNodeBeSkippedHidden(node)) {
                        // Text before image link
                        passed = ((node as HTMLElement).innerText || node.textContent || "").trim().toLowerCase() != altText;
                    }
                }
                if (!passed) {
                    return RuleFail("Fail_2");
                }
                walk = new NodeWalker(aNode, true);
                while (passed && walk.nextNode()) {
                    // Get the node and nodeName
                    let node = walk.node;
                    let nodeName = node.nodeName.toLowerCase();

                    if ((nodeName == "#text" && node.nodeValue.length > 0) ||
                        (nodeName == "img" && RPTUtil.attributeNonEmpty(node, "alt"))) {
                        break;
                    }
                    // Comply with the Check Hidden Content Setting if the a element should be checked or not
                    else if (nodeName == "a" && !RPTUtil.shouldNodeBeSkippedHidden(node)) {
                        passed = (node as HTMLElement).innerText.trim().toLowerCase() != altText;
                    }
                }
                if (!passed) {
                    // Text after image link
                    return RuleFail("Fail_3");
                } else {
                    return RulePass("Pass_0");
                }
            }
        }
    },
    {
        /**
         * Description: Trigger if an image has alt text
         * Origin: WCAG 2.0 Technique H37, RPT 5.6 G473
         */
        id: "WCAG20_Img_AltTriggerNonDecorative",
        context: "dom:img[alt]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                bulletMax: {
                    value: 30,
                    type: "integer"
                },
                horizMinWidth: {
                    value: 400,
                    type: "integer"
                },
                horizMaxHeight: {
                    value: 30,
                    type: "integer"
                }
            }

            const ruleContext = context["dom"].node as Element;
            if (RPTUtil.hasRole(ruleContext, "presentation") || RPTUtil.hasRole(ruleContext, "none") || ruleContext.getAttribute("alt").length == 0) {
                return RulePass(1);
            }

            let params = validateParams;
            let myHeight = -1;
            let myWidth = -1;
            if (ruleContext.hasAttribute("height")) {
                myHeight = parseInt(ruleContext.getAttribute("height"));
            }
            if (ruleContext.hasAttribute("width")) {
                myWidth = parseInt(ruleContext.getAttribute("width"));
            }
            let passed = myHeight != -1 && myWidth != -1 &&
                ((myWidth <= params.bulletMax.value && myHeight <= params.bulletMax.value) ||
                    (myWidth >= params.horizMinWidth.value && myHeight <= params.horizMaxHeight.value));

            return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
        }
    },
    {
        /**
         * Description: Trigger if title is non-empty when alt is null
         * Origin: WCAG 2.0 Technique H67
         */
        id: "WCAG20_Img_TitleEmptyWhenAltNull",
        context: "dom:img[alt]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            if (ruleContext.getAttribute("alt").trim().length > 0) {
                return null;
            }
            // We have a title, but alt is empty
            if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Ensure that image with server side maps also have a
         * functioning user side map.
         * Origin: RPT 5.6 G11
         */
        id: "RPT_Img_UsemapValid",
        context: "dom:img[ismap]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            if (ruleContext.hasAttribute("usemap")) {
                let usemap = ruleContext.getAttribute("usemap");
                usemap = usemap.trim().toLowerCase();
                let idx = usemap.indexOf("#");
                if (idx != -1)
                    usemap = usemap.substr(idx + 1);

                if (usemap.length > 0) {
                    let maps = RPTUtil.getDocElementsByTag(ruleContext, "map");
                    for (let i = 0; !passed && i < maps.length; ++i) {
                        passed = maps[i].hasAttribute("name") &&
                            maps[i].getAttribute("name").toLowerCase() == usemap;
                    }
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: If the image has a non-empty usemap, ensure that it also has alt text.
         * Origin: CI162
         */
        id: "HAAC_Img_UsemapAlt",
        context: "dom:img[usemap], dom:img[ismap]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = RPTUtil.attributeNonEmpty(ruleContext, "alt") ||
                (!ruleContext.hasAttribute("ismap") && !RPTUtil.attributeNonEmpty(ruleContext, "usemap"));
            if (!passed) {
                return RuleFail("Pass_0");
            } else {
                return RulePass("Fail_1");
            }
        }
    },
    {
        /**
         * Description: Triggers if an image's alt text uses common misuses
         * Origin: RPT 5.6 G453
         */
        id: "RPT_Img_AltCommonMisuse",
        context: "dom:img, dom:area, dom:input",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                badText: {
                    value: ["short description"],
                    type: "[string]"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = true;
            // Alt text check are elsewhere (See 41, 240, 455)
            if (ruleContext.hasAttribute("alt")) {
                let altText = ruleContext.getAttribute("alt").trim();
                if (altText.length > 0) {
                    let badText = validateParams.badText.value;
                    for (let i = 0; passed && i < badText.length; ++i) {
                        passed = altText.indexOf(badText[i]) == -1;
                    }
                    if (passed) {
                        let src = ruleContext.getAttribute((nodeName == "area") ? "href" : "src");
                        // Allow it to pass if there's no src - can't determine these.
                        if (src != null) {
                            // Fail if the alt matches the src exactly
                            // Also fail if the alt has a . in it and either the src is in the alt or the alt is in the src
                            passed = src.trim() != altText &&
                                (altText.indexOf(".") == -1 || (altText.indexOf(src) == -1 && src.indexOf(altText) == -1));
                        }
                    }
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Triggers if an image does not have a long description
         * Origin: RPT 5.6 G454 Errors
         * Todo: isBad URL Check
         */
        id: "RPT_Img_LongDescription2",
        context: "dom:img[longdesc]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let longdesc = ruleContext.getAttribute("longdesc");
            // if (longdesc is bad URL) passed = false;

            let ext = RPTUtil.getFileExt(longdesc);
            let passed = ext.length != 0 && RPTUtil.isHtmlExt(ext)
                || longdesc.startsWith("#")
                || longdesc.startsWith("http://")
                || longdesc.startsWith("https://")
                || longdesc.startsWith("data:");

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if an element has a background image and has text or has title
         * Origin: WCAG 2.0 Technique 1.1.1 F3. G1132
         */
        id: "HAAC_BackgroundImg_HasTextOrTitle",
        context: "dom:*",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let doc = ruleContext.ownerDocument;
            let style = doc.defaultView.getComputedStyle(ruleContext);
            if (style == null) {
                return RulePass("Pass_0");
            }
            let backgroundImgs = style.backgroundImage;
            let passed = true;

            if (backgroundImgs != null && backgroundImgs != "" && backgroundImgs != 'none' && backgroundImgs != 'inherit') {
                if (ruleContext.innerHTML != null && ruleContext.innerHTML.trim().length != 0) {
                    passed = false;
                } else {
                    let title = ruleContext.getAttribute('title');
                    if (title != null && title.length != 0)
                        passed = false;
                }
            }
            if (passed) return RulePass("Pass_0");
            if (!passed) return RuleManual("Manual_1");

        }
    }

]

export { a11yRulesImg }