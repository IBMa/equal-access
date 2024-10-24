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

import { CacheUtil } from "./CacheUtil";
import { CommonUtil } from "./CommonUtil";
import { AriaUtil } from "./AriaUtil";
import { DOMMapper } from "../../v2/dom/DOMMapper";
import { DOMWalker } from "../../v2/dom/DOMWalker";

type PseudoClass =
    | ":hover"
    | ":active"
    | ":focus"
    | ":focus-visible"
    | ":focus-within";

export class CSSUtil {
    public static selectorMatchesElem(element, selector) {
        try {
            if (selector.trim() === "") return false;
            if (typeof element.matches === "function") {
                return element.matches(selector);
            }

            if (typeof element.matchesSelector === "function") {
                return element.matchesSelector(selector);
            }

            // Native functions not there, fallback
            let matches = (
                element.document || element.ownerDocument
            ).querySelectorAll(selector);
            let i = 0;

            while (i < matches.length && matches[i] !== element) {
                ++i;
            }

            return i < matches.length;
        } catch (err) {
            // Bad selector? Doesn't match then...
            return false;
        }
    }

    /**
     * Returns the style computed for this element
     * @param elem
     */
    public static getComputedStyle(elem: HTMLElement, pseudoElt?: PseudoClass) {
        if (!elem) return null;
        const doc = elem.ownerDocument;
        const win = doc.defaultView;
        return win.getComputedStyle(elem, pseudoElt);
    }

