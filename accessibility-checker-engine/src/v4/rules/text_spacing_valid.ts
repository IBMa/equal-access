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

import { eRulePolicy, eToolkitLevel, Rule, RuleResult, RuleContext, RulePass, RuleFail, RuleContextHierarchy } from "../api/IRule";
import { CommonUtil } from "../util/CommonUtil";
import { VisUtil } from "../util/VisUtil";
import { CSSUtil } from "../util/CSSUtil";
import { DOMMapper } from "../../v2/dom/DOMMapper";

// Module-level constants
const STYLE_VALUE_REGEX = /(-?[\d.]+)([a-z%]*)/;
const MIN_WORD_SPACING_RATIO = 0.16;
const MIN_LETTER_SPACING_RATIO = 0.12;
const MIN_LINE_HEIGHT_RATIO = 1.5;
const IMPORTANT_SUFFIX = "!important";
const IMPORTANT_SUFFIX_LENGTH = IMPORTANT_SUFFIX.length + 1; // +1 for the space before !important

/**
 * Resolves inherited or unset style values by traversing up the DOM tree
 * @param element - The element to resolve the style for
 * @param property - The CSS property name
 * @param currentValue - The current style value
 * @returns The resolved style value
 */
function resolveInheritedStyle(element: HTMLElement, property: string, currentValue: string): string {
    if (currentValue.startsWith('inherit') || currentValue.startsWith('unset')) {
        const ancestor = CSSUtil.getAncestorWithStyles(
            element.parentElement,
            {[property]: ["*"]},
            ['inherit', 'unset']
        );
        if (ancestor !== null) {
            return CSSUtil.getDefinedStyles(ancestor)[property];
        } else if (currentValue.startsWith('unset')) {
            return "initial";
        }
    }
    return currentValue;
}

/**
 * Removes the !important suffix from a style value
 * @param styleValue - The style value potentially containing !important
 * @returns The style value without !important
 */
function removeImportantSuffix(styleValue: string): string {
    return styleValue.substring(0, styleValue.length - IMPORTANT_SUFFIX_LENGTH);
}

/**
 * Checks if a spacing property violates accessibility requirements
 * @param element - The HTML element being checked
 * @param property - The CSS property name (word-spacing, letter-spacing, line-height)
 * @param styleValue - The current style value
 * @param fontSize - The computed font size in pixels
 * @param minRatio - The minimum ratio threshold
 * @param allowUnitless - Whether unitless values are allowed (for line-height)
 * @returns RuleResult indicating pass or fail
 */
function checkSpacingProperty(
    element: HTMLElement,
    property: string,
    styleValue: string,
    fontSize: number,
    minRatio: number,
    allowUnitless: boolean = false
): boolean {
    // Check if !important is used
    if (element.style.getPropertyPriority(property) !== 'important') {
        return true;
    }

    // Remove !important suffix
    const cleanValue = removeImportantSuffix(styleValue);

    // Check for initial or normal values (computed space is 0)
    if (cleanValue === 'initial' || cleanValue === 'normal') {
        return false;
    }

    // Parse the numeric value
    const numericValue = parseFloat(cleanValue);
    if (isNaN(numericValue)) {
        return true;
    }

    // Match value and unit
    const parsedValue = cleanValue.trim().match(STYLE_VALUE_REGEX);
    if (!parsedValue) {
        return true;
    }

    const [, value, unit] = parsedValue;

    // Handle unitless values (only for line-height)
    if (unit === '') {
        if (allowUnitless) {
            return parseFloat(value) < minRatio ? false : true;
        }
        // For other properties, zero value without unit is ignored
        if (parseFloat(value) === 0) {
            return null;
        }
    }

    // Skip if no unit and non-zero (error case, inapplicable)
    if (unit === '' && parseFloat(value) !== 0) {
        return null;
    }

    // Convert to pixels and check ratio
    const pixels = CSSUtil.convertValue2Pixels(unit, value, element);
    if (pixels !== null && pixels / fontSize < minRatio) {
        return false;
    }

    return true;
}

