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
    try {
        if (selector.trim() === "") return false;
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
    } catch (err) {
        // Bad selector? Doesn't match then...
        return false;
    }
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
 * This differs from the computed style in that the computed style will return
 * styles defined by the user agent. This will only return styles defined by the
 * application
 * 
 * @param {HTMLElement} elem 
 * @param {string} [pseudoClass] If specified, will return values that are different
 * than when the pseudoClass does not match.
 */
export function getDefinedStyles(elem: HTMLElement, pseudoClass?: PseudoClass) {
    // console.log("Function: getDefinedStyles");
    let definedStyles = {}
    let definedStylePseudo = {}

    function fillStyle(maps, style) {
        for (let sIndex=0; sIndex < style.length; ++sIndex) {
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
                         if (priority === 'important' && !map[key].startsWith("inherit") && !map[key].startsWith("unset"))
                            //override !important only if it is also !important
                            map[key] = style[key] + " !important";
                         else 
                            //don't override !important if it is not !important
                            continue;   
                    } else
                        //create/overide anyway
                        map[key] = style[key] + (priority === 'important' ? " !important" : "");
                }
            }
        }
    }

    // Iterate through all of the stylesheets and rules
    for (let ssIndex = 0; ssIndex < elem.ownerDocument.styleSheets.length; ++ssIndex) {
        const sheet = elem.ownerDocument.styleSheets[ssIndex] as CSSStyleSheet;
        try {
            if (sheet && sheet.cssRules) {
                // console.log("Got sheet");
                for (let rIndex = 0; rIndex < sheet.cssRules.length; ++rIndex) {
                    // console.log("Got rule: ", sheet.cssRules[rIndex]);
                    const rule = sheet.cssRules[rIndex] as CSSStyleRule;
                    const fullRuleSelector = rule.selectorText;
                    if (fullRuleSelector) {
                        const pseudoMatch = fullRuleSelector.match(/^(.*)(:[a-zA-Z-]*)$/);
                        const hasPseudoClass = !!pseudoMatch;
                        let selMain = hasPseudoClass ? pseudoMatch[1] : fullRuleSelector;
                        const selPseudo = hasPseudoClass ? pseudoMatch[2] : "";
                        const samePseudoClass = selPseudo === pseudoClass;
                        if (pseudoClass && pseudoClass === ":focus") {
                            // If this element has focus, remove focus-within from parents
                            selMain = selMain.replace(/([ >][^+~ >]+):focus-within/g, "$1");
                        }

                        // Get styles of non-pseudo selectors
                        if (!hasPseudoClass && selectorMatchesElem(elem, selMain)) {
                            fillStyle([definedStyles, definedStylePseudo], rule.style);
                        }

                        if (samePseudoClass && selectorMatchesElem(elem, selMain)) {
                            fillStyle([definedStylePseudo], rule.style);
                        }
                    }
                }
            }
        } catch (err) {
            if (!err.toString().includes("Cannot access rules") && !err.toString().includes("SecurityError:")) {
                throw err;
            }
        }
    }

    // Handled the stylesheets, now handle the element defined styles
    fillStyle([definedStyles, definedStylePseudo], elem.style);

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
 * Convert absolute CSS numerical values to pixels.
 *
 * @param unitValue in string
 * @param target element.
 * @return value in pixels
 */
 export function convertValue2Pixels(unit, unitValue, elem ) {
    if (unitValue == 0) return 0;
    const supportedUnits = {
        // absolute unit
        'px': value => value,
        'cm': value => value * 37.8,
        'mm': value => value * 3.78,
        'q': value => value * 0.95,
        'in': value => value * 96,
        'pc': value => value * 16,
        'pt': value => value * 1.33,
        
        // relative unit
        'rem': value => value * parseFloat( getComputedStyle(elem.ownerDocument.documentElement).getPropertyValue('font-size') ),
        'em': value => value * parseFloat( getComputedStyle(elem).getPropertyValue('font-size')),
        'vw': value => value / 100 * elem.ownerDocument.defaultView.innerWidth,
        'vh': value => value / 100 * elem.ownerDocument.defaultView.innerHeight,
        '%':  value => value / 100 * parseFloat( getComputedStyle(elem).getPropertyValue('font-size'))
    };

    if ( unit in supportedUnits )
        return supportedUnits[ unit ]( unitValue );
    
    return null;
}


