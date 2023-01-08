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
                    map[key] = style[key];
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
 * Returns if the font for visible text of the element is defined by material icons
 *  
 * @param {HTMLElement} elem 
 */
 export function isMaterialIconFont(elem: HTMLElement) {
    // TODO: check the existence material icons using fetch in node 18+
    // for now (node 16) just dertermine if the stylesheet for the 'Material Icons' exists statically. note that the loading of the font stylesheet occurs at run time.
    //list of known material icons and stylesheet link
    const known_icons = {
        'Material Icons' : "https://fonts.googleapis.com/icon?family=Material+Icons"
    };
    const known_css_classes = {
        'material-icons' : "https://fonts.googleapis.com/icon?family=Material+Icons"
    };

    // material icon font can be defined either by font-family: 'Material Icons' or by class="material-icons"
    let styles = getDefinedStyles(elem);
    let fontFamily = styles['font-family'];
    
    let found = false;
    // font-family specifies a prioritized list of one or more font family names 
    if (fontFamily && fontFamily.split(",")[0].replace(/['"]+/g, '').trim() in known_icons)
        found = true;

    if (!found) {
       let list =  elem.classList;
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
        if (sheets && sheets.length > 0 && Object.values(known_icons).indexOf(sheets[s].href) > -1) {
            passed = true;
            break;
        } 
    }       
    return passed;
 }   