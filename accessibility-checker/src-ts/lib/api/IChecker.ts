import { eRuleLevel } from "../common/config/IConfig";
import { IBaselineReport } from "../common/engine/IReport";
import { eRuleLevel, RuleDetails } from "./IEngine.js";

export enum eAssertResult {
    ERROR = -1,
    PASS = 0,
    BASELINE_MISMATCH = 1,
    FAIL = 2
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
