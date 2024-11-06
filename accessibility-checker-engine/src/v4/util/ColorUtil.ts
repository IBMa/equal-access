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

import { DOMWalker } from "../../v2/dom/DOMWalker";

export class ColorUtil {

    public static CSSColorLookup = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "black": "#000000",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32",
        "buttontext": "rgba(0, 0, 0, 0.847)",
        "buttonface": "#ffffff",
        "graytext": "rgba(0, 0, 0, 0.247)"
    }


    // Rewrite the color object to account for alpha
    public static Color(cssStyleColor) {
        if (!cssStyleColor) return null;
        cssStyleColor = cssStyleColor.toLowerCase();
        if (cssStyleColor === "transparent") return new ColorObj(255, 255, 255, 0);
        if (cssStyleColor in ColorUtil.CSSColorLookup)
            cssStyleColor = ColorUtil.CSSColorLookup[cssStyleColor];
        if (cssStyleColor.startsWith("rgb(")) {
            let rgbRegex = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
            let m = cssStyleColor.match(rgbRegex);
            if (m === null) return null;
            else {
                return new ColorObj(m[1], m[2], m[3]);
            }
        } else if (cssStyleColor.startsWith("rgba(")) {
            let rgbRegex = /\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(.+)\s*\)/;
            let m = cssStyleColor.match(rgbRegex);
            if (m === null) return null;
            else {
                return new ColorObj(m[1], m[2], m[3], m[4]);
            }
        } else if (cssStyleColor.charAt(0) != "#") {
            return null;
        } else {
            if (cssStyleColor.length === 4) {
                // The three-digit RGB (#rgb) is converted to six-digit form (#rrggbb) by replicating digits
                // (https://www.w3.org/TR/css-color-3/#rgb-color)
                cssStyleColor = "#" + cssStyleColor.charAt(1).repeat(2) +
                    cssStyleColor.charAt(2).repeat(2) +
                    cssStyleColor.charAt(3).repeat(2);
            }
            let thisRed = parseInt(cssStyleColor.substring(1, 3), 16);
            let thisGreen = parseInt(cssStyleColor.substring(3, 5), 16);
            let thisBlue = parseInt(cssStyleColor.substring(5, 7), 16);
            return new ColorObj(thisRed, thisGreen, thisBlue);
        }
        //    return null; // Unreachable
    };

 public static ColorCombo(ruleContext : HTMLElement) {
    try { 
        var doc = ruleContext.ownerDocument;
        if (!doc) {
            return null;
        }
        var win = doc.defaultView;
        if (!win) {
            return null;
        }

        var ancestors = [];
        let walkNode : Element = ruleContext;
        while (walkNode) {
            if (walkNode.nodeType === 1) 
                ancestors.push(walkNode);
            walkNode = DOMWalker.parentElement(walkNode);
        }
        
        var retVal = {
            "hasGradient": false,
            "hasBGImage": false,
            "textShadow": false,
            "fg": null,
            "bg": null
        };
        
        // start
        var cStyle = win.getComputedStyle(ruleContext);
        var compStyleColor = cStyle.color;
        if (!compStyleColor)
            compStyleColor = "black";
        var fg = ColorUtil.Color(compStyleColor);
        var reColor = /transparent|rgba?\([^)]+\)/gi;
        var guessGradColor = function (gradList, bgColor, fgColor) {
            try {
                // If there's only one color, return that
                if (typeof gradList.length === "undefined")
                    return gradList;

                var overallWorst = null;
                var overallWorstRatio = null;
                for (var iGrad = 1; iGrad < gradList.length; ++iGrad) {
                    var worstColor = gradList[iGrad - 1];
                    var worstRatio = fgColor.contrastRatio(gradList[iGrad - 1]);
                    var step = .1;
                    var idx = 0;
                    while (step > .0001) {
                        while (idx + step <= 1 && worstRatio > fgColor.contrastRatio(gradList[iGrad].mix(gradList[iGrad - 1], idx + step).getOverlayColor(bgColor))) {
                            worstColor = gradList[iGrad].mix(gradList[iGrad - 1], idx + step).getOverlayColor(bgColor);
                            worstRatio = fgColor.contrastRatio(worstColor);
                            idx = idx + step;
                        }
                        while (idx - step >= 0 && worstRatio > fgColor.contrastRatio(gradList[iGrad].mix(gradList[iGrad - 1], idx - step).getOverlayColor(bgColor))) {
                            worstColor = gradList[iGrad].mix(gradList[iGrad - 1], idx - step).getOverlayColor(bgColor);
                            worstRatio = fgColor.contrastRatio(worstColor);
                            idx = idx - step;
                        }
                        step = step / 10;
                    }
                    if (overallWorstRatio === null || overallWorstRatio > worstRatio) {
                        overallWorstRatio = worstRatio;
                        overallWorst = worstColor;
                    }
                }
                return overallWorst; // return the darkest color
            } catch (e) {
                console.log(e);
            }
            return bgColor;
        };

        var priorStackBG = ColorUtil.Color("white");
        var thisStackOpacity = null;
        var thisStackAlpha = null;
        var thisStackBG = null;
        // Ancestors processed from the topmost parent toward the child
        while (ancestors.length > 0) {
            var procNext = ancestors.pop();
            //var procNext = ancestors.splice(0, 1)[0];
            // cStyle is the computed style of this layer
            var cStyle = win.getComputedStyle(procNext);
            if (cStyle === null) continue;
            
            // thisBgColor is the color of this layer or null if the layer is transparent
            var thisBgColor = null;
            if (cStyle.backgroundColor && cStyle.backgroundColor != "transparent" && cStyle.backgroundColor != "rgba(0, 0, 0, 0)") {
                thisBgColor = ColorUtil.Color(cStyle.backgroundColor);
            }
            // If there is a gradient involved, set thisBgColor to the worst color combination available against the foreground
            if (cStyle.backgroundImage && cStyle.backgroundImage.indexOf && cStyle.backgroundImage.indexOf("gradient") != -1) {
                var gradColors : string[] = cStyle.backgroundImage.match(reColor);
                if (gradColors) {
                    let gradColorComp : ColorObj[] = [];
                    for (var i = 0; i < gradColors.length; ++i) {
                        if (!gradColors[i].length) {
                            gradColors.splice(i--, 1);
                        } else {
                            let colorComp = ColorUtil.Color(gradColors[i]);
                            if (colorComp.alpha !== undefined && colorComp.alpha < 1) {
                                // mix the grdient bg color wit parent bg if alpha < 1
                                let compStackBg = thisStackBG || priorStackBG;
                                colorComp = colorComp.getOverlayColor(compStackBg);
                            }
                            gradColorComp.push(colorComp);
                        }
                    }
                    thisBgColor = guessGradColor(gradColorComp, thisStackBG || priorStackBG, fg);
                }
            }
            
            // Handle non-solid opacity
            if (thisStackOpacity === null || (cStyle.opacity && cStyle.opacity.length > 0 && parseFloat(cStyle.opacity) < 1)) {
                // New stack, reset
                if (thisStackBG != null) {
                    // Overlay
                    thisStackBG.alpha = thisStackOpacity * thisStackAlpha;
                    priorStackBG = thisStackBG.getOverlayColor(priorStackBG);
                }
                thisStackOpacity = 1.0;
                thisStackAlpha = null;
                thisStackBG = null;
                if (cStyle.opacity && cStyle.opacity.length > 0) {
                    thisStackOpacity = parseFloat(cStyle.opacity);
                }
                if (thisBgColor != null) {
                    thisStackBG = thisBgColor;
                    thisStackAlpha = thisStackBG.alpha || 1.0;
                    delete thisStackBG.alpha;
                    if (thisStackOpacity === 1.0 && thisStackAlpha === 1.0) {
                        retVal.hasBGImage = false;
                        retVal.hasGradient = false;
                    }
                }
            }
            // Handle solid color backgrounds and gradient color backgrounds
            else if (thisBgColor != null) {
                // If this stack already has a background color, blend it
                if (thisStackBG === null) {
                    thisStackBG = thisBgColor;
                    thisStackAlpha = thisStackBG.alpha || 1.0;
                    delete thisStackBG.alpha;
                } else {
                    thisStackBG = thisBgColor.getOverlayColor(thisStackBG);
                    //thisStackAlpha = thisBgColor.alpha || 1.0;
                    thisStackAlpha = thisStackBG.alpha || 1.0;
                }
                // #526: If thisBgColor had an alpha value, it may not expose through thisStackBG in the above code
                // We can't wipe out the gradient info if this layer was transparent
                if (thisStackOpacity === 1.0 && thisStackAlpha === 1.0 && (thisStackBG.alpha || 1.0) === 1.0 && (thisBgColor.alpha || 1.0) === 0) {
                    retVal.hasBGImage = false;
                    retVal.hasGradient = false;
                }
            }
            if (cStyle.backgroundImage && cStyle.backgroundImage != "none") {
                if (cStyle.backgroundImage.indexOf && cStyle.backgroundImage.indexOf("gradient") != -1) {
                    retVal.hasGradient = true;
                } else {
                    retVal.hasBGImage = true;
                }
            }
        }
        if (thisStackBG != null) {
            fg = fg.getOverlayColor(thisStackBG);
            delete fg.alpha;
        }
        fg.alpha = (fg.alpha || 1) * thisStackOpacity;
        fg = fg.getOverlayColor(priorStackBG);
        if (thisStackBG != null) {
            thisStackBG.alpha = thisStackOpacity * thisStackAlpha;
            priorStackBG = thisStackBG.getOverlayColor(priorStackBG);
        }
        retVal.fg = fg;
        retVal.bg = priorStackBG;

        if (cStyle.textShadow && cStyle.textShadow !== 'none')
            retVal.textShadow = true;

        return retVal;
    } catch (err) {
        // something happened, then...
        return null;
    }
 };
}