    /**
     * Returns the style defined for this element
     *
     * This differs from the computed style in that the computed style will return
     * styles defined by the user agent. This will only return styles defined by the
     * application
     * if rotation transform is used, the computed style returns the resolved matrix
     *  while the defined style return the transform function(s)
     * for example, for 'transform: rotate(2.5deg);', the computed style returns 'matrix(-0.0436194, 0.999048, -0.999048, -0.0436194, 0, 0)'
     *  and the defined style returns 'rotate(2.5deg)'
     *
     * change the type of the parameter pseudoClass from PseudoClass to string to include both pseudo classes (e.g., :focus, :checked)
     * and pseudo elements (e.g., ::before, ::after).
     *
     * @param {HTMLElement} elem
     * @param {string} [pseudoClass] If specified, will return values that are different
     * than when the pseudoClass does not match.
     */
    public static getDefinedStyles(elem: HTMLElement, pseudoClass?: string) {
        // console.log("Function: getDefinedStyles");
        if (!elem) return null;

        let definedStyles = {};
        let definedStylePseudo = {};

        function fillStyle(maps, style) {
            for (let sIndex = 0; sIndex < style.length; ++sIndex) {
                if (style[sIndex] === "all" && style[style[sIndex]]) {
                    for (const map of maps) {
                        for (const key in map) {
                            delete map[key];
                        }
                    }
                    break;
                } else {
                    const key = style[sIndex];
                    for (const map of maps) {
                        let priority = style.getPropertyPriority(key);
                        if (key in map && map[key].endsWith("!important")) {
                            if (
                                priority === "important" &&
                                !map[key].startsWith("inherit") &&
                                !map[key].startsWith("unset")
                            )
                                //override !important only if it is also !important
                                map[key] = style[key] + " !important";
                            //don't override !important if it is not !important
                            else continue;
                        }
                        //create/overide anyway
                        else
                            map[key] =
                                style[key] +
                                (priority === "important" ? " !important" : "");
                    }
                }
            }
        }

        let storedStyles = CacheUtil.getCache(elem, "RPTUtil_DefinedStyles", null);
        if (!pseudoClass && storedStyles) {
            definedStyles = storedStyles["definedStyles"];
            definedStylePseudo = storedStyles["definedStylePseudo"];
        } else {
            // Iterate through all of the stylesheets and rules
            for (
                let ssIndex = 0;
                ssIndex < elem.ownerDocument.styleSheets.length;
                ++ssIndex
            ) {
                const sheet = elem.ownerDocument.styleSheets[
                    ssIndex
                ] as CSSStyleSheet;
                try {
                    if (sheet && sheet.cssRules) {
                        // console.log("Got sheet");
                        for (
                            let rIndex = 0;
                            rIndex < sheet.cssRules.length;
                            ++rIndex
                        ) {
                            // console.log("Got rule: ", sheet.cssRules[rIndex]);
                            const rule = sheet.cssRules[rIndex] as CSSStyleRule;
                            const fullRuleSelector = rule.selectorText;
                            if (fullRuleSelector) {
                                const pseudoMatch =
                                    fullRuleSelector.match(
                                        /^(.*)(:[a-zA-Z-]*)$/
                                    );
                                const hasPseudoClass = !!pseudoMatch;
                                let selMain = hasPseudoClass
                                    ? pseudoMatch[1]
                                    : fullRuleSelector;
                                const selPseudo = hasPseudoClass
                                    ? pseudoMatch[2]
                                    : "";
                                const samePseudoClass =
                                    selPseudo === pseudoClass;
                                if (pseudoClass && pseudoClass === ":focus") {
                                    // If this element has focus, remove focus-within from parents
                                    selMain = selMain.replace(
                                        /([ >][^+~ >]+):focus-within/g,
                                        "$1"
                                    );
                                }

                                // Get styles of non-pseudo selectors
                                if (
                                    !hasPseudoClass &&
                                    CSSUtil.selectorMatchesElem(elem, selMain)
                                ) {
                                    fillStyle(
                                        [definedStyles, definedStylePseudo],
                                        rule.style
                                    );
                                }

                                if (
                                    samePseudoClass &&
                                    CSSUtil.selectorMatchesElem(elem, selMain)
                                ) {
                                    fillStyle([definedStylePseudo], rule.style);
                                }
                            }
                        }
                    }
                } catch (err) {
                    if (
                        !err.toString().includes("Cannot access rules") &&
                        !err.toString().includes("SecurityError:")
                    ) {
                        throw err;
                    }
                }
            }
            //

            // Handled the stylesheets, now handle the element defined styles
            fillStyle([definedStyles, definedStylePseudo], elem.style);
            CacheUtil.setCache(elem, "RPTUtil_DefinedStyles", {
                definedStyles,
                definedStylePseudo,
            });
        }
        /**
     * 'initial' sets the style back to default
    for (const key in definedStyles) {
        if (definedStyles[key] === "initial") {
            delete definedStyles[key];
        }
    }
    for (const key in definedStylePseudo) {
        if (definedStylePseudo[key] === "initial") {
            delete definedStylePseudo[key];
        }
    }
    */

        if (!pseudoClass) {
            // console.log("[DEBUG: CSSUtil::getDefinedStyles]", elem.nodeName, pseudoClass, JSON.stringify(definedStyles, null, 2));
            return definedStyles;
        } else {
            for (const key in definedStylePseudo) {
                if (definedStylePseudo[key] === definedStyles[key]) {
                    delete definedStylePseudo[key];
                }
            }
            // console.log("[DEBUG: CSSUtil::getDefinedStyles]", elem.nodeName, pseudoClass, JSON.stringify(definedStylePseudo, null, 2));
            return definedStylePseudo;
        }
    }

