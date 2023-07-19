/**import { eRuleLevel } from "../common/config/IConfig";
import { IBaselineReport } from "../common/engine/IReport";
import { eRuleLevel, RuleDetails } from "./IEngine.js";
*/
import { eRuleLevel } from "../common/config/IConfig.js";
import { IBaselineReport } from "../common/engine/IReport.js";

export enum eAssertResult {
    ERROR = -1,
    PASS = 0,
    BASELINE_MISMATCH = 1,
    FAIL = 2
}
export interface IConfig {
    /**
     * (optional) Specify the rule archive
     *
     * Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
     * Default: "latest"
     */
    ruleArchive?: "latest" | "preview" | string

    ruleArchiveSet?:any

    ruleArchiveLabel?: string

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
     * Default: "json"
     */
    outputFormat?: "json" | "html" | "csv"

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

export type IConfigUnsupported = IConfig & {
    /**
     * Run in debug mode
     */
    DEBUG?: boolean

    /**
     * (optional) Rule server to pull the rules from and to use for help
     * Default: "https://able.ibm.com/rules"
     */
    ruleServer?: string

    rulePack?: string

    /**
     * (optional) If the tool allows, should we capture screenshots
     */
    captureScreenshots?: boolean

    /**
     * (optional) If the tool allows, should we run headless
     */
    headless?: boolean | "new"

    /**
     * (optional) If the tool allows, set the maximum number of tabs to open
     */
    maxTabs?: number

    configFiles?: string[]

    toolID?: string

    scanID?: string

    ignoreHTTPSErrors: boolean
}

export interface ILogger {
    debug: (...args: any[]) => void
    info: (...args: any[]) => void,
    error: (...args: any[]) => void,
    warn: (...args: any[]) => void,
    create: (...args: any[]) => void
}

export interface ICheckerError {
    details: any
}

export interface ICheckerResult {
    // reference to a webdriver object if Selenium WebDriver was used for the scan
    webdriver?: any,
    // reference to a puppeteer object if Puppeteer was used for the scan
    // Puppeteer is used for string, URL, and file scans
    puppeteer?: any,
    report: ReportResult;
}

export type ICheckerReportCounts = {
    [key in eRuleLevel]?: number
}

export type ICheckerReport = IBaselineReport
export type ReportResult = ICheckerReport | ICheckerError
