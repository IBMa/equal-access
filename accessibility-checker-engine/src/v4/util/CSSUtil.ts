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

type PseudoClass = ":hover" | ":active" | ":focus" | ":focus-visible" | ":focus-within";

export function selectorMatchesElem(element, selector) {
    if (typeof element.matches === 'function') {
        return element.matches(selector);
    }

    if (typeof element.matchesSelector === 'function') {
        return element.matchesSelector(selector);
    }

    // Native functions not there, fallback
    let matches = (element.document || element.ownerDocument).querySelectorAll(selector);
    let i = 0;

    while (i < matches.length && matches[i] !== element) {
        ++i;
    }

    return i < matches.length;
}

/**
 * Returns the style computed for this element
 * @param elem 
 */
export function getComputedStyle(elem: HTMLElement, pseudoElt?: PseudoClass) {
    const doc = elem.ownerDocument;
    const win = doc.defaultView;
    return win.getComputedStyle(elem, pseudoElt);
}

/**
 * Returns the style defined for this element
 * 
 * Note: This differs from the computed style in that the computed style will return
 * styles defined by the user agent. This will only return styles defined by the
 * application
 * @param elem 
 */
 export function getDefinedStyles(elem: HTMLElement, pseudoClass?: PseudoClass) {
    let definedStyles = {}
    // Iterate through all of the stylesheets and rules
    for (let ssIndex = 0; ssIndex < elem.ownerDocument.styleSheets.length; ++ssIndex) {
        const sheet = elem.ownerDocument.styleSheets[ssIndex] as CSSStyleSheet;
        try {
            if (sheet && sheet.cssRules) {
                for (let rIndex = 0; rIndex < sheet.cssRules.length; ++rIndex) {
                    const rule = sheet.cssRules[rIndex] as CSSStyleRule;
                    if (rule.selectorText) {
                        // Determine if the rule matches this element
                        let matches = selectorMatchesElem(elem, rule.selectorText);
                        if (!matches && pseudoClass && rule.selectorText.includes(pseudoClass)) {
                            // Need some special handling for pseudo selector found in rule
                            let selector = rule.selectorText.replace(new RegExp(pseudoClass, "g"), "");
                            if (selector.trim().length === 0) {
                                matches = true;
                            } else {
                                matches = selectorMatchesElem(elem, selector);
                            }
                        }
                        // If we match, capture the styles
                        if (matches) {
                            for (let sIndex=0; sIndex < rule.style.length; ++sIndex) {
                                definedStyles[rule.style[sIndex]] = rule.style[rule.style[sIndex]];
                            }
                        }
                    }
                }
            }
        } catch (err) {
            if (!err.toString().includes("Cannot access rules")) {
                throw err;
            }
        }
    }

    // Handled the stylesheets, now handle the element defined styles
    for (let key in elem.style) {
        if (typeof key === "string" && elem.style[key] && elem.style[key].length > 0) {
            definedStyles[key] = elem.style[key];
        }
    }

    // console.log("QQQ", definedStyles);
    return definedStyles;
}