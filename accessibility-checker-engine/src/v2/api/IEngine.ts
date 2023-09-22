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

import { 
    Issue, 
    RulePass as RulePassNew,
    RuleFail as RuleFailNew,
    RuleRender as RuleRenderNew,
    RulePotential as RulePotentialNew,
    RuleManual as RuleManualNew,
    RuleResult as RuleResultNew,
    RuleContextHierarchy as RuleContextHierarchyNew,
    RuleContext as RuleContextNew,
    Rule as RuleNew
} from "../../v4/api/IRule";

import { 
    NlsMap as NlsMapNew,
    HelpMap as HelpMapNew,
    IEngine as IEngineNew
} from "../../v4/api/IEngine";

import {
    Report as ReportNew
} from "../../v4/api/IReport";

/**
 * @deprecated See ../../v4/api/IRule
 */
export enum eRuleConfidence {
    PASS = "PASS",
    FAIL = "FAIL",
    POTENTIAL = "POTENTIAL",
    MANUAL = "MANUAL"
}

/**
 * @deprecated See ../../v4/api/IRule
 */
export enum eRulePolicy {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    INFORMATION = "INFORMATION"
}

/**
 * @deprecated See ../../v4/api/IGuideline
 */
export enum eToolkitLevel {
    LEVEL_ONE = "1",
    LEVEL_TWO = "2",
    LEVEL_THREE = "3",
    LEVEL_FOUR = "4"
}

/**
 * @deprecated See ../../v4/api/IGuideline::eGuidelineCategory
 */
export enum eRuleCategory {
    ACCESSIBILITY = "Accessibility",
    DESIGN = "Design",
    OTHER = "Other"
}

/**
 * @deprecated See ../../v4/api/IGuideline::eGuidelineType
 */
export enum eRulesetType {
    DEFAULT = "default",
    EXTENSION = "extension"
}

/**
 * @deprecated See ../../v4/api/IRule
 */
export let RulePass = RulePassNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export let RuleRender = RuleRenderNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export let RuleFail = RuleFailNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export let RulePotential = RulePotentialNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export let RuleManual = RuleManualNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export type RuleResult = RuleResultNew;

/**
 * @deprecated See ../../v4/api/IRule
 */
export type RuleDetails = Issue

/**
 * @deprecated See ../../v4/api/IRule
 */
export type RuleContextHierarchy = RuleContextHierarchyNew

/**
 * @deprecated See ../../v4/api/IRule
 */
export type RuleContext = RuleContextNew

/**
 * @deprecated See ../../v4/api/IRule
 */
export type Rule = RuleNew

/**
 * @deprecated See ../../v4/api/IEngine
 */
export type Report = ReportNew;

/**
 * @deprecated See ../../v4/api/IEngine
 */
export type NlsMap = NlsMapNew

/**
 * @deprecated See ../../v4/api/IEngine
 */
export type HelpMap = HelpMapNew

/**
 * @deprecated See ../../v4/api/IEngine
 */
export type IEngine = IEngineNew