    /**
     * Returns the media query defined for the document
     * 
     * 
     * @param {Document} doc 
     */
    public static getMediaOrientationTransform(doc: Document) {
        let orientationTransforms = {}

        // Iterate through all of the stylesheets and rules
        for (let ssIndex = 0; ssIndex < doc.styleSheets.length; ++ssIndex) {
            const sheet = doc.styleSheets[ssIndex] as CSSStyleSheet;
            try {
                if (sheet && sheet.cssRules) {
                    for (let rIndex = 0; rIndex < sheet.cssRules.length; ++rIndex) {
                        const sheetRule = sheet.cssRules[rIndex];
                        if (4 /* CSSRule.MEDIA_RULE */ === sheetRule.MEDIA_RULE) {
                            const rule = sheetRule as CSSMediaRule;
                            if (rule && rule.media) {
                                const mediaList = rule.media;
                                for (let i = 0; i < mediaList.length; i++) {
                                    if (!mediaList.item(i)) continue;
                                    let elem_transforms = orientationTransforms[mediaList.item(i).toLocaleLowerCase()];
                                    if (!elem_transforms) elem_transforms = {};
                                    let styleRules = rule.cssRules;
                                    for (let i = 0; i < styleRules.length; ++i) {
                                        if (1 /* CSSRule.STYLE_RULE */ === styleRules[i].STYLE_RULE) {
                                            const styleRule = styleRules[i] as CSSStyleRule;
                                            const selector = styleRule.selectorText;
                                            if (selector) {
                                                let transforms = {};
                                                const styles = styleRule.style;
                                                for (let s = 0; s < styles.length; ++s) {
                                                    const key = styles[s];
                                                    if (key.toLocaleLowerCase() === "transform") {
                                                        if (key === "all" && styles[key]) {
                                                            delete transforms[key];
                                                            break;
                                                        } else {
                                                            transforms[key] = styles[key];
                                                        }
                                                    } else if (key.toLocaleLowerCase() === "rotate") {
                                                        transforms[key] = styles[key];
                                                    }
                                                    elem_transforms[selector] =
                                                        transforms;
                                                }
                                            }
                                        }
                                        if (mediaList.item(i))
                                            orientationTransforms[mediaList.item(i).toLocaleLowerCase()] = elem_transforms;
                                    }
                                }
                            }
                        }
                    }
                }  
            } catch (err) {
                if (
                    !err.toString().includes("Cannot access rules") &&
                    !err.toString().includes("SecurityError:")
                ) {
                    throw err;
                }
            }
        }
        return orientationTransforms;
    }

    /**
     * convert given rotation transform functions to the degree transformed.
     * If multiple functions are given, then the functions are applied linearly in the order.
     *   rotation_transform function example:  rotate(45deg), rotate(2turn), rotate(2rad), rotate3d(1, 1, 1, 45deg),
     *        rotate(2rad) rotate3d(1, 1, 1, 45deg)
     * @param rotation_transform
     */
    public static getRotationDegree(rotation_transform) {
        let degree = 0;
        try {
            if (!rotation_transform) return degree;
            // normalize the rotation_transform
            rotation_transform = rotation_transform.replaceAll(", ", ",");
            const transform_functions = rotation_transform.split(" ");
            for (let i = 0; i < transform_functions.length; i++) {
                const transform_function = transform_functions[i].trim();
                if (transform_function === "") continue;
                if (transform_function.startsWith("rotate3d")) {
                    // example: rotate3d(1, 1, 1, 45deg);
                    const left = transform_function.indexOf("(");
                    const right = transform_function.indexOf(")");
                    if (left !== -1 && right !== -1) {
                        let matrix = transform_function.substring(
                            left + 1,
                            right
                        );
                        let values;
                        if (matrix) values = matrix.split(",");
                        if (values && values.length === 4) {
                            let rotation = values[3];
                            if (!rotation) continue;
                            rotation = rotation.trim();
                            if (rotation.endsWith("turn")) {
                                let num = rotation.substring(
                                    0,
                                    rotation.length - 4
                                );
                                num = parseFloat(num);
                                if (!isNaN(num)) degree = num * 360;
                            } else if (rotation.endsWith("rad")) {
                                let num = rotation.substring(
                                    0,
                                    rotation.length - 3
                                );
                                num = parseFloat(num);
                                if (!isNaN(num)) degree = (num * 180) / Math.PI;
                            } else if (rotation.endsWith("deg")) {
                                let num = rotation.substring(
                                    0,
                                    rotation.length - 3
                                );
                                num = parseFloat(num);
                                if (!isNaN(num)) degree += num;
                            }
                        }
                    }
                } else if (
                    transform_function.startsWith("rotate") ||
                    transform_function.startsWith("rotateZ")
                ) {
                    // example: rotate(45deg);
                    const left = transform_function.indexOf("(");
                    const right = transform_function.indexOf(")");
                    if (left !== -1 && right !== -1) {
                        let rotation = transform_function.substring(
                            left + 1,
                            right
                        );
                        if (!rotation) continue;
                        rotation = rotation.trim();
                        if (rotation.endsWith("turn")) {
                            let num = rotation.substring(
                                0,
                                rotation.length - 4
                            );
                            num = parseFloat(num);
                            if (!isNaN(num)) degree = num * 360;
                        } else if (rotation.endsWith("rad")) {
                            let num = rotation.substring(
                                0,
                                rotation.length - 3
                            );
                            num = parseFloat(num);
                            if (!isNaN(num)) degree = (num * 180) / Math.PI;
                        } else if (rotation.endsWith("deg")) {
                            let num = rotation.substring(
                                0,
                                rotation.length - 3
                            );
                            num = parseFloat(num);
                            if (!isNaN(num)) degree += num;
                        }
                    }
                } else if (transform_function.startsWith("matrix3d")) {
                    // calculate the three Euler angles
                    const left = transform_function.indexOf("(");
                    const right = transform_function.indexOf(")");
                    if (left !== -1 && right !== -1) {
                        let matrix = transform_function.substring(
                            left + 1,
                            right
                        );
                        let values = null;
                        if (matrix) values = matrix.split(",");
                        if (values !== null) {
                            const z_angle = Math.atan2(values[4], values[5]);
                            degree += Math.round(
                                Math.round((z_angle * 180) / Math.PI)
                            );
                        }
                    }
                } else if (transform_function.startsWith("matrix")) {
                    // calculate the three Euler angles
                    const left = transform_function.indexOf("(");
                    const right = transform_function.indexOf(")");
                    if (left !== -1 && right !== -1) {
                        let matrix = transform_function.substring(
                            left + 1,
                            right
                        );
                        let values = null;
                        if (matrix) values = matrix.split(",");
                        if (values !== null) {
                            const z_angle = Math.atan2(values[1], values[0]);
                            degree += Math.round(
                                Math.round((z_angle * 180) / Math.PI)
                            );
                        }
                    }
                }
            }

            while (degree >= 360) degree -= 360;
        } catch (err) {
            console.log("Cannot retrieve rotation degree: " + err);
            throw err;
        }
        return degree;
    }

