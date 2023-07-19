/******************************************************************************
     Copyright:: 2023- IBM, Inc

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

import { IArchive } from "./IArchive.js"

export enum eAssertResult {
    ERROR = -1,
    PASS = 0,
    BASELINE_MISMATCH = 1,
    FAIL = 2
}


export enum eRuleLevel {
    violation = "violation",
    potentialviolation = "potentialviolation",
    recommendation = "recommendation",
    potentialrecommendation = "potentialrecommendation",
    manual = "manual",
    pass = "pass",
    ignored = "ignored"
}

export interface IConfig {
    /**
     * (optional) Specify the rule archive
     *
     * Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
     * Default: "latest"
     */
    ruleArchive?: "latest" | "preview" | "versioned" | string

    /**
     * (optional) Specify one or many policies to scan.
     *
     * Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
     * Default: ["IBM_Accessibility"]
     */
    policies?: Array<"IBM_Accessibility" | string>

    /**
     * (optional) Specify one or many violation levels on which to fail the test
     *
     * i.e. If specified violation then the testcase will only fail if
     * a violation is found during the scan.
     * Default: ["violation", "review"]
     */
    failLevels?: eRuleLevel[]

    /**
     * (optional) Specify one or many violation levels which should be reported
     *
     * i.e. If specified violation then in the report it would only contain
     * results which are level of violation.
     * Default: ["violation", "review"]
     */
    reportLevels?: eRuleLevel[]

    /**
     * (optional) In which fornats should the results be output
     * Default: ["json"]
     */
    outputFormat?: Array<"json" | "html" | "csv" | "disable" | "xlsx">

    /**
     * (optional) Specify any labels that you would like associated to your scan
     * Default: []
     */
    label?: string[]

    /**
     * (optional) Where the scan results should be saved.
     * Default: "results"
     */
    outputFolder?: string

    /**
     * (optional) Should the timestamp be included in the filename of the reports?
     * Default: true
     */
    outputFilenameTimestamp?: boolean

    /**
     * (optional) Where the baseline results should be loaded from
     * Default: "baselines"
     */
    baselineFolder?: string

    /**
     * (optional) Where the tool can read/write cached files (ace-node.js / archive.json)
     * Default: `${os.tmpdir()}/accessibility-checker/`
     */
    cacheFolder?: string,

    /**
     * (optional) For tools that scan files, which extensions should we include
     * Default: ["html", "htm", "svg"]
     */
    extensions?: string[]
}

export type IConfigInternal = IConfig & {
    /**
     * Run in debug mode
     */
    DEBUG?: boolean

    /**
     * Spot to store parsed archive file
     */
    ruleArchiveSet?: IArchive[]

    /**
     * Label to expose to reports
     */
    ruleArchiveLabel?: string

    /**
     * (optional) Rule server to pull the rules from and to use for help
     * Default: "https://able.ibm.com/rules"
     */
    ruleServer?: string

    /**
     * Path to the rule pack
     */
    rulePack?: string

    /**
     * Path within the archive
     */
    ruleArchivePath?: string

    /**
     * Version number of the selected archive
     */
    ruleArchiveVersion?: string

    /**
     * (optional) If the tool allows, should we capture screenshots
     */
    captureScreenshots?: boolean

    /**
     * (optional) If the tool allows, should we run headless
     */
    headless?: "new" | boolean

    /**
     * (optional) If the tool allows, set the maximum number of tabs to open
     */
    maxTabs?: number

    /**
     * Configuration filenames to try loading
     */
    configFiles?: string[]

    toolID?: string
    toolName?: string
    toolVersion?: string

    scanID?: string

    ignoreHTTPSErrors: boolean

    perfMetrics: boolean

    engineMode: "DEFAULT" | "REMOTE" | "INJECT"
}
