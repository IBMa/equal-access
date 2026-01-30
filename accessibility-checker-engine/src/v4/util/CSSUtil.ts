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
import { Bounds } from "../api/IBounds";

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
     * Helper function to check if a selector matches an element, with caching
     * Caches selector match results at the element level to avoid re-checking
     */
    private static selectorMatchesElemCached(elem: HTMLElement, selector: string): boolean {
        // Get or initialize the selector cache for this element
        let elemSelectorCache = CacheUtil.getCache(elem, "RPTUtil_ElemSelectorCache", {});
        
        if (elemSelectorCache[selector] !== undefined) {
            return elemSelectorCache[selector];
        }
        
        // Not cached, perform the actual match
        const matches = CSSUtil.selectorMatchesElem(elem, selector);
        
        // Cache the result
        elemSelectorCache[selector] = matches;
        CacheUtil.setCache(elem, "RPTUtil_ElemSelectorCache", elemSelectorCache);
        
        return matches;
    }

    /**
     * Parse and cache all stylesheet rules at the document level
     * Returns an array of parsed rule objects with selector and style information
     */
    private static getParsedStylesheetRules(ownerDoc: Document): Array<{
        fullRuleSelector: string;
        hasPseudoClass: boolean;
        selMain: string;
        selPseudo: string;
        style: CSSStyleDeclaration;
    }> {
        // Check if we already have cached parsed rules for this document
        const cachedRules = CacheUtil.getCache(ownerDoc, "RPTUtil_ParsedStylesheetRules", null);
        if (cachedRules) {
            return cachedRules;
        }

        const parsedRules = [];

        // Iterate through all of the stylesheets and rules
        for (let ssIndex = 0; ssIndex < ownerDoc.styleSheets.length; ++ssIndex) {
            const sheet = ownerDoc.styleSheets[ssIndex] as CSSStyleSheet;
            try {
                if (sheet && sheet.cssRules) {
                    for (let rIndex = 0; rIndex < sheet.cssRules.length; ++rIndex) {
                        const rule = sheet.cssRules[rIndex] as CSSStyleRule;
                        const fullRuleSelector = rule.selectorText;
                        if (fullRuleSelector) {
                            const pseudoMatch = fullRuleSelector.match(/^(.*)(:[a-zA-Z-]*)$/);
                            const hasPseudoClass = !!pseudoMatch;
                            const selMain = hasPseudoClass ? pseudoMatch[1] : fullRuleSelector;
                            const selPseudo = hasPseudoClass ? pseudoMatch[2] : "";

                            parsedRules.push({
                                fullRuleSelector,
                                hasPseudoClass,
                                selMain,
                                selPseudo,
                                style: rule.style
                            });
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

        // Cache the parsed rules at the document level
        CacheUtil.setCache(ownerDoc, "RPTUtil_ParsedStylesheetRules", parsedRules);
        return parsedRules;
    }

    /**
     * Private helper method to fill style maps from a CSSStyleDeclaration
     * Handles CSS property priorities and the "all" shorthand property
     */
    private static fillStyle(maps: any[], style: CSSStyleDeclaration): void {
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
                            map[key] = style[key] + " !important";
                        else continue;
                    } else
                        map[key] =
                            style[key] +
                            (priority === "important" ? " !important" : "");
                }
            }
        }
    }

    /**
     * Private helper method that consolidates the logic for getting defined styles
     * Used by both getDefinedStyles and getDefinedStylesMultiple
     */
    private static getDefinedStylesInternal(
        elem: HTMLElement,
        pseudoClasses: string[]
    ): { [pseudoClass: string]: any } {
        const results = {};
        const definedStylesMap = {};
        const definedStylePseudoMap = {};

        // Initialize result objects for all pseudo-classes
        for (const pseudoClass of pseudoClasses) {
            definedStylesMap[pseudoClass] = {};
            definedStylePseudoMap[pseudoClass] = {};
        }

        // Get pre-parsed stylesheet rules from cache
        const parsedRules = CSSUtil.getParsedStylesheetRules(elem.ownerDocument);

        // Process each cached rule
        for (const parsedRule of parsedRules) {
            let selMain = parsedRule.selMain;
            const selPseudo = parsedRule.selPseudo;
            const hasPseudoClass = parsedRule.hasPseudoClass;

            // Process for each pseudo-class
            for (const pseudoClass of pseudoClasses) {
                // Reset selMain for each pseudo-class in case it was modified
                selMain = parsedRule.selMain;
                
                if (pseudoClass === ":focus" && selPseudo === ":focus") {
                    // If this element has focus, remove focus-within from parents
                    selMain = selMain.replace(
                        /([ >][^+~ >]+):focus-within/g,
                        "$1"
                    );
                }

                const samePseudoClass = selPseudo === pseudoClass;

                // Get styles of non-pseudo selectors - use cached selector matching
                if (
                    !hasPseudoClass &&
                    CSSUtil.selectorMatchesElemCached(elem, selMain)
                ) {
                    CSSUtil.fillStyle(
                        [definedStylesMap[pseudoClass], definedStylePseudoMap[pseudoClass]],
                        parsedRule.style
                    );
                }

                if (
                    samePseudoClass &&
                    CSSUtil.selectorMatchesElemCached(elem, selMain)
                ) {
                    CSSUtil.fillStyle([definedStylePseudoMap[pseudoClass]], parsedRule.style);
                }
            }
        }

        // Handle the element defined styles
        for (const pseudoClass of pseudoClasses) {
            CSSUtil.fillStyle([definedStylesMap[pseudoClass], definedStylePseudoMap[pseudoClass]], elem.style);
        }

        // Build results for all pseudo-classes
        for (const pseudoClass of pseudoClasses) {
            if (pseudoClass === "") {
                results[pseudoClass] = definedStylesMap[pseudoClass];
            } else {
                // For pseudo-classes, return only styles that differ from default
                let diffStyles = {};
                for (const key in definedStylePseudoMap[pseudoClass]) {
                    if (definedStylePseudoMap[pseudoClass][key] !== definedStylesMap[pseudoClass][key]) {
                        diffStyles[key] = definedStylePseudoMap[pseudoClass][key];
                    }
                }
                results[pseudoClass] = diffStyles;
            }
        }

        return results;
    }


    /**
     * Returns the style defined for this element for multiple pseudo-classes in a single pass
     *
     * This is more efficient than calling getDefinedStyles multiple times as it only
     * iterates through stylesheets once.
     *
     * @param {HTMLElement} elem
     * @param {string[]} pseudoClasses - Array of pseudo-classes to retrieve. Use "" for default (no pseudo-class).
     * @returns {Object} Object mapping each pseudo-class to its defined styles
     */
    public static getDefinedStylesMultiple(elem: HTMLElement, pseudoClasses: string[]) {
        if (!elem) return null;

        let results = {};

        // Check cache first - see if we have all requested pseudo-classes cached
        let cachedStyles = CacheUtil.getCache(elem, "RPTUtil_DefinedStyles", null);
        let missingPseudoClasses = [];
        
        if (cachedStyles) {
            // Check which pseudo-classes are already cached
            for (const pseudoClass of pseudoClasses) {
                if (cachedStyles[pseudoClass] !== undefined) {
                    results[pseudoClass] = cachedStyles[pseudoClass];
                } else {
                    missingPseudoClasses.push(pseudoClass);
                }
            }
            
            // If all are cached, return immediately
            if (missingPseudoClasses.length === 0) {
                return results;
            }
        } else {
            cachedStyles = {};
            missingPseudoClasses = pseudoClasses;
        }

        // Only process missing pseudo-classes using the internal helper
        if (missingPseudoClasses.length > 0) {
            const newResults = CSSUtil.getDefinedStylesInternal(elem, missingPseudoClasses);
            
            // Merge new results with cached results
            for (const pseudoClass of missingPseudoClasses) {
                results[pseudoClass] = newResults[pseudoClass];
                cachedStyles[pseudoClass] = newResults[pseudoClass];
            }

            // Update cache with all styles (existing + new)
            CacheUtil.setCache(elem, "RPTUtil_DefinedStyles", cachedStyles);
        }

        return results;
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
        if (!elem) return null;

        // Check cache first - use shared cache structure with getDefinedStylesMultiple
        const cacheKey = pseudoClass || "";
        let cachedStyles = CacheUtil.getCache(elem, "RPTUtil_DefinedStyles", null);
        
        if (cachedStyles && cachedStyles[cacheKey] !== undefined) {
            return cachedStyles[cacheKey];
        }
        
        // Initialize cache object if needed
        if (!cachedStyles) {
            cachedStyles = {};
        }

        // Use the internal helper method with a single pseudo-class
        const results = CSSUtil.getDefinedStylesInternal(elem, [cacheKey]);
        const result = results[cacheKey];
        
        // Cache the result
        cachedStyles[cacheKey] = result;
        CacheUtil.setCache(elem, "RPTUtil_DefinedStyles", cachedStyles);
        
        return result;
    }

    /**
     * Returns the media query defined for the document
     * Get media orientation transforms from stylesheets with caching
     * Returns transform/rotate properties for elements within media queries
     *
     * @param {Document} doc
     */
    public static getMediaOrientationTransform(doc: Document) {
        // Check if we already have cached media orientation transforms for this document
        const cachedTransforms = CacheUtil.getCache(doc, "RPTUtil_MediaOrientationTransforms", null);
        if (cachedTransforms) {
            return cachedTransforms;
        }

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
                                    const mediaKey = mediaList.item(i).toLocaleLowerCase();
                                    let elem_transforms = orientationTransforms[mediaKey];
                                    if (!elem_transforms) elem_transforms = {};
                                    let styleRules = rule.cssRules;
                                    for (let j = 0; j < styleRules.length; ++j) {
                                        if (1 /* CSSRule.STYLE_RULE */ === styleRules[j].STYLE_RULE) {
                                            const styleRule = styleRules[j] as CSSStyleRule;
                                            const selector = styleRule.selectorText;
                                            if (selector) {
                                                let transforms = {};
                                                const styles = styleRule.style;
                                                for (let s = 0; s < styles.length; ++s) {
                                                    const key = styles[s];
                                                    const keyLower = key.toLocaleLowerCase();
                                                    if (keyLower === "transform") {
                                                        if (key === "all" && styles[key]) {
                                                            transforms = {};
                                                            break;
                                                        } else {
                                                            transforms[key] = styles[key];
                                                        }
                                                    } else if (keyLower === "rotate") {
                                                        transforms[key] = styles[key];
                                                    }
                                                }
                                                if (Object.keys(transforms).length > 0) {
                                                    elem_transforms[selector] = transforms;
                                                }
                                            }
                                        }
                                    }
                                    if (Object.keys(elem_transforms).length > 0) {
                                        orientationTransforms[mediaKey] = elem_transforms;
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
        
        // Cache the media orientation transforms at the document level
        CacheUtil.setCache(doc, "RPTUtil_MediaOrientationTransforms", orientationTransforms);
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
        if (unitValue === 0) return 0;
        if (!unit) unit = "px";
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

        const elem_styl = getComputedStyle(element);
        if (!elem_styl) return null;

        let status = { inline: false, text: false, violation: null };
        const udisplay = elem_styl.getPropertyValue("display");
        // inline element only
        if (udisplay !== "inline") return status;

        status.inline = true;
        const parent = element.parentElement;
        if (!parent) return status;

        const mapper: DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(element);
        const style = getComputedStyle(parent);
        const display = style.getPropertyValue("display");
        // an inline element is inside a block. note <body> is a block element too
        if (display !== "block" && display !== "inline-block") {
            //parent is inline element
            if (!CommonUtil.isInnerTextOnlyEmpty(parent))
                status.text = true;
            return status;
        }

        /**
         * @returns "yes"": inline with text, "no": inline without text, 
         *          "violation": not spacing enough to neiboring inline target
         *          "block": block element,  
         */
        function isInlineWithText(node: Node, before: boolean) : string | null {
            // note browsers insert Text nodes to represent whitespaces.
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue && node.nodeValue.trim().length > 0)
                    return "yes";
                else
                    return "no";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // special case: <br> is styled 'inline' by default, but change the line
                if (node.nodeName.toLowerCase() === "br")
                    return "block";
                    
                const cStyle = getComputedStyle(node as Element);
                const cDisplay = cStyle.getPropertyValue("display");
                if (cDisplay === "inline") {
                    if (CommonUtil.isTarget(node)) {
                        if (bounds.width < 24) { 
                            // check if the horizontal spacing is sufficient
                            const bnds = mapper.getUnadjustedBounds(node);
                            if ((before && (Math.round(bounds.width / 2) + bounds.left - bnds.left < 24))
                                || (!before && (Math.round(bounds.width / 2) + bounds.left - (bnds.left + bnds.width) < 24))) {
                                status.violation = node.nodeName.toLowerCase();
                                return "violation";
                            } else
                                return "no";        
                        }           
                    } 
                    if (!CommonUtil.isInnerTextOnlyEmpty(node))
                        return "yes";
                    return "no";
                } else
                    return "block";
            } else
               return "block";
        }

        // an inline element is inside a block. note <body> is a block element too
        // one or more inline elements with text in the same line: <target>, text<target>, <target>text, <inline>+text<target>, <target><inline>+text, text<target><inline>+
        let walkNode = element.nextSibling;
        while (walkNode) {
            let inlineText = isInlineWithText(walkNode, true);
            if (inlineText === "yes") {
                status.text = true;
                break;
            }
            if (inlineText === "block") {
                break;
            }
            walkNode = walkNode.nextSibling;
        }

        walkNode = element.previousSibling;
        while (walkNode) {
            let inlineText = isInlineWithText(walkNode, false);
            if (inlineText === "yes") {
                status.text = true;
                break;
            }
            if (inlineText === "block") {
                break;
            }
            walkNode = walkNode.previousSibling;
        }
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
     * Return the ancestor with the given style properties.
     * Searches up the DOM tree to find an ancestor that has ALL specified style properties
     * with values matching the criteria.
     *
     * @param {element} elem - The element to start the node walk on to find parent node
     * @param {Object} styleProps - The style properties and values of the parent to search for.
     *         such as {"overflow":['auto', 'scroll'], "overflow-x":['auto', 'scroll']}
     *          or {"overflow":['*'], "overflow-x":['*']}, The '*' for any value to check the existence of the style prop.
     * @param {Array} excludedValues - style values that should be ignored.
     * @return {Element|null} - An ancestor element that has all the specified style properties, or null if none found
     * @memberOf CSSUtil
     */
    public static getAncestorWithStyles(elem, styleProps, excludedValues = []) {
        // Create a cache key that includes the style properties being searched for
        const cacheKey = "AriaUtil_AncestorWithStyles_" + JSON.stringify(styleProps) + "_" + JSON.stringify(excludedValues);
        
        // Check if we already have a cached result for this specific query
        const cachedResult = CacheUtil.getCache(elem, cacheKey, null);
        if (cachedResult !== null) {
            return cachedResult === "NOT_FOUND" ? null : cachedResult;
        }

        // Start with the element itself (not just parent) to maintain backward compatibility
        let walkNode = elem;
        while (walkNode !== null) {
            // Skip if not an HTMLElement (e.g., SVGElement)
            // Use nodeType check instead of instanceof to work across different document contexts
            if (walkNode.nodeType !== 1 || walkNode.namespaceURI === "http://www.w3.org/2000/svg") {
                walkNode = DOMWalker.parentElement(walkNode);
                continue;
            }
            
            const styles = CSSUtil.getDefinedStyles(walkNode);
            
            // Check if ANY specified style property matches the criteria (OR logic)
            for (const styleProp in styleProps) {
                let value = styles[styleProp];
                
                if (!value) {
                    // Property not defined on this element, try next property
                    continue;
                }
                
                // Remove !important suffix for comparison
                value = value.split(" ")[0];
                
                // Check if value should be excluded
                if (excludedValues.includes(value)) {
                    continue;
                }
                
                // Check if value matches the criteria
                const acceptedValues = styleProps[styleProp];
                if (acceptedValues.includes('*')) {
                    // Any value is acceptable (just checking existence)
                    CacheUtil.setCache(elem, cacheKey, walkNode);
                    return walkNode;
                } else if (acceptedValues.includes(value)) {
                    // Value matches one of the accepted values
                    CacheUtil.setCache(elem, cacheKey, walkNode);
                    return walkNode;
                }
            }
            
            walkNode = DOMWalker.parentElement(walkNode);
        }
        
        // No matching element or ancestor found - cache this result to avoid re-searching
        CacheUtil.setCache(elem, cacheKey, "NOT_FOUND");
        return null;
    }

    /**
     * return an array [value, Unit] from a value-unit combo string
     * @param valueUnitCombo, such as 20px, 2rem 
     * @returns 
     */
    public static getValueUnitPair(valueUnitCombo) {
        if (!valueUnitCombo) return null;

        if (Number.isInteger(valueUnitCombo)) return ["px", valueUnitCombo];

        const value = parseInt(valueUnitCombo);
        if (isNaN(value)) return null;

        valueUnitCombo = valueUnitCombo.trim().toLowerCase();
        let match = valueUnitCombo.trim().match(/([a-z]+)$/);
        let unit = 'px';
        if (match) unit = match[1];
        
        return [unit, value];
    }

}
