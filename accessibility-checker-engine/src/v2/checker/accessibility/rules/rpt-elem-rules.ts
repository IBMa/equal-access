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
import { FragmentUtil } from "../util/fragment";
import { LangUtil } from "../util/lang";
import { DOMUtil } from "../../../dom/DOMUtil";

const DEPRECATED_ELEMENTS = [
    /** original */
    "applet", "basefont", "center", "dir", "font", "isindex", "listing", "menu", 
    "plaintext", "spacer", "s", "strike", "u", "xmp",
    /** added from https://dev.w3.org/html5/pf-summary/obsolete.html */ 
    "acronym", "frame", "frameset", "noframes", "noembed", "big", "blink", "marquee", "tt",

]

const DEPRECATED_HTML_GLOBAL_ATTRIBUTES = [
    /** original */
    "align", "link", "archive", "background", "bgcolor", "clear", "code", "color", 
    "compact", "face", "hspace", "language", "link", "noshade", "nowrap", "object",
     "prompt", "start", "text", "version", "vlink", "vspace"   
]
 
 const DEPRECATED_ELEMENT_ATTRIBUTES = {
    /** original */
    "td" : ["height",  "width", "abbr", "axis", "char", "charoff", "height", "nowrap", "valign", "width", "align", "bgcolor" ], 
    "th" : ["height", "width", "abbr", "axis", "charoff", "height", "bgcolor", "align", "nowrap", "char", "valign", "width"], 
    "li" : ["type", "value", "type" ], 
    "ul" : ["type", "compact"], 
    "pre" :["width"], 
    
    /** added from https://dev.w3.org/html5/pf-summary/obsolete.html */ 
    "meta" : ["http-equiv"],  
    "a" : ["charset", "coords" , "shape", "rev", "scheme"], 
    "link" : ["rev", "charset","target"],
    "img" : ["name", "longdesc", "align", "hspace", "vspace", "border" ], 
    "area" : ["nohref"] , 
    "head" : ["profile"] , 
    "html" : ["version"] , 
    "iframe" : ["longdesc", "align", "frameborder", "marginheight", "marginwidth", "scrolling"], 
    "object" : ["archive", "code", "codebase", "codetype", "declare", "standby", "align", "hspace", "vspace", "border"],
    "param" : ["type", "valuetype"] , 
    "script" : ["language"],
    "body" : ["alink", "background", "bgcolor", "link", "text", "vlink"], 
    "br" : ["clear"] , 
    "caption" : ["align"], 
    "col" : ["align", "char", "charoff", "valign", "width"],
    "div" : ["align"] , 
    "dl" : ["compact"] , 
    "hr" : ["align", "noshade", "size", "width", "align"], 
    "h2" : ["align"] ,  
    "h3" : ["align"] ,  
    "h4" : ["align"] ,  
    "h5" : ["align"] ,  
    "h6" : ["align"],
    "input" : ["align", "usemap"], 
    "legend" : ["align"] , 
    "menu" : ["compact"],
    "ol" : ["compact", "type",  "type"], 
    "p" : ["align"],
    "table" : ["bgcolor", "cellpadding", "cellspacing", "frame", "rules", "width", "align"] , 
    "tbody" : ["align", "char", "valign", "charoff"],
    "tfoot" : ["align", "charoff", "char", "valign" ],
    "thead" : ["char" , "charoff", "valign", "align" ],  
    "tr" : ["align", "bgcolor", "char", "charoff", "valign"]
 }
 
 const DEPRECATED_ROLES = [
    /**  deprecated aria roles: https://www.w3.org/TR/wai-aria-1.2/ */ 
    /** 
     *  the aria deprecation will be better handled in ARIADefinition.ts
     *  "directory" 
    */
 ]

 const DEPRECATED_ARIA_GLOBAL_ATTRIBUTES = [
    /**  add deprecated aria global attributes: https://www.w3.org/TR/wai-aria-1.2/ */ 
    /** 
     *  the aria deprecation will be better handled in ARIADefinition.ts
     *  "aria-grabbed", "aria-dropeffect" 
    */
 ]

 const DEPRECATED_ARIA_ROLE_ATTRIBUTES = {
    /**  add deprecated aria role and attributes: https://www.w3.org/TR/wai-aria-1.2/ */ 
    /** 
     *  the aria deprecation will be better handled in ARIADefinition.ts
    "alert" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "alertdialog" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "article" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "banner" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "blockquote" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "button" : ["aria-errormessage", "aria-invalid"],
    "caption" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "cell" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "checkbox" : ["aria-haspopup"],
    "code" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "command" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "complementary" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "composite" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "contentinfo" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "definition" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "deletion" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "dialog" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "document" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "emphasis" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "feed" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "figure" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "form" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "generic" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "grid" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "group" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "heading" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "img" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "input" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "landmark" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "insertion" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "link" : ["aria-errormessage", "aria-invalid"],
    "list" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "listbox" : ["aria-haspopup"],
    "listitem" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "log" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "main" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "marquee" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "math" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "meter" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "menu" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "menubar" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "menuitem" : ["aria-errormessage", "aria-invalid"],
    "menuitemcheckbox" : ["aria-errormessage", "aria-invalid"],
    "menuitemradio" : ["aria-errormessage", "aria-invalid"],
    "navigation" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "note" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "option" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "paragraph" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "presentation" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "progressbar" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "radio" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "radiogroup" : ["aria-haspopup"],
    "range" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "region" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "row" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "rowgroup" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "scrollbar" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "search" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "section" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "sectionhead" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "select" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "separator" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "spinbutton" : ["aria-haspopup"],
    "status" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "strong" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "structure" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "subscript" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "superscript" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "switch" : ["aria-haspopup"],
    "tab" : ["aria-errormessage", "aria-invalid"],
    "table" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "tablist" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "tabpanel" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "term" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "time" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "timer" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "toolbar" : ["aria-errormessage", "aria-haspopup", "aria-invalid"],
    "tooltip" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "tree" : ["aria-haspopup"],
    "treegrid" : ["aria-haspopup"],
    "treeitem" : ["aria-errormessage", "aria-invalid"],
    "widget" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"],
    "window" : ["aria-disabled", "aria-errormessage", "aria-haspopup", "aria-invalid"]
     */       
 }

 function arrayToContextStr(obj, type) {
    let str = ""; 
    for (const prop of obj) {
        if (str !=='' && !str.endsWith(', ')) str += ", ";
        if (type === 'HTML_ELEMENTS')
            str += 'dom:' + prop;
        else if (type === 'HTML_ATTRIBUTES')
            str += 'dom:*[' + prop + "]";
        else if (type === 'ARIA_ROLES')
            str += 'aria:' + prop;
        else if (type === 'ARIA_ATTRIBUTES') {
            str += 'dom:*[' + prop + "]";     
        }       
    }
    return str;
} 

