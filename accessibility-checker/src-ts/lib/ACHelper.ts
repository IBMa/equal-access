import { ICheckerReport, ICheckerResult, IConfigUnsupported } from "./api/IChecker";
import { ACBrowserManager } from "./ACBrowserManager";
import { ACConfigManager } from "./ACConfigManager";
import { ACEngineManager } from "./ACEngineManager";
import { ACReportManager } from "./ACReportManager";
import { Report } from "./api/IEngine";

declare var after;

let loggerCreate = function (type) {
    return logger;
};

let logger = {
    debug: (...output) => { Config && Config.DEBUG && console.debug(...output) },
    info: (...output) => { Config && Config.DEBUG && console.info(...output) },
    error: (...output) => { Config && Config.DEBUG && console.error(...output) },
    warn: (...output) => { Config && Config.DEBUG && console.warn(...output) },
    create: loggerCreate
};

let Config : IConfigUnsupported;
let checkPolicy = false;

async function initialize() {
    if (Config) return;
    Config = await ACConfigManager.getConfigUnsupported();
    await ACReportManager.initialize(logger);
    return ACEngineManager.loadEngineLocal();
}

try {
    // If cucumber is the platform...
    let {AfterAll} = require('cucumber');
    AfterAll(function (done) {
        const rulePack = `${Config.rulePack}`;
        initialize().then(() => ACReportManager.metricsLogger.sendLogsV2(() => ACBrowserManager.close().then(done), rulePack));
    });
} catch (e) {
    if (typeof (after) !== "undefined") {
        after(function (done) {
            if (Config) {
                const rulePack = `${Config.rulePack}/ace`;
                initialize().then(() => ACReportManager.metricsLogger.sendLogsV2(() => ACBrowserManager.close().then(done), rulePack));
            } else {
                done();
            }
        });
    } else {
        process.on('beforeExit', async function () {
            if (Config) {
                const rulePack = `${Config.rulePack}/ace`;
                initialize().then(() => ACReportManager.metricsLogger.sendLogsV2(null, rulePack));
                ACBrowserManager.close();
            }
        });
    }
}

function areValidPolicy(valPolicies, curPol) {
    let isValPol = false;
    let errorPolicy = "";

    for (let i = 0; i < curPol.length; ++i) {
        if (valPolicies.indexOf(curPol[i]) === -1) {
            errorPolicy += "" + curPol[i] + ",";
        } else {
            isValPol = true;
        }

    }
    if (errorPolicy.length > 0) {
        errorPolicy = errorPolicy.substr(0, errorPolicy.length - 1);
        console.log(`[WARN] InvalidPolicies: Invalid policies "${errorPolicy}". Valid policy ids are: ${valPolicies}`);
    }
    if (!isValPol) {
        const errStr = `[ERROR] ValidPoliciesMissing: No valid policy has been provided. Valid policy ids for the specified archive are: ${valPolicies}`;
        console.error(errStr);
        throw new Error(errStr);
    }
}

