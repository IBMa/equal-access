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

let a11yRulesMedia: Rule[] = [

    {
        /**
         * Description: Raise error if number of alt characters is greater than N.
         * Origin: RPT 5.6
         */
        id: "RPT_Media_AltBrief",
        context: "dom:img[alt], dom:applet[alt], dom:area[alt], dom:embed[alt], dom:input[type][alt]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const validateParams = {
                maxAlt: {
                    value: 150,
                    type: "integer"
                }
            }
            const ruleContext = context["dom"].node as Element;
            let altLength = ruleContext.getAttribute("alt").trim().length;
            let passed = altLength <= validateParams.maxAlt.value;
            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger for various media types
         * Origin: RPT 5.6 G24
         */
        id: "RPT_Media_AudioTrigger",
        context: "dom:bgsound, dom:a[href], dom:area[href], dom:embed, dom:object",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed;
            let thisNode = ruleContext.nodeName.toLowerCase();
            if (thisNode == "bgsound") {
                passed = false;
            } else {
                passed = !RPTUtil.isAudioObjEmbedLink(ruleContext);
            }
            if (passed) return null; // Out of Scope
            if (!passed) return RuleManual("Manual_1");

        }
    },
    {
        /**
         * Description: Trigger for possible video
         * Origin: RPT 5.6 G459
         */
        id: "RPT_Media_VideoReferenceTrigger",
        context: "dom:a[href], dom:area[href], dom:applet, dom:embed, dom:object",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = true;

            if (nodeName == "applet") {
                passed = false;
            } else {
                passed = !RPTUtil.isVideoObjEmbedLink(ruleContext);
            }

            if (passed) return null;
            if (!passed) return RuleManual("Manual_1");

        }
    },
    {
        /**
         * Description: Trigger for audio/video with an alt attribute
         * Origin: RPT 5.6 G460
         */
        id: "RPT_Media_AudioVideoAltFilename",
        context: "dom:area[alt], dom:embed[alt]", // Don't check area - it's a dupe with g453
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let uri = "";
            if (ruleContext.nodeName.toLowerCase() == "area") {
                uri = ruleContext.getAttribute("href")
            } else {
                uri = ruleContext.getAttribute("src")
            }
            if (uri == null) uri = "";
            let ext = RPTUtil.getFileExt(uri);
            let isAudVid = ext.length != 0 && (RPTUtil.isAudioExt(ext) || RPTUtil.isVideoExt(ext));
            let altText = ruleContext.getAttribute("alt");
            let passed = !isAudVid || (altText.length > 0 && altText.indexOf(ext) == -1);

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger for possible video
         * Origin: RPT 5.6 G501
         */
        id: "RPT_Media_VideoObjectTrigger",
        context: "dom:embed, dom:object",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = !RPTUtil.isVideoObjEmbedLink(ruleContext);
            if (passed) return null;
            if (!passed) return RuleManual("Manual_1");
        }
    },
    {
        /**
         * Description: Trigger for various image and color usage
         * Origin: RPT 5.6 G245
         */
        id: "RPT_Media_ImgColorUsage",
        context: "dom:embed, dom:object, dom:img, dom:applet, dom:script, dom:style, dom:input, dom:link," +
            "dom:*[style], dom:font[color], dom:tr[bgcolor], dom:th[bgcolor], " +
            "dom:td[bgcolor]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            // If there's style used, it fails anyway
            if (!ruleContext.hasAttribute("style")) {
                let nodeName = ruleContext.nodeName.toLowerCase();
                if (nodeName == "input") {
                    passed = !ruleContext.hasAttribute("type") ||
                        ruleContext.getAttribute("type").toLowerCase() != 'image';
                } else if (nodeName == "link") {
                    passed = !ruleContext.hasAttribute("rel") ||
                        ruleContext.getAttribute("rel").toLowerCase() != 'stylesheet';
                    // Only trigger on one link to prompt the manual check - that's enough
                    passed = RPTUtil.triggerOnce(ruleContext.ownerDocument, "RPT_Media_ImgColorUsage_Links", passed);
                } else if (nodeName == "embed" || nodeName == "object") {
                    if (ruleContext.hasAttribute("type")) {
                        let type = ruleContext.getAttribute("type");
                        passed = type.startsWith("text") || type.startsWith("audio");
                    }
                    if (!passed && ruleContext.hasAttribute("codetype")) {
                        let type = ruleContext.getAttribute("codetype");
                        passed = type.startsWith("text") || type.startsWith("audio");
                    }
                    if (!passed) {
                        let filename = ruleContext.getAttribute((nodeName == "embed") ? "src" : "data");
                        if (filename == null) filename = "";
                        let ext = RPTUtil.getFileExt(filename);
                        passed = ext.length > 0 && RPTUtil.isAudioExt(ext);
                    }
                } else if (nodeName == "script") {
                    // Only trigger on one script to prompt the manual check - that's enough
                    passed = RPTUtil.triggerOnce(ruleContext.ownerDocument, "RPT_Media_ImgColorUsage_Scripts", passed);
                }
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger for links to documents
         * Origin: CI162
         */
        id: "HAAC_Media_DocumentTrigger2",
        context: "dom:a[href],dom:area[href]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let href = ruleContext.getAttribute("href");
            let ext = RPTUtil.getFileExt(href);
            let passed = ![".docx", ".doc", ".pdf", ".odt"].includes(ext);
            if (passed) return null;
            if (!passed) return RuleManual("Manual_1");

        }
    }

]
export { a11yRulesMedia }