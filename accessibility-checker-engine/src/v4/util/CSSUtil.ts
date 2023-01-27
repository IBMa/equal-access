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
 * if rotation transform is used, the computed style returns the resolved matrix
 *  while the defined style return the transform function(s) 
 * for example, for 'transform: rotate(2.5deg);', the computed style returns 'matrix(-0.0436194, 0.999048, -0.999048, -0.0436194, 0, 0)' 
 *  and the defined style returns 'rotate(2.5deg)'  
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
 * Returns the media query defined for this element
 * 
 * 
 * @param {HTMLElement} elem 
 */
export function getMediaOrientationTransform(elem: HTMLElement) {
    let orientationTransforms = {}
    
    // Iterate through all of the stylesheets and rules
    for (let ssIndex = 0; ssIndex < elem.ownerDocument.styleSheets.length; ++ssIndex) {
        const sheet = elem.ownerDocument.styleSheets[ssIndex] as CSSStyleSheet;
        try {
            if (sheet && sheet.cssRules) {
                for (let rIndex = 0; rIndex < sheet.cssRules.length; ++rIndex) {
                    const sheetRule = sheet.cssRules[rIndex];
                    if (CSSRule.MEDIA_RULE === sheetRule.MEDIA_RULE) { 
                        const rule = sheetRule as CSSMediaRule;
                        if (rule && rule.media) {
                            const mediaList = rule.media;
                            for (let i = 0; i < mediaList.length; i++) {
                                let elem_transforms = orientationTransforms[mediaList.item(i).toLocaleLowerCase()];
                                if (!elem_transforms) elem_transforms = {};
                                let styleRules = rule.cssRules;
                                for (let i = 0; i < styleRules.length; ++i) {
                                    if (CSSRule.STYLE_RULE === styleRules[i].STYLE_RULE) { 
                                        const styleRule = styleRules[i] as CSSStyleRule;
                                        const selector = styleRule.selectorText;
                                        if (selector) {
                                            let transforms = {};
                                            const styles = styleRule.style;
                                            for (let s=0; s < styles.length; ++s) {
                                                const key = styles[s];
                                                if (key.toLocaleLowerCase() === "transform") {
                                                    if (key === "all" && styles[key]) {
                                                        delete transforms[key];
                                                        break;
                                                    } else {
                                                        transforms[key] = styles[key];
                                                    }
                                                }
                                            }
                                            elem_transforms[selector] = transforms;
                                        }
                                    }      
                                }
                                orientationTransforms[mediaList.item(i).toLocaleLowerCase()] = elem_transforms; 
                            }
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
    return orientationTransforms;
}

/**
 * convert given rotation transform functions to degree transformed. 
 * If multiple functions are given, then the functions are applied linearly in the order. 
 *   rotation_transform function example:  rotate(45deg), rotate(2turn), rotate(2rad), rotate3d(1, 1, 1, 45deg),
 *        rotate(2rad) rotate3d(1, 1, 1, 45deg)
 * @param rotation_transform 
 */
export function getRotationDegree(rotation_transform) {
    let degree = 0;
    try {
        if (!rotation_transform) return degree;
        // normalize the rotation_transform
        rotation_transform = rotation_transform.replaceAll(", ", ",");
        const transform_functions = rotation_transform.split(" ");
        for (let i =0; i < transform_functions.length; i++) {
            const transform_function = transform_functions[i].trim();
            if (transform_function === '') continue;
            if (transform_function.startsWith("rotate3d")) {
                // example: rotate3d(1, 1, 1, 45deg);
                const left = transform_function.indexOf("(");
                const right = transform_function.indexOf(")");
                if (left !== -1 && right !== -1) {
                    let matrix = transform_function.substring(left+1, right);
                    let values;
                    if (matrix) values = matrix.split(",");
                    if (values && values.length === 4) {
                        let rotation = values[3];
                        if (!rotation) continue;
                        rotation = rotation.trim();
                        if (rotation.endsWith("turn")) {
                            let num = rotation.substring(0, rotation.length - 4);
                            num = parseFloat(num);
                            if (!isNaN(num)) degree = num * 360; 
                        } else if (rotation.endsWith("rad")) {
                            let num = rotation.substring(0, rotation.length - 3);
                            num = parseFloat(num);
                            if (!isNaN(num)) degree = num * 180/Math.PI; 
                        } else if (rotation.endsWith("deg")) {
                            let num = rotation.substring(0, rotation.length - 3);
                            num = parseFloat(num);
                            if (!isNaN(num)) degree += num; 
                        }
                    }    
                }
            } else if (transform_function.startsWith("rotate") || transform_function.startsWith("rotateZ")) {
                // example: rotate(45deg);
                const left = transform_function.indexOf("(");
                const right = transform_function.indexOf(")");
                if (left !== -1 && right !== -1) {
                    let rotation = transform_function.substring(left+1, right);
                    if (!rotation) continue;
                    rotation = rotation.trim();
                    if (rotation.endsWith("turn")) {
                        let num = rotation.substring(0, rotation.length - 4);
                        num = parseFloat(num);
                        if (!isNaN(num)) degree = num * 360; 
                    } else if (rotation.endsWith("rad")) {
                        let num = rotation.substring(0, rotation.length - 3);
                        num = parseFloat(num);
                        if (!isNaN(num)) degree = num * 180/Math.PI; 
                    } else if (rotation.endsWith("deg")) {
                        let num = rotation.substring(0, rotation.length - 3);
                        num = parseFloat(num);
                        if (!isNaN(num)) degree += num; 
                    }
                }
            } else if (transform_function.startsWith("matrix3d")) {
                // calculate the three Euler angles
                const left = transform_function.indexOf("(");
                const right = transform_function.indexOf(")");
                if (left !== -1 && right !== -1) {
                    let matrix = transform_function.substring(left+1, right);
                    let values = null;
                    if (matrix) values = matrix.split(",");
                    if (values !== null) {
                        const z_angle = Math.atan2(values[4], values[5]);
                        degree += Math.round(Math.round(z_angle * 180/Math.PI));
                    }     
                }
            } else if (transform_function.startsWith("matrix")) {
                // calculate the three Euler angles
                const left = transform_function.indexOf("(");
                const right = transform_function.indexOf(")");
                if (left !== -1 && right !== -1) {
                    let matrix = transform_function.substring(left+1, right);
                    let values = null;
                    if (matrix) values = matrix.split(",");
                    if (values !== null) {
                        const z_angle = Math.atan2(values[1], values[0]);
                        degree += Math.round(Math.round(z_angle * 180/Math.PI));
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

 export function getDeviceOrientation() {
    if (window.matchMedia("(orientation: portrait)").matches) {
        /* The viewport is currently in portrait orientation */
        return 'portrait';
      } else {
        /* The viewport is not currently in portrait orientation, therefore landscape */
        return 'landscape';
      }
 }