export class ColorObj {
    red : number;
    green : number;
    blue : number;
    alpha : number;

    constructor(red : string | number, green : string | number, blue : string | number, alpha? : string | number) {
        function fixComponent(comp : string | number) : number {
            if (typeof (comp) != typeof ("")) return comp as number;
            let compStr = comp as string;
            compStr = compStr.trim();
            if (compStr[compStr.length - 1] != "%") return parseInt(compStr);
            return Math.round(parseFloat(compStr.substring(0, compStr.length - 1)) * 2.55);
        }
        this.red = fixComponent(red);
        this.green = fixComponent(green);
        this.blue = fixComponent(blue);
        if (typeof (alpha) != "undefined") {
            this.alpha = (typeof (alpha) === typeof ("")) ? parseFloat(alpha as string) : alpha as number;
        }
    }

    toHexHelp(value : number) : string {
        let retVal = Math.round(value).toString(16);
        if (retVal.length === 1)
            return "0" + retVal;
        return retVal;
    };

    toHex() : string {
        return "#" + this.toHexHelp(this.red) + this.toHexHelp(this.green) + this.toHexHelp(this.blue);
    };

    contrastRatio(bgColor : ColorObj) { 
        let fgColor: ColorObj = this;
        
        if (typeof (this.alpha) != "undefined")
            fgColor = this.getOverlayColor(bgColor);
             
        let lum1 = fgColor.relativeLuminance();
        if (!bgColor.relativeLuminance) {
            let s = "";
            for (let key in bgColor) {
                s += key + "\n";
            }
            alert(bgColor);
            alert(s);
        }
        let lum2 = bgColor.relativeLuminance();
        let ratio = (lum1 > lum2) ? (lum1 + .05) / (lum2 + .05) : (lum2 + .05) / (lum1 + .05);
        return ratio;
    };