    /**
     * Convert CSS style string values to pixels.
     *
     * @param value style value in string, such as 3rem, 230px etc.
     * @param target element.
     * @return value in pixels
     */
    public static getPixelsFromStyle(value, elem) {
        if (!value) return 0;
        const regex = /(-?[\d.]+)([a-z%]*)/;
        let parsed = value.trim().match(regex);
        if (parsed === null) return 0;
        if (parsed[2] === "" || parsed[1] === 0)
            //no zero value without unit which is considered as error, so implicable
            return 0;

        const pixels = CSSUtil.convertValue2Pixels(parsed[2], parsed[1], elem);
        return pixels === null ? pixels : parseFloat(pixels);
    }

    /**
     * Convert absolute CSS numerical values to pixels.
     *
     * @param unitValue in string
     * @param target element.
     * @return value in pixels
     */
    public static convertValue2Pixels(unit, unitValue, elem) {
        if (unitValue == 0) return 0;
        const supportedUnits = {
            // absolute unit
            px: (value) => value,
            cm: (value) => value * 37.8,
            mm: (value) => value * 3.78,
            q: (value) => value * 0.95,
            in: (value) => value * 96,
            pc: (value) => value * 16,
            pt: (value) => value * 1.33,

            // relative unit
            rem: (value) =>
                value *
                parseFloat(
                    getComputedStyle(
                        elem.ownerDocument.documentElement
                    ).getPropertyValue("font-size")
                ),
            em: (value) =>
                value *
                parseFloat(
                    getComputedStyle(elem).getPropertyValue("font-size")
                ),
            vw: (value) =>
                (value / 100) * elem.ownerDocument.defaultView.innerWidth,
            vh: (value) =>
                (value / 100) * elem.ownerDocument.defaultView.innerHeight,
            "%": (value) =>
                (value / 100) *
                parseFloat(
                    getComputedStyle(elem).getPropertyValue("font-size")
                ),
        };

        if (unit in supportedUnits) return supportedUnits[unit](unitValue);

        return null;
    }
    /*
     * Returns if the font for visible text of the element is defined by material icons
     *
     * @param {HTMLElement} elem
     */
    public static isMaterialIconFont(elem: HTMLElement) {
        // TODO: check the existence material icons using fetch in node 18+
        // for now (node 16) just dertermine if the stylesheet for the 'Material Icons' exists statically. note that the loading of the font stylesheet occurs at run time.
        //list of known material icons and stylesheet link
        const known_icons = {
            "Material Icons":
                "https://fonts.googleapis.com/icon?family=Material+Icons",
        };
        const known_css_classes = {
            "material-icons":
                "https://fonts.googleapis.com/icon?family=Material+Icons",
        };

        // material icon font can be defined either by font-family: 'Material Icons' or by class="material-icons"
        let styles = CSSUtil.getDefinedStyles(elem);
        let fontFamily = styles["font-family"];

        let found = false;
        // font-family specifies a prioritized list of one or more font family names
        if (
            fontFamily &&
            fontFamily.split(",")[0].replace(/['"]+/g, "").trim() in known_icons
        )
            found = true;

        if (!found) {
            let list = elem.classList;
            for (let css_class in known_css_classes) {
                if (list.contains(css_class)) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) return false;

        let passed = false;
        // check if the stylesheet for the 'Material Icons' exists statically
        let sheets = elem.ownerDocument.styleSheets;
        for (let s = 0; s < sheets.length; s++) {
            if (
                sheets &&
                sheets.length > 0 &&
                Object.values(known_icons).indexOf(sheets[s].href) > -1
            ) {
                passed = true;
                break;
            }
        }
        return passed;
    }

    public static getWeightNumber(styleVal) {
        let map = {
            light: 100,
            bold: 700,
        };
        let retVal = parseInt(styleVal);
        if (retVal) return retVal;
        if (styleVal in map) return map[styleVal];
        return 400;
    }

    public static getFontInPixels(styleVal, elem) {
        let map = {
            "xx-small": 16,
            "x-small": 10,
            small: 13,
            medium: 16,
            large: 18,
            "x-large": 24,
            "xx-large": 32,
        };
        let value = parseFloat(styleVal);
        if (!value) {
            return map[styleVal];
        }
        let units = styleVal.substring(("" + value).length);
        /**
        if (units === "" || units === "px") return value;
        if (units === "em") return value * 16;
        if (units === "%") return value / 100 * 16;
        if (units === "pt") return value * 4 / 3;
        return Math.round(value);
    */
        return CSSUtil.convertValue2Pixels(units, value, elem);
    }

    public static getCSSStyle(element) {
        let styleText = "";
        if (element === null) return [];
        if (element.IBM_CSS_THB) return element.IBM_CSS_THB;
        let nodeName = element.nodeName.toLowerCase();
        if (nodeName === "style") {
            styleText = element.innerText;
            if (styleText === undefined || styleText.trim() === "")
                styleText = element.textContent;
        } else if (element.hasAttribute("style")) {
            styleText = element.getAttribute("style");
        } else return [];
        if (styleText === null || styleText.trim().length === 0) return [];
        //remove comment blocks
        let re = /(\/\*+(?:(?:(?:[^\*])+)|(?:[\*]+(?!\/)))[*]+\/)|\/\/.*/g;
        let subst = " ";
        styleText = styleText.replace(re, subst);
        // Find all "key : val;" pairs with various whitespace inbetween
        let rKeyVals = /\s*([^:\s]+)\s*:\s*([^;$}]+)\s*(;|$)/g;
        // Find all "selector { csskeyvals } with various whitespace inbetween
        let rSelectors = /\s*([^{]*){([^}]*)}/g;
        if (styleText.indexOf("{") === -1) {
            let keyVals = {};
            let m;
            while ((m = rKeyVals.exec(styleText)) != null) {
                keyVals[m[1]] = m[2].trim().toLowerCase();
            }
            let retVal = [
                {
                    selector: null,
                    values: keyVals,
                },
            ];
            element.IBM_CSS_THB = retVal;
            return retVal;
        } else {
            let retVal = [];
            let m;
            let m2;
            while ((m = rSelectors.exec(styleText)) != null) {
                let keyVals = {};
                let selKey = m[1];
                let selVal = m[2];

                while ((m2 = rKeyVals.exec(selVal)) != null) {
                    keyVals[m2[1]] = m2[2].trim().toLowerCase();
                }
                retVal.push({
                    selector: selKey,
                    values: keyVals,
                });
            }
            element.IBM_CSS_THB = retVal;
            return retVal;
        }
    }

    /**
     * an "inline" CSS display property tells the element to fit itself on the same line. An 'inline' element's width and height are ignored.
     * some element has default inline property, such as <span>, <a>
     * most formatting elements inherent inline property, such as <em>, <strong>, <i>, <small>
     * other inline elements: <abbr> <acronym> <b> <bdo> <big> <br> <cite> <code> <dfn> <em> <i> <input> <kbd> <label>
     * <map> <object> <output> <q> <samp> <script> <select> <small> <span> <strong> <sub> <sup> <textarea> <time> <tt> <var>
     * an "inline-block" element still place element in the same line without breaking the line, but the element's width and height are applied.
     * inline-block elements: img, button, select, meter, progress, marguee, also in Chrome: textarea, input
     * A block-level element always starts on a new line, and the browsers automatically add some space (a margin) before and after the element.
     * block-level elements: <address> <article> <aside> <blockquote> <canvas> <dd> <div> <dl> <dt> <fieldset> <figcaption> <figure> <footer> <form>
     * <h1>-<h6> <header> <hr> <li> <main> <nav> <noscript> <ol> <p> <pre> <section> <table> <tfoot> <ul> <video>
     *
     * return: if it's inline element and { inline: true | false, text: true | false, violation: null | {node} }
     */
    public static getInlineStatus(element) {
        if (!element) return null;

        const style = getComputedStyle(element);
        if (!style) return null;

        let status = { inline: false, text: false, violation: null };
        const udisplay = style.getPropertyValue("display");
        // inline element only
        if (udisplay !== "inline") return status;

        status.inline = true;
        const parent = element.parentElement;
        if (parent) {
            const mapper: DOMMapper = new DOMMapper();
            const bounds = mapper.getUnadjustedBounds(element);
            const style = getComputedStyle(parent);
            const display = style.getPropertyValue("display");
            // an inline element is inside a block. note <body> is a block element too
            if (display === "block" || display === "inline-block") {
                let containText = false;
                // one or more inline elements with text in the same line: <target>, text<target>, <target>text, <inline>+text<target>, <target><inline>+text, text<target><inline>+
                let walkNode = element.nextSibling;
                let last = true;
                while (walkNode) {
                    // note browsers insert Text nodes to represent whitespaces.
                    if (
                        !containText &&
                        walkNode.nodeType === Node.TEXT_NODE &&
                        walkNode.nodeValue &&
                        walkNode.nodeValue.trim().length > 0
                    ) {
                        containText = true;
                    } else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        // special case: <br> is styled 'inline' by default, but change the line
                        if (
                            status.violation === null &&
                            walkNode.nodeName.toLowerCase() !== "br"
                        ) {
                            const cStyle = getComputedStyle(walkNode);
                            const cDisplay = cStyle.getPropertyValue("display");
                            if (cDisplay === "inline") {
                                last = false;
                                if (
                                    CommonUtil.isTarget(walkNode) &&
                                    bounds.width < 24
                                ) {
                                    // check if the horizontal spacing is sufficient
                                    const bnds =
                                        mapper.getUnadjustedBounds(walkNode);
                                    if (
                                        Math.round(bounds.width / 2) +
                                        bnds.left -
                                        (bounds.left + bounds.width) <
                                        24
                                    )
                                        status.violation =
                                            walkNode.nodeName.toLowerCase();
                                }
                            } else break;
                        }
                    }
                    walkNode = walkNode.nextSibling;
                }

                walkNode = element.previousSibling;
                let first = true;
                let checked = false;
                while (walkNode) {
                    // note browsers insert Text nodes to represent whitespaces.
                    if (
                        !containText &&
                        walkNode.nodeType === Node.TEXT_NODE &&
                        walkNode.nodeValue &&
                        walkNode.nodeValue.trim().length > 0
                    ) {
                        containText = true;
                    } else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        // special case: <br> is styled 'inline' by default, but change the line
                        if (
                            !checked &&
                            walkNode.nodeName.toLowerCase() !== "br"
                        ) {
                            const cStyle = getComputedStyle(walkNode);
                            const cDisplay = cStyle.getPropertyValue("display");
                            if (cDisplay === "inline") {
                                first = false;
                                checked = true;
                                if (
                                    CommonUtil.isTarget(walkNode) &&
                                    bounds.width < 24
                                ) {
                                    // check if the horizontal spacing is sufficient
                                    const bnds =
                                        mapper.getUnadjustedBounds(walkNode);
                                    if (
                                        Math.round(bounds.width / 2) +
                                        bounds.left -
                                        (bnds.left + bnds.width) <
                                        24
                                    ) {
                                        status.violation =
                                            status.violation === null
                                                ? walkNode.nodeName.toLowerCase()
                                                : status.violation +
                                                ", " +
                                                walkNode.nodeName.toLowerCase();
                                    }
                                }
                            } else break;
                        }
                    }
                    walkNode = walkNode.previousSibling;
                }

                // one or more inline elements are in the same line with text
                if (containText) status.text = true;

                return status;
            } else {
                //parent is inline element
                if (!CommonUtil.isInnerTextOnlyEmpty(parent)) status.text = true;
            }
        }
        // all other cases
        return status;
    }

