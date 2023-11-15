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

const DEPRECATED_ELEMENTS = [
    /** original */
    "applet", "basefont", "center", "dir", "font", "isindex", "listing",
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
    "td": ["height", "width", "abbr", "axis", "char", "charoff", "height", "nowrap", "valign", "width", "align", "bgcolor"],
    "th": ["height", "width", "abbr", "axis", "charoff", "height", "bgcolor", "align", "nowrap", "char", "valign", "width"],
    "li": ["type", "value", "type"],
    "ul": ["type", "compact"],
    "pre": ["width"],

    /** added from https://dev.w3.org/html5/pf-summary/obsolete.html */
    "meta": ["http-equiv"],
    "a": ["charset", "coords", "shape", "rev", "scheme"],
    "link": ["rev", "charset", "target"],
    "img": ["name", "longdesc", "align", "hspace", "vspace", "border"],
    "area": ["nohref"],
    "head": ["profile"],
    "html": ["version"],
    "iframe": ["longdesc", "align", "frameborder", "marginheight", "marginwidth", "scrolling"],
    "object": ["archive", "code", "codebase", "codetype", "declare", "standby", "align", "hspace", "vspace", "border"],
    "param": ["type", "valuetype"],
    "script": ["language"],
    "body": ["alink", "background", "bgcolor", "link", "text", "vlink"],
    "br": ["clear"],
    "caption": ["align"],
    "col": ["align", "char", "charoff", "valign", "width"],
    "div": ["align"],
    "dl": ["compact"],
    "hr": ["align", "noshade", "size", "width", "align"],
    "h2": ["align"],
    "h3": ["align"],
    "h4": ["align"],
    "h5": ["align"],
    "h6": ["align"],
    "input": ["align", "usemap"],
    "legend": ["align"],
    "menu": ["compact"],
    "ol": ["compact", "type", "type"],
    "p": ["align"],
    "table": ["bgcolor", "cellpadding", "cellspacing", "frame", "rules", "width", "align"],
    "tbody": ["align", "char", "valign", "charoff"],
    "tfoot": ["align", "charoff", "char", "valign"],
    "thead": ["char", "charoff", "valign", "align"],
    "tr": ["align", "bgcolor", "char", "charoff", "valign"]
}

function arrayToContextStr(obj, type) {
    let str = "";
    for (const prop of obj) {
        if (str !== '' && !str.endsWith(', ')) str += ", ";
        if (type === 'HTML_ELEMENTS')
            str += 'dom:' + prop;
        else if (type === 'HTML_ATTRIBUTES')
            str += 'dom:*[' + prop + "]";
    }
    return str;
}

function objToContextStr(obj, type: string) {
    let str = "";
    for (const prop in obj) {
        if (str !== '' && !str.endsWith(', ')) str += ", ";
        if (type === 'HTML_ELEMENT_ATTRIBUTES') {
            for (const item of obj[prop] as String[]) {
                if (str !== '' && !str.endsWith(", ")) str += ", ";
                str += 'dom:' + prop + '[' + item + ']';
            }
        } 
    }
    return str;
}