    relativeLuminance() : number {
        let R = this.red / 255.0;
        let G = this.green / 255.0;
        let B = this.blue / 255.0;
        R = R <= .04045 ? R / 12.92 : Math.pow((R + .055) / 1.055, 2.4);
        G = G <= .04045 ? G / 12.92 : Math.pow((G + .055) / 1.055, 2.4);
        B = B <= .04045 ? B / 12.92 : Math.pow((B + .055) / 1.055, 2.4);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    mix(color2 : ColorObj, percThis : number) {
        if (typeof (this.alpha) === "undefined" && typeof (color2.alpha) === "undefined") {
            return new ColorObj(
                percThis * this.red + (1 - percThis) * color2.red,
                percThis * this.green + (1 - percThis) * color2.green,
                percThis * this.blue + (1 - percThis) * color2.blue
            );
        } else {
            let alphaThis = this.alpha ? this.alpha : 1;
            let alphaOther = color2.alpha ? color2.alpha : 1;
            return new ColorObj(
                percThis * this.red + (1 - percThis) * color2.red,
                percThis * this.green + (1 - percThis) * color2.green,
                percThis * this.blue + (1 - percThis) * color2.blue,
                percThis * alphaThis + (1 - percThis) * alphaOther
            );
        }
    };

    getOverlayColor(bgColor : ColorObj) {
        if (typeof (this.alpha) === "undefined" || this.alpha >= 1) {
            // No mixing required - it's opaque
            return this;
        }
        if (this.alpha < 0) {
            //		Haac.Error.logError("Invalid alpha value");
            return null;
        }
        if (typeof (bgColor.alpha) != "undefined" && bgColor.alpha < 1) {
            //		Haac.Error.logError("Cannot mix with a background alpha");
            return null;
        }
        let retVal = this.mix(bgColor, this.alpha);
        delete retVal.alpha; 
        return retVal;
    }

    public static fromCSSColor(cssStyleColor) {
        let thisRed = -1;
        let thisGreen = -1;
        let thisBlue = -1;

        cssStyleColor = cssStyleColor.toLowerCase();
        if (cssStyleColor.startsWith("rgb(")) {
            let rgbRegex = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
            let m = cssStyleColor.match(rgbRegex);
            if (m === null) return null;
            else {
                thisRed = m[1];
                thisGreen = m[2];
                thisBlue = m[3];
            }
        } else if (cssStyleColor.startsWith("rgba(")) {
            let rgbRegex = /\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(.+)\s*\)/;
            let m = cssStyleColor.match(rgbRegex);
            if (m === null) return null;
            else {
                thisRed = m[1];
                thisGreen = m[2];
                thisBlue = m[3];
            }
        } else {
            if (cssStyleColor.charAt(0) != "#") {
                if (cssStyleColor in ColorUtil.CSSColorLookup)
                    cssStyleColor = ColorUtil.CSSColorLookup[cssStyleColor];
                else return null;
            }
            let fromHex = function (val) {
                let lookup = {
                    "a": 10,
                    "b": 11,
                    "c": 12,
                    "d": 13,
                    "e": 14,
                    "f": 15
                };
                let retVal = 0;
                for (let i = 0; i < val.length; ++i) {
                    retVal = retVal * 16 +
                        parseInt(val.charAt(i) in lookup ? lookup[val.charAt(i)] : val.charAt(i));
                }
                return retVal;
            }
            if (cssStyleColor.length === 4) {
                // The three-digit RGB (#rgb) is converted to six-digit form (#rrggbb) by replicating digits
                // (https://www.w3.org/TR/css-color-3/#rgb-color)
                cssStyleColor = "#" + cssStyleColor.charAt(1).repeat(2) +
                    cssStyleColor.charAt(2).repeat(2) +
                    cssStyleColor.charAt(3).repeat(2);
            }
            thisRed = fromHex(cssStyleColor.substring(1, 3));
            thisGreen = fromHex(cssStyleColor.substring(3, 5));
            thisBlue = fromHex(cssStyleColor.substring(5, 7));
        }
        return new ColorObj(thisRed, thisGreen, thisBlue);
    }
}