    /**
     * a target is en element that accept a pointer action (click or touch)
     * a target is a browser default if it's a native widget (no user defined role) without user style
     */
    public static isTargetBrowserDefault(element) {
        if (!element) return false;

        // user defined widget
        const roles = AriaUtil.getRoles(element, false);
        if (roles && roles.length > 0) return false;

        // no user style to space control size, including use of font
        const styles = CSSUtil.getDefinedStyles(element);
        if (
            styles["line-height"] ||
            styles["height"] ||
            styles["width"] ||
            styles["min-height"] ||
            styles["min-width"] ||
            styles["font-size"] ||
            styles["margin-top"] ||
            styles["margin-bottom"] ||
            styles["margin-left"] ||
            styles["margin-right"]
        )
            return false;

        return true;
    }

    /*
     * string contains CJK (chinese, japaneses, or korea)
     * return: boolean
     */
    public static containsCKJ(text: string) {
        if (!text) return false;

        // https://en.wikipedia.org/wiki/CJK_Unified_Ideographs  https://ayaka.shn.hk/hanregex/
        let regex = /(?:[\u4e00-\u9fff\u3400-\u4dbf])+/g;

        const replaced = text.trim().replace(regex, "");
        if (replaced.length === text.trim().length) return false;

        return true;
    }

