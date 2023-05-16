import { IConfigUnsupported } from "../api/IChecker.js";

export interface IPageScanSummary {
    label: string
}

export interface IScanSummaryCounts {
    ignored?: number
    violation?: number
    review?: number
    recommendation?: number
    recommendationreview?: number
    pass?: number
}

export interface IScanSummary {
    counts: IScanSummaryCounts,
    startReport: number
    endReport: number
    toolID: string
    policies: string
    reportLevels: string[]
    labels: string[]
    failLevels: string[]

    // Add scanID (UUID) to the scan summary object
    scanID: string

    // Build the paceScanSummary object which will contains all the items that were scanned and a count
    // summary for each of the scanned items.
    pageScanSummary: IPageScanSummary[]
}

/**
 * This function is responsible for initializing the summary object which will store all informations about the
 * scans that will occurs while karma is still running and running compliance scans.
 *
 * @return {Object} scanSummary - return the built scan summary object
 *
 * @memberOf this
 */
export function initializeSummary(config: IConfigUnsupported) : IScanSummary {
    // Variable Decleration
    let scanSummary : IScanSummary = {
        counts: {
            ignored: 0,
            violation: undefined,
            review: undefined,
            recommendation: undefined,
            recommendationreview: undefined,
            pass: undefined
        },
        startReport: Date.now(),
        endReport: 0,
        toolID: config.toolID,
        policies: config.policies.join(","),
        reportLevels: config.reportLevels,
        labels: config.label,
        failLevels: config.failLevels,

        // Add scanID (UUID) to the scan summary object
        scanID: config.scanID,

        // Build the paceScanSummary object which will contains all the items that were scanned and a count
        // summary for each of the scanned items.
        pageScanSummary: []
    };
    let reportLevels = config.reportLevels;

    // In the case that report levels are provided then populate the count object in
    // scanSummary.counts object with the levels which were provided in reportLevels
    // array.
    if (reportLevels) {

        // Iterate over the report levels and populate the pageResultsWithCount counts
        // object
        for (const level of reportLevels) {
            scanSummary.counts[level] = 0;
        };
        scanSummary.counts.ignored = 0;
    }
    // Populate the scanSummary.counts object with all the levels
    else {
        scanSummary.counts = {
            violation: 0,
            review: 0,
            recommendation: 0,
            recommendationreview: 0,
            pass: 0,
            ignored: 0
        };
    }

    return scanSummary;
};