export let element_attribute_deprecated: Rule = {
    id: "element_attribute_deprecated",
    context: "dom:applet, dom:basefont, dom:center, dom:dir, dom:font, dom:isindex, dom:listing, dom:menu, dom:plaintext, dom:spacer, dom:s, dom:strike, dom:u, dom:xmp, dom:acronym, dom:frame, dom:frameset, dom:noframes, dom:noembed, dom:big, dom:blink, dom:marquee, dom:ttNaNdom:*[align], dom:*[link], dom:*[archive], dom:*[background], dom:*[bgcolor], dom:*[clear], dom:*[code], dom:*[color], dom:*[compact], dom:*[face], dom:*[hspace], dom:*[language], dom:*[link], dom:*[noshade], dom:*[nowrap], dom:*[object], dom:*[prompt], dom:*[start], dom:*[text], dom:*[version], dom:*[vlink], dom:*[vspace]NaNdom:td[height], dom:td[width], dom:td[abbr], dom:td[axis], dom:td[char], dom:td[charoff], dom:td[height], dom:td[nowrap], dom:td[valign], dom:td[width], dom:td[align], dom:td[bgcolor], dom:th[height], dom:th[width], dom:th[abbr], dom:th[axis], dom:th[charoff], dom:th[height], dom:th[bgcolor], dom:th[align], dom:th[nowrap], dom:th[char], dom:th[valign], dom:th[width], dom:li[type], dom:li[value], dom:li[type], dom:ul[type], dom:ul[compact], dom:pre[width], dom:meta[http-equiv], dom:a[charset], dom:a[coords], dom:a[shape], dom:a[rev], dom:a[scheme], dom:link[rev], dom:link[charset], dom:link[target], dom:img[name], dom:img[longdesc], dom:img[align], dom:img[hspace], dom:img[vspace], dom:img[border], dom:area[nohref], dom:head[profile], dom:html[version], dom:iframe[longdesc], dom:iframe[align], dom:iframe[frameborder], dom:iframe[marginheight], dom:iframe[marginwidth], dom:iframe[scrolling], dom:object[archive], dom:object[code], dom:object[codebase], dom:object[codetype], dom:object[declare], dom:object[standby], dom:object[align], dom:object[hspace], dom:object[vspace], dom:object[border], dom:param[type], dom:param[valuetype], dom:script[language], dom:body[alink], dom:body[background], dom:body[bgcolor], dom:body[link], dom:body[text], dom:body[vlink], dom:br[clear], dom:caption[align], dom:col[align], dom:col[char], dom:col[charoff], dom:col[valign], dom:col[width], dom:div[align], dom:dl[compact], dom:hr[align], dom:hr[noshade], dom:hr[size], dom:hr[width], dom:hr[align], dom:h2[align], dom:h3[align], dom:h4[align], dom:h5[align], dom:h6[align], dom:input[align], dom:input[usemap], dom:legend[align], dom:menu[compact], dom:ol[compact], dom:ol[type], dom:ol[type], dom:p[align], dom:table[bgcolor], dom:table[cellpadding], dom:table[cellspacing], dom:table[frame], dom:table[rules], dom:table[width], dom:table[align], dom:tbody[align], dom:tbody[char], dom:tbody[valign], dom:tbody[charoff], dom:tfoot[align], dom:tfoot[charoff], dom:tfoot[char], dom:tfoot[valign], dom:thead[char], dom:thead[charoff], dom:thead[valign], dom:thead[align], dom:tr[align], dom:tr[bgcolor], dom:tr[char], dom:tr[charoff], dom:tr[valign]",
    help: {
        "en-US": {
            "pass": "element_attribute_deprecated.html",
            "fail_elem": "element_attribute_deprecated.html",
            "fail_attr": "element_attribute_deprecated.html",
            "fail_elem_attr": "element_attribute_deprecated.html",
            "group": "element_attribute_deprecated.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "Rule Passed",
            "fail_elem": "The <{0}> element is deprecated in HTML 5",
            "fail_attr": "The HTML attribute(s) \"{0}\" is deprecated in HTML 5",
            "fail_elem_attr": "The HTML attribute(s) \"{0}\" is deprecated for the <{1}> element in HTML 5",
            "group": "Avoid use of obsolete features if possible"
        }
    },
    rulesets: [{ 
        "id": ["IBM_Accessibility"], 
        "num": ["HTML"], 
        "level": eRulePolicy.RECOMMENDATION, 
        "toolkitLevel": eToolkitLevel.LEVEL_THREE 
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;

        // HTMLUnit auto adds a tbody[align=left] to tables if tbody is missing!
        if (ruleContext.nodeName.toLowerCase() === "tbody" && ruleContext.hasAttribute("align")) {
            return RulePass("pass");
        }
        if (ruleContext.nodeName.includes("-")) {
            // This is a webcomponent element, HTML doesn't define what's deprecated
            return null;
        }

        const nodeName = ruleContext.nodeName.toLowerCase();

        let ret = [];
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

        return RulePass("pass");
    }
}