    /**
     * return the ancestor with the given style properties.
     *
     * @parm {element} element - The element to start the node walk on to find parent node
     * @parm {[string]} styleProps - The style properties and values of the parent to search for.
     *         such as {"overflow":['auto', 'scroll'], "overflow-x":['auto', 'scroll']}
     *          or {"overflow":['*'], "overflow-x":['*']}, The '*' for any value to check the existence of the style prop.
     * @parm {bool} excludedValues - style values that should be ignored.
     * @return {node} walkNode - A parent node of the element, which has the style properties
     * @memberOf AriaUtil
     */
    public static getAncestorWithStyles(elem, styleProps, excludedValues = []) {
        let walkNode = elem;
        while (walkNode !== null) {
            const node = CacheUtil.getCache(walkNode, "AriaUtil_AncestorWithStyles", null);
            if (node) return node;

            const styles = CSSUtil.getDefinedStyles(walkNode);
            for (const style in styleProps) {
                let value = styles[style];
                if (value) {
                    value = value.split(" ")[0]; //get rid of !important
                    if (!excludedValues.includes(value)) {
                        if (styleProps[style].includes('*')) {
                            CacheUtil.setCache(walkNode, "AriaUtil_AncestorWithStyles", walkNode);
                            return walkNode;
                        } else if (styleProps[style].includes(value)) {
                            CacheUtil.setCache(walkNode, "AriaUtil_AncestorWithStyles", walkNode);
                            return walkNode;
                        }
                    }
                }
            }
            walkNode = DOMWalker.parentElement(walkNode);
        }
        CacheUtil.setCache(elem, "AriaUtil_AncestorWithStyles", undefined);
        return null;
    }

}