export async function getComplianceHelper(content, label) : Promise<ICheckerResult> {
    await initialize();
    Config.DEBUG && console.log("START 'aChecker.getCompliance' function");
    if (!content) {
        console.error("aChecker: Unable to get compliance of null or undefined object")
        return null;
    }

    // Variable Decleration
    let URL;

    // Since we need to handle multiple variation of possible ways to scan items, we need to handle
    // each one differently as each one requires specific actions/setup.
    // Handle the following:
    //  Single node (HTMLElement)
    //  Multiple node (Array of HTMLElements)
    //  Local file (String)
    //  URL (String)
    //  document

    async function getParsed(content) {
        if (!content) return null;

        // Handle local file and URL's
        if (typeof content === "string") {
            let isURLRegex = /^(ftp|http|https):\/\//;

            if (isURLRegex.test(content)) {
                URL = content;
            }

            // Since this is a string, we consider this as either URL or local file
            // so build an iframe based on this and get the frame doc and then scan this.
            return ACBrowserManager.buildIframeAndGetDoc(content);
        } else if (ACEngineManager.isSelenium(content) || ACEngineManager.isPuppeteer(content) || ACEngineManager.isPlaywright(content)) {

        }
        // Handle Array of nodes
        else if (content instanceof Array) {
            // TODO: Supporting Array of nodes, possible future enhancenment
        }
        // Handle single node (HTMLElement)
        else if (content.nodeType === 1) {
            // In the case this is a node, there is nothing special that needs to be done at this time,
            // the engine will be able to handle this. Adding this block here as we may need to add some filtering
            // of rules or rule sets for this case depending on if a special ruleset needs to be created or not.
            content = content;
        }
        // handle scanning document
        else if (content.nodeType === 9) {
            // In the case this is a document element, simply send the document object to the engine for now
            // we will need to do some filtering to remove any karma related aspects, which requires to do a
            // document clone, and then string the karma scripts that are added and then send this document
            // to the engine.
            // TODO: Investigate best approach to perform filtering
            content = content;
        }
        return content;
    }

    let parsed = await getParsed(content);
    if (parsed === null) return null;
    await ACEngineManager.loadEngine(parsed);
    // In the case that the label is null or undefined, throw an error using the karma API
    // console.error with the message of the error.
    if (label === null || typeof label === "undefined" || label === undefined) {

        // Variable Decleration
        let testcaseWhichIsMissingRequiredLabel = null;
        let generalErrorMessageLabelNotUnique = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

        // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
        // This way we can make it the error more descriptive and would help the user identify where the issues is.
        // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
        // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
        // testcase which called this function.
        try {
            // Throw Error() object
            throw new Error();
        } catch (exception) {
            // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
            testcaseWhichIsMissingRequiredLabel = exception.stack.split("\n")[1];

            // Call the Karma error API, to send message to the Karma server that there was an error on the client side
            console.error("Label was not provided at: " + testcaseWhichIsMissingRequiredLabel + generalErrorMessageLabelNotUnique);
        }
    }

    // Check to make sure that the label that is provided is unique with all the other ones
    // that we have gone through.
    let labelUnique = ACReportManager.isLabelUnique(label);

    // In the case that the label is not unique
    if (!labelUnique) {
        // Variable Decleration dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html
        let testcaseDoesNotUseUniqueLabel = null;
        let generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single accessibility-checker session.";

        // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
        // This way we can make it the error more descriptive and would help the user identify where the issues is.
        // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
        // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
        // testcase which called this function.
        try {
            // Throw Error() object
            throw new Error();
        } catch (exception) {
            // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
            testcaseDoesNotUseUniqueLabel = exception.stack.split("\n")[1];

            // Call the Karma error API, to send message to the Karma server that there was an error on the client side
            console.error("Label \"" + label + "\" provided at: " + testcaseDoesNotUseUniqueLabel + " is not unique." + generalErrorMessageLabelNotUnique);
        }
    }

    // Get the Data when the scan is started
    // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
    let policies = Config.policies;
    let curPol = null;
    if (policies) {
        curPol = JSON.parse(JSON.stringify(policies));
    }
    if (ACEngineManager.isSelenium(parsed)) {
        Config.DEBUG && console.log("getComplianceHelper:Selenium");
        return await getComplianceHelperSelenium(label, parsed, curPol);
    } else if (ACEngineManager.isPuppeteer(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getComplianceHelper:Puppeteer");
        return await getComplianceHelperPuppeteer(label, parsed, curPol);
    } else if (ACEngineManager.isPlaywright(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getComplianceHelper:Playwright");
        return await getComplianceHelperPuppeteer(label, parsed, curPol);
    } else {
        Config.DEBUG && console.log("ACHelper.ts:getComplianceHelper:Local");
        return await getComplianceHelperLocal(label, parsed, curPol);
    }
}

async function getComplianceHelperSelenium(label, parsed, curPol) : Promise<ICheckerResult> {
    try {
        let startScan = Date.now();
        // NOTE: Engine should already be loaded
        let browser = parsed;
        // Selenium
        let scriptStr =
            `let cb = arguments[arguments.length - 1];
try {
let policies = ${JSON.stringify(Config.policies)};

let checker = new window.ace_ibma.Checker();
let customRulesets = ${JSON.stringify(ACEngineManager.customRulesets)};
customRulesets.forEach((rs) => checker.addRuleset(rs));
setTimeout(function() {
    checker.check(document, policies).then(function(report) {
        for (const result of report.results) {
            delete result.node;
        }
        cb(report);
    })
},0)
} catch (e) {
cb(e);
}`
        let manage = browser.manage();
        if (manage.timeouts) {
            manage.timeouts().setScriptTimeout(60000);
        } else if (manage.setTimeouts) {
            manage.setTimeouts({
                "script": 60000
            })
        }

        let report : Report = await browser.executeAsyncScript(scriptStr);
        report = ACReportManager.setLevels(report);
        const getPolicies = "return new window.ace_ibma.Checker().rulesetIds;";
        if (curPol != null && !checkPolicy) {
            checkPolicy = true;
            const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await browser.executeScript(getPolicies));
            areValidPolicy(valPolicies, curPol);
        }

        // If there is something to report...
        let finalReport : ICheckerReport;
        if (report.results) {
            // Add URL to the result object
            const url = await browser.getCurrentUrl();
            let origReport = JSON.parse(JSON.stringify(report));
            origReport = ACReportManager.buildReport(origReport, {}, url, label, startScan);

            // Filter the violations based on the reportLevels
            report = ACReportManager.filterViolations(report);

            // Add the count object, to data a recount after the filtering of violations is done.
            let counts = ACReportManager.getCounts(report);

            // Add the violation count to global summary object
            ACReportManager.addToSummaryCount(counts);

            // Build the report object for this scan, to follow a specific format. Refer to the
            // function prolog for more information on the object creation.
            finalReport = ACReportManager.buildReport(report, counts, url, label, startScan);

            // Add the scan results to global karma result object which can be accessed when users testcase
            // finishes, user can also access it to alter it for any reason.
            ACReportManager.addResultsToGlobal(finalReport);

            // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
            // saved to a file by the server side reporter.
            ACReportManager.sendResultsToReporter(origReport, finalReport, "Selenium");

            if (Config.captureScreenshots && browser.takeScreenshot) {
                const image = await browser.takeScreenshot();
                let screenshotResult = {
                    image: image,
                    label: label,
                    scanID: finalReport.scanID
                };

                ACReportManager.sendScreenShotToReporter(screenshotResult);
            }
        }
        return {
            "report": finalReport,
            "webdriver": parsed
        }
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}

async function getComplianceHelperPuppeteer(label, parsed, curPol) : Promise<ICheckerResult> {
    try { 
        const startScan = Date.now();
        // NOTE: Engine should already be loaded
        const page = parsed;
        let report : Report = await page.evaluate(({ policies, customRulesets }) => {
            
            let checker = new (window as any).ace_ibma.Checker();
            customRulesets.forEach((rs) => checker.addRuleset(rs));
            return new Promise<Report>((resolve, reject) => {
                setTimeout(function () {
                    checker.check(document, policies).then(function (report) {
                        for (const result of report.results) {
                            delete result.node;
                        }
                        resolve(report);
                    })
                }, 0)
            })
        }, { policies: Config.policies, customRulesets: ACEngineManager.customRulesets });
        report = ACReportManager.setLevels(report);
        if (curPol != null && !checkPolicy) {
            const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await page.evaluate("new window.ace_ibma.Checker().rulesetIds"));
            checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        let finalReport: ICheckerReport;

        // If there is something to report...
        if (report.results) {
            let url = await page.evaluate("document.location.href");

            let origReport = JSON.parse(JSON.stringify(report));
            origReport = ACReportManager.buildReport(origReport, {}, url, label, startScan);

            // Filter the violations based on the reporLevels
            report = ACReportManager.filterViolations(report);

            // Add the count object, to data a recount after the filtering of violations is done.
            let counts = ACReportManager.getCounts(report);

            // Add the violation count to global summary object
            ACReportManager.addToSummaryCount(counts);

            // Build the report object for this scan, to follow a specific format. Refer to the
            // function prolog for more information on the object creation.
            finalReport = ACReportManager.buildReport(report, counts, url, label, startScan);

            // Add the scan results to global karma result object which can be accessed when users testcase
            // finishes, user can also access it to alter it for any reason.
            ACReportManager.addResultsToGlobal(finalReport);

            // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
            // saved to a file by the server side reporter.
            ACReportManager.sendResultsToReporter(origReport, finalReport, "Puppeteer");

            if (Config.captureScreenshots) {
                let image = await page.screenshot({
                    fullPage: true,
                    encoding: "base64"
                });
                let screenshotResult = {
                    image: image,
                    label: label,
                    scanID: Config.scanID
                };

                ACReportManager.sendScreenShotToReporter(screenshotResult);
            }
        }
        page.aceBusy = false;

        return {
            "report": finalReport,
            "puppeteer": parsed
        };
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}

async function getComplianceHelperLocal(label, parsed, curPol) : Promise<ICheckerResult> {
    try {
        let startScan = Date.now();
        let checker = ACEngineManager.getChecker();
        ACEngineManager.customRulesets.forEach((rs) => checker.addRuleset(rs));
        let report : Report = await checker.check(parsed, Config.policies)
            .then(function (report) {
                for (const result of report.results) {
                    delete result.node;
                }
                return report;
            })
        report = ACReportManager.setLevels(report);

        if (curPol != null && !checkPolicy) {
            let valPolicies = checker.rulesetIds;
            checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        let finalReport: ICheckerReport;

        // If there is something to report...
        if (report.results) {
            let url = parsed.location && parsed.location.href;

            let origReport = JSON.parse(JSON.stringify(report));
            origReport = ACReportManager.buildReport(origReport, {}, url, label, startScan);

            // Filter the violations based on the reporLevels
            report = ACReportManager.filterViolations(report);

            // Add the count object, to data a recount after the filtering of violations is done.
            let counts = ACReportManager.getCounts(report);

            // Add the violation count to global summary object
            ACReportManager.addToSummaryCount(counts);

            // Build the report object for this scan, to follow a specific format. Refer to the
            // function prolog for more information on the object creation.
            finalReport = ACReportManager.buildReport(report, counts, URL, label, startScan);

            // Add the scan results to global karma result object which can be accessed when users testcase
            // finishes, user can also access it to alter it for any reason.
            ACReportManager.addResultsToGlobal(finalReport);

            // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
            // saved to a file by the server side reporter.
            ACReportManager.sendResultsToReporter(origReport, finalReport, "Native");
        }

        return {
            "report": finalReport
        };
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}