export const text_spacing_valid: Rule = {
    id: "text_spacing_valid",
    context: "dom:*",
    help: {
        "en-US": {
            "pass": "text_spacing_valid.html",
            "group": "text_spacing_valid.html",
            "fail_letter_spacing_style": "text_spacing_valid.html",
            "fail_word_spacing_style": "text_spacing_valid.html",
            "fail_line_height_style": "text_spacing_valid.html"
        }
    },
    messages: {
        "en-US": {
            "pass": "CSS !important is not used in inline style to control letter or word spacing or line height",
            "group": "CSS !important should not be used in inline style to control letter or word spacing or line height",
            "fail_letter_spacing_style": "CSS !important should not be used in inline ‘letter-spacing’ style",
            "fail_word_spacing_style": "CSS !important should not be used in inline ‘word-spacing’ style",
            "fail_line_height_style": "CSS !important should not be used in inline ‘line-height’ style"
        }
    },
    rulesets: [{
         "id": ["IBM_Accessibility", "IBM_Accessibility_next", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
         "num": ["1.4.12"],
         "level": eRulePolicy.VIOLATION,
         "toolkitLevel": eToolkitLevel.LEVEL_THREE
    }],
    act:['9e45ec', '24afc2', '78fd32'],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;

        // Ensure that this element has children with actual text
        let childStr = "";
        const childNodes = ruleContext.childNodes;
        for (let i = 0; i < childNodes.length; ++i) {
            if (childNodes[i].nodeType === 3) { // Text node
                childStr += childNodes[i].nodeValue;
            }
        }
        if (childStr.trim().length === 0) {
            return null;
        }

        // Skip the check if the element is hidden or disabled
        if (VisUtil.isNodeHiddenFromAT(ruleContext) || CommonUtil.isNodeDisabled(ruleContext)) {
            return null;
        }

        // Skip the check if the element is off screen
        const mapper: DOMMapper = new DOMMapper();
        const bounds = mapper.getUnadjustedBounds(ruleContext);
        if (!bounds || bounds['top'] < 0 || bounds['left'] < 0) {
            return null;
        }

        // Skip non-HTML elements (e.g., SVG)
        if (CommonUtil.getAncestor(ruleContext, "svg")) {
            return null;
        }

        // Font size always resolved to 'px'
        const computedStyle = getComputedStyle(ruleContext);
        const fontSize = parseFloat(computedStyle.getPropertyValue('font-size'));

        // Early exit optimization: Check if computed styles already pass
        // If all three properties have passing values, we can skip the expensive getDefinedStyles call
        const computedWordSpacing = computedStyle.getPropertyValue('word-spacing');
        const computedLetterSpacing = computedStyle.getPropertyValue('letter-spacing');
        const computedLineHeight = computedStyle.getPropertyValue('line-height');

        // Check if computed values pass the requirements
        let wordSpacingPasses = true;
        let letterSpacingPasses = true;
        let lineHeightPasses = true;

        // Check word-spacing (ignore 0px which represents default/normal)
        if (computedWordSpacing) {
            const wordValue = parseFloat(computedWordSpacing);
            if (!isNaN(wordValue)) {
                const wordPixels = CSSUtil.convertValue2Pixels('px', wordValue.toString(), ruleContext);
                if (wordPixels !== null && wordPixels / fontSize < MIN_WORD_SPACING_RATIO) {
                    wordSpacingPasses = false;
                }
            }
        }

        // Check letter-spacing (ignore 0px which represents default/normal)
        if (computedLetterSpacing) {
            const letterValue = parseFloat(computedLetterSpacing);
            if (!isNaN(letterValue)) {
                const letterPixels = CSSUtil.convertValue2Pixels('px', letterValue.toString(), ruleContext);
                if (letterPixels !== null && letterPixels / fontSize < MIN_LETTER_SPACING_RATIO) {
                    letterSpacingPasses = false;
                }
            }
        }

        // Check line-height
        if (computedLineHeight) {
            const lineValue = parseFloat(computedLineHeight);
            if (!isNaN(lineValue)) {
                // Line height can be unitless or in pixels
                const match = computedLineHeight.match(STYLE_VALUE_REGEX);
                if (match) {
                    const [, value, unit] = match;
                    if (unit === '' || unit === 'px') {
                        const ratio = unit === '' ? parseFloat(value) : parseFloat(value) / fontSize;
                        if (ratio < MIN_LINE_HEIGHT_RATIO) {
                            lineHeightPasses = false;
                        }
                    }
                }
            }
        }

        // If all computed values pass, we can skip the expensive getDefinedStyles check
        if (wordSpacingPasses && letterSpacingPasses && lineHeightPasses) {
            return null;
        }

        // Get defined styles to check for !important declarations
        const styles = CSSUtil.getDefinedStyles(ruleContext);
        if (Object.keys(styles).length === 0) {
            return null;
        }

        const results: RuleResult[] = [];

        // Check word-spacing
        let wordStyle = styles['word-spacing'];
        if (wordStyle) {
            wordStyle = resolveInheritedStyle(ruleContext, 'word-spacing', wordStyle);
            const result = checkSpacingProperty(
                ruleContext,
                'word-spacing',
                wordStyle,
                fontSize,
                MIN_WORD_SPACING_RATIO
            );
            results.push(result ? RulePass("pass") : RuleFail('fail_word_spacing_style'));
        }

        // Check letter-spacing
        let letterStyle = styles['letter-spacing'];
        if (letterStyle) {
            letterStyle = resolveInheritedStyle(ruleContext, 'letter-spacing', letterStyle);
            const result = checkSpacingProperty(
                ruleContext,
                'letter-spacing',
                letterStyle,
                fontSize,
                MIN_LETTER_SPACING_RATIO
            );
            results.push(result ? RulePass("pass") : RuleFail('fail_letter_spacing_style'));
        }

        // Check line-height (only if no scrollable ancestor)
        let lineStyle = styles['line-height'];
        const overflowStyles = {
            "overflow": ['auto', 'scroll'],
            "overflow-x": ['auto', 'scroll'],
            "overflow-y": ['auto', 'scroll']
        };
        if (lineStyle && CSSUtil.getAncestorWithStyles(ruleContext, overflowStyles) === null) {
            lineStyle = resolveInheritedStyle(ruleContext, 'line-height', lineStyle);
            const result = checkSpacingProperty(
                ruleContext,
                'line-height',
                lineStyle,
                fontSize,
                MIN_LINE_HEIGHT_RATIO,
                true // Allow unitless values for line-height
            );
            results.push(result ? RulePass("pass") : RuleFail('fail_line_height_style'));
        }

        return results.length > 0 ? results : null;
    }
}