function objToContextStr(obj, type:string) {
    let str = ""; 
    for (const prop in obj) {
        if (str !=='' && !str.endsWith(', ')) str += ", ";
        if (type === 'HTML_ELEMENT_ATTRIBUTES') {
            for (const item of obj[prop] as String[]) {
                if (str !=='' && !str.endsWith(", ")) str += ", ";
                str += 'dom:' + prop + '[' + item + ']';
            }        
        } else if (type === 'ARIA_ROLE_ATTRIBUTES') { 
            for (let item of obj[prop] as String[]) {
                if (str !=='' && !str.endsWith(", ")) str += ", ";
                if (item.startsWith("aria-")) item = item.substring(5);
                str += 'aria:' + prop + '[' + item + ']';
            }    
        }        
    }
    return str;
} 

let a11yRulesElem: Rule[] = [
    {
        /**
         * Description: Trigger if element language attributes are valid
         * Origin: WCAG 2.0 Technique H58
         */
        id: "WCAG20_Elem_Lang_Valid",
        context: "dom:*[lang], dom:*[xml:lang]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            if (ruleContext.hasAttribute("lang")) {
                if (nodeName !== "html" && ruleContext.getAttribute("lang") === "") {
                    // It's okay to have a lang="" if not on html
                } else {
                    let langStr = ruleContext.getAttribute("lang");
                    if (!LangUtil.validPrimaryLang(langStr)) {
                        return RuleFail("Fail_1");
                    }
                    if (!LangUtil.isBcp47(langStr)) {
                        return RuleFail("Fail_2");
                    }
                }
            }
            if (ruleContext.hasAttribute("xml:lang")) {
                if (nodeName !== "html" && ruleContext.getAttribute("xml:lang") === "") {
                    // It's okay to have a lang="" if not on html
                } else {
                    let langStr = ruleContext.getAttribute("xml:lang");
                    if (!LangUtil.validPrimaryLang(langStr)) {
                        return RuleFail("Fail_3");
                    }
                    if (!LangUtil.isBcp47(langStr)) {
                        return RuleFail("Fail_4");
                    }
                }
            }
            return RulePass("Pass_0");
        }
    },
    {
        /**
         * Description: Trigger if elements or attrributes are deprecated
         * Origin: RPT 5.6
         * source: 
         *      html tags: https://dev.w3.org/html5/pf-summary/obsolete.html
         */
        id: "element_attribute_deprecated",
        context: arrayToContextStr(DEPRECATED_ELEMENTS, "HTML_ELEMENTS")  +
                + ", " + arrayToContextStr(DEPRECATED_HTML_GLOBAL_ATTRIBUTES, "HTML_ATTRIBUTES") +
                + ", " + objToContextStr(DEPRECATED_ELEMENT_ATTRIBUTES, "HTML_ELEMENT_ATTRIBUTES") +
                (DEPRECATED_ROLES.length > 0 ? ", " + arrayToContextStr(DEPRECATED_ROLES, "ARIA_ROLES") : "") +
                (DEPRECATED_ARIA_GLOBAL_ATTRIBUTES.length > 0 ? ", " + arrayToContextStr(DEPRECATED_ARIA_GLOBAL_ATTRIBUTES, "ARIA_ATTRIBUTES") : "") +
                (Object.keys(DEPRECATED_ARIA_ROLE_ATTRIBUTES).length > 0 ? ", " + objToContextStr(DEPRECATED_ARIA_ROLE_ATTRIBUTES, "ARIA_ROLE_ATTRIBUTES") : ""),
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            
            // HTMLUnit auto adds a tbody[align=left] to tables if tbody is missing!
            if (ruleContext.nodeName.toLowerCase() === "tbody" && ruleContext.hasAttribute("align")) {
                return RulePass("pass");
            }

            const nodeName = ruleContext.nodeName.toLowerCase();    
            // check if it's a deprecated element
            if (DEPRECATED_ELEMENTS.includes(nodeName)) {
                return RuleFail("fail_elem", [nodeName]);
            }

            // check if it's a deprecated HTML global attribute
            const attrs = ruleContext.getAttributeNames();
            let violations = '';
            for (const attr of attrs) {
                if (DEPRECATED_HTML_GLOBAL_ATTRIBUTES.includes(attr)) {
                    if (violations !== '') violations += ', ';
                    violations += attr;
                }
            }    
            if (violations !== '') {
                return RuleFail("fail_attr", [violations]);
            }
            
            // check if it's a deprecated HTML element & attribute
            violations = '';
            if (nodeName in DEPRECATED_ELEMENT_ATTRIBUTES) {
                for (const attr of attrs) {
                    if (DEPRECATED_ELEMENT_ATTRIBUTES[nodeName] && DEPRECATED_ELEMENT_ATTRIBUTES[nodeName].includes(attr)) {
                        if (violations !== '') violations += ', ';
                        violations += attr;
                    }
                }    
                if (violations !== '') {
                    return RuleFail("fail_elem_attr", [violations, nodeName]);
                }
            }

            
            const roles = RPTUtil.getRoles(ruleContext, false);
            // check if it's a deprecated global aria role
            for (const role of roles) {
                if (DEPRECATED_ROLES.includes(role)) {
                    return RuleFail("fail_aria_role", [role]);
                }
            } 

            // check if it's a deprecated aria global attribute
            violations = '';
            for (const attr of attrs) {
                if (DEPRECATED_ARIA_GLOBAL_ATTRIBUTES.includes(attr)) {
                    if (violations !== '') violations += ', ';
                    violations += attr;
                }
            }    
            if (violations !== '') {
                return RuleFail("fail_aria_attr", [violations]);
            }
            
            // check if it's a deprecated ARIA role & attribute    
            for (const role of roles) {
                violations = '';
                if (role in DEPRECATED_ARIA_ROLE_ATTRIBUTES) {
                    for (const attr of attrs) {
                        if (attr.startsWith('aria-') && DEPRECATED_ARIA_ROLE_ATTRIBUTES[role] 
                            && DEPRECATED_ARIA_ROLE_ATTRIBUTES[role].includes(attr)) 
                        {
                            if (violations !== '') violations += ', ';
                            violations += attr;
                        }
                    }    
                    if (violations !== '') {
                        return RuleFail("fail_role_attr", [violations, role]);
                    }
                }
            }

            return RulePass("pass");
        }
    },
    {
        /**
         * Description: Trigger if this elem's id isn't obtained by getElementById
         * Origin: RPT 5.6
         */
        id: "RPT_Elem_UniqueId",
        context: "dom:*[id]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            // JCH - NO OUT OF SCOPE hidden in context
            let id = ruleContext.getAttribute("id");

            // In the case that id is empty we should trigger a violation right away with out checking 
            // for uniqueness.
            if (id === "") {
                //return new ValidationResult(false, [ruleContext], '', '', [ruleContext.nodeName.toLowerCase(), id]);
                return RuleFail("Fail_1", [ruleContext.nodeName.toLowerCase(), id]);
            }

            let element = FragmentUtil.getById(ruleContext, id);
            let passed = element === ruleContext;
            //return new ValidationResult(passed, [ruleContext], '', '', passed == true ? [] : [ruleContext.nodeName.toLowerCase(), id]);
            if (!passed) {
                return RuleFail("Fail_2", [ruleContext.nodeName.toLowerCase(), id]);
            } else {
                return RulePass("Pass_0");
            }
        }
    },
    {
        /**
         * Description: Trigger if this elem's accesskey isn't unique
         * Origin: WCAG 2.0 Technique F17
         */
        id: "WCAG20_Elem_UniqueAccessKey",
        context: "dom:*[accesskey]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let map = RPTUtil.getCache(ruleContext.ownerDocument, "WCAG20_Elem_UniqueAccessKey", {});

            let key = ruleContext.getAttribute("accesskey");

            let passed = !(key in map);
            map[key] = true;
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    },

    {
        /**
         * Description: Trigger if an assesskey doesn't have a label
         * Origin:  HTML 5 - per Richard Schwerdtfeger's requirements. g1140
         */
        id: "HAAC_Accesskey_NeedLabel",
        context: "dom:*[accesskey]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let passed = false;
            if (RPTUtil.attributeNonEmpty(ruleContext, "title")) {
                passed = true;
            } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-label")) {
                passed = true;
            } else if (RPTUtil.getLabelForElementHidden(ruleContext, true)) { // ignore hidden
                passed = true;
            } else if (RPTUtil.attributeNonEmpty(ruleContext, "aria-labelledby")) {
                // assume the validity of the id (of aria-labelledby) is checked by a different rule
                passed = true;
            } else if (ruleContext.nodeName.toLowerCase() === "input"
                && DOMUtil.parentNode(ruleContext).nodeName.toLowerCase() === "label") {
                // assume the validity of the label, e.g. empty label, is checked by a different rule
                passed = true;
            }

            if (passed) return RulePass("Pass_0");
            if (!passed) return RulePotential("Potential_1");

        }
    },
    {
        /**
         * Description: Trigger if a mouse event is used and a matching keyboard event is not
         * Origin: RPT 5.6 g269
         */
        id: "RPT_Elem_EventMouseAndKey",
        context: "dom:*[ondblclick], dom:*[onmousemove], dom:*[onmousedown], " +
            "dom:*[onmouseup], dom:*[onmouseover], dom:*[onmouseout], dom:*[onclick]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let nodeName = ruleContext.nodeName.toLowerCase();
            let passed = ruleContext.hasAttribute("href") ||
                (!ruleContext.hasAttribute("ondblclick") &&
                    !ruleContext.hasAttribute("onmousemove") &&
                    (!ruleContext.hasAttribute("onmousedown") || ruleContext.hasAttribute("onkeydown")) &&
                    (!ruleContext.hasAttribute("onmouseup") || ruleContext.hasAttribute("onkeyup")) &&
                    (!ruleContext.hasAttribute("onmouseover") || ruleContext.hasAttribute("onfocus")) &&
                    (!ruleContext.hasAttribute("onmouseout") || ruleContext.hasAttribute("onblur")) &&
                    (!ruleContext.hasAttribute("onclick") || ruleContext.hasAttribute("onkeypress") ||
                        nodeName == "a" || nodeName == "button"));

            let failedMouseEvents = new Array();
            if (!passed) {
                //store and display event name and node name in the tokens
                if (ruleContext.hasAttribute("ondblclick")) {
                    failedMouseEvents.push("ondblclick");
                }
                if (ruleContext.hasAttribute("onmousemove")) {
                    failedMouseEvents.push("onmousemove");
                }
                if (ruleContext.hasAttribute("onmousedown") && !ruleContext.hasAttribute("onkeydown")) {
                    failedMouseEvents.push("onmousedown");
                }
                if (ruleContext.hasAttribute("onmouseup") && !ruleContext.hasAttribute("onkeyup")) {
                    failedMouseEvents.push("onmouseup");
                }
                if (ruleContext.hasAttribute("onmouseover") && !ruleContext.hasAttribute("onfocus")) {
                    failedMouseEvents.push("onmouseover");
                }
                if (ruleContext.hasAttribute("onmouseout") && !ruleContext.hasAttribute("onblur")) {
                    failedMouseEvents.push("onmouseout");
                }
                if (ruleContext.hasAttribute("onclick") && !ruleContext.hasAttribute("onkeypress")) {
                    if (!(nodeName == "a" || nodeName == "button"))
                        failedMouseEvents.push("onclick");
                }
            }
            return passed ? RulePass("Pass_0") : RuleManual("Manual_1", [nodeName, failedMouseEvents.join(", ")]);
        }
    },
    {
        /**
         * Description: Trigger if an invalid value is used for the dir attribute
         * Origin: Valerie
         */
        id: "Valerie_Elem_DirValid",
        context: "dom:*[dir]",
        run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
            const ruleContext = context["dom"].node as Element;
            let dirStr = ruleContext.getAttribute("dir").toLowerCase();
            let passed = dirStr == "ltr" || dirStr == "rtl" || dirStr == "auto";
            if (!passed) {
                return RuleFail("Fail_1");
            } else {
                return RulePass("Pass_0");
            }
        }
    }
]

export { a11yRulesElem }