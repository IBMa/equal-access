import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as pathResolve } from "node:path";
import { ICheckerReport, ICheckerResult } from "./api/IChecker.js";
import { ACBrowserManager } from "./ACBrowserManager.js";
import { ACEngineManager } from "./ACEngineManager.js";
import { ACConfigManager } from "./common/config/ACConfigManager.js";
import { IConfigInternal } from "./common/config/IConfig.js";
import { ReporterManager } from "./common/report/ReporterManager.js";
import { IAbstractAPI } from "./common/api-ext/IAbstractAPI.js";
import { EngineSummaryCounts, IBaselineReport, IEngineReport } from "./common/engine/IReport.js";
import { BaselineManager, RefactorMap } from "./common/report/BaselineManager.js";
import { ISimulatorStructure } from "./common/engine/ISimulator.js";

declare var after;
declare var afterAll;

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

let Config : IConfigInternal;
let checkPolicy = false;

class MyFS implements IAbstractAPI {
    writeFileSync(filePath: string, data: string | Buffer) {
        let outFile = this.prepFileSync(filePath);
        writeFileSync(outFile, data);
    }
    prepFileSync(filePath: string) : string {
        let outDir = pathResolve(Config.outputFolder);
        let outFile = join(outDir, filePath);
        if (!existsSync(dirname(outFile))) {
            mkdirSync(dirname(outFile), { recursive: true });
        }
        return outFile;
    }
    log(...output) { Config && Config.DEBUG && console.debug(...output) }
    info(...output) { Config && Config.DEBUG && console.info(...output) }
    error(...output) { Config && Config.DEBUG && console.error(...output) }
    loadBaseline(label) {
        let baselineFile = join(join(process.cwd(), Config.baselineFolder), label+".json");
        if (!existsSync(baselineFile)) return null;
        if (typeof require !== "undefined") {
            return require(baselineFile);
        } else {
            return JSON.parse(readFileSync(baselineFile).toString());
        }
    }
    getChecker() {
        return ACEngineManager.getChecker();
    }
}

async function initialize() {
    if (Config) return;
    Config = await ACConfigManager.getConfigUnsupported();
    await ACEngineManager.loadEngineLocal();
    let absAPI = new MyFS();
    let refactorMap : RefactorMap = {}
    let rules = ACEngineManager.getRulesSync();
    for (const rule of rules) {
        if (rule.refactor) {
            for (const key in rule.refactor) {
                refactorMap[key] = rule;
            }
        }
    }
    ReporterManager.initialize(Config, absAPI, await ACEngineManager.getRulesets());
    BaselineManager.initialize(Config, absAPI, refactorMap);
}

// Register hooks synchronously to avoid "Cannot add a hook after tests have started running" error
// Try Jest's afterAll first (most common in modern test suites)
if (typeof (afterAll) !== "undefined") {
    afterAll(async () => {
        await initialize();
        await ReporterManager.generateSummaries();
        await ACBrowserManager.close();
    });
} else if (typeof (after) !== "undefined") {
    // Try Mocha's after
    after(function (done) {
        if (Config) {
            if (this.timeout) {
                this.timeout(300000);
            }
            initialize()
                .then(() => ReporterManager.generateSummaries())
                .then(() => ACBrowserManager.close())
                .then(done);
        } else {
            done();
        }
    });
} else {
    // Try Cucumber asynchronously (it's loaded via dynamic import)
    (async () => {
        try {
            let module = (await import("cucumber"!));
            let {AfterAll} = require('cucumber');
            if (module.default.AfterAll) {
                module.default.AfterAll(function (done) {
                    initialize()
                        .then(() => ReporterManager.generateSummaries())
                        .then(() => ACBrowserManager.close())
                        .then(done);
                });
            }
        } catch (e) {
            // Fallback to process exit handler if no test framework detected
            process.on('beforeExit', async function () {
                if (Config) {
                    await initialize();
                    await ReporterManager.generateSummaries();
                    await ACBrowserManager.close();
                }
            });
        }
    })();
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
        // Since this is a string, we consider this as either URL or local file
        // so build an iframe based on this and get the frame doc and then scan this.
        return ACBrowserManager.buildIframeAndGetDoc(content);
    } else if (ACEngineManager.isSelenium(content) || ACEngineManager.isPuppeteer(content) || ACEngineManager.isPlaywright(content) || ACEngineManager.isWebDriverIO(content)) {

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

export async function getComplianceHelper(content, label) : Promise<ICheckerResult> {
    await initialize();
    Config.DEBUG && console.log("START 'aChecker.getCompliance' function");
    if (!content) {
        console.error("aChecker: Unable to get compliance of null or undefined object")
        //return null;
        throw new Error("aChecker: Unable to get compliance of null or undefined object");
    }

    let parsed = await getParsed(content);
    if (!parsed) {
        console.error("Invalid content: " + content);
        throw new Error("Invalid content: " + content);
    }
    await ACEngineManager.loadEngine(parsed);

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
    } else if (ACEngineManager.isWebDriverIO(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getComplianceHelper:WebDriverIO");
        return await getComplianceHelperWebDriverIO(label, parsed, curPol);
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

const valueToLevel = (reportValue) => {
    let reportLevel;
    if (reportValue[1] === "PASS") {
        reportLevel = "pass";
    }
    else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
        reportLevel = "manual";
    }
    else if (reportValue[0] === "VIOLATION") {
        if (reportValue[1] === "FAIL") {
            reportLevel = "violation";
        }
        else if (reportValue[1] === "POTENTIAL") {
            reportLevel = "potentialviolation";
        }
    }
    else if (reportValue[0] === "RECOMMENDATION") {
        if (reportValue[1] === "FAIL") {
            reportLevel = "recommendation";
        }
        else if (reportValue[1] === "POTENTIAL") {
            reportLevel = "potentialrecommendation";
        }
    }
    return reportLevel;
}

const getCounts = (engineReport) => {
    let counts = {
        violation: 0,
        potentialviolation: 0,
        recommendation: 0,
        potentialrecommendation: 0,
        manual: 0,
        pass: 0
    }
    for (const issue of engineReport.results) {
        ++counts[issue.level];
    }
    return counts;
}


let policies = ${JSON.stringify(Config.policies)};

let checker = new window.ace_ibma.Checker();
let customRulesets = ${JSON.stringify(ACEngineManager.customRulesets)};
customRulesets.forEach((rs) => checker.addRuleset(rs));
setTimeout(function() {
    checker.check(document, policies).then(function(report) {
        for (const result of report.results) {
            delete result.node;
            result.level = valueToLevel(result.value)
        }
        report.summary ||= {};
        report.summary.counts ||= getCounts(report);
        let reportLevels = ${JSON.stringify((Config.reportLevels || []).concat(Config.failLevels || []).map(lvl => lvl.toString()))};
        // Filter out pass results unless they asked for them in reports
        // We don't want to mess with baseline functions, but pass results can break the response object
        report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");
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

        let report : IEngineReport = await browser.executeAsyncScript(scriptStr);
        const getPolicies = "return new window.ace_ibma.Checker().rulesetIds;";
        if (curPol != null && !checkPolicy) {
            checkPolicy = true;
            const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await browser.executeScript(getPolicies));
            areValidPolicy(valPolicies, curPol);
        }

        // If there is something to report...
        let finalReport : IBaselineReport;
        if (report.results) {
            // Add URL to the result object
            const url = await browser.getCurrentUrl();
            const title = await browser.getTitle();
            let origReport : IEngineReport = JSON.parse(JSON.stringify(report));
            if (Config.captureScreenshots && browser.takeScreenshot) {
                const image = await browser.takeScreenshot();
                origReport.screenshot = image;
            }
            finalReport = ReporterManager.addEngineReport("Selenium", startScan, url, title, label, origReport);
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


async function getComplianceHelperWebDriverIO(label, parsed, curPol) : Promise<ICheckerResult> {
    try {
        const startScan = Date.now();
        // NOTE: Engine should already be loaded
        const page = parsed;
        let report : IEngineReport = await page.executeAsync(({ policies, customRulesets, reportLevels }, done) => {
            
            const valueToLevel = (reportValue) => {
                let reportLevel;
                if (reportValue[1] === "PASS") {
                    reportLevel = "pass";
                }
                else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                    reportLevel = "manual";
                }
                else if (reportValue[0] === "VIOLATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "violation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialviolation";
                    }
                }
                else if (reportValue[0] === "RECOMMENDATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "recommendation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialrecommendation";
                    }
                }
                return reportLevel;
            }

            const getCounts = (engineReport) => {
                let counts: EngineSummaryCounts = {
                    violation: 0,
                    potentialviolation: 0,
                    recommendation: 0,
                    potentialrecommendation: 0,
                    manual: 0,
                    pass: 0
                }
                for (const issue of engineReport.results) {
                    ++counts[issue.level];
                }
                return counts;
            }

            let checker = new (window as any).ace_ibma.Checker();
            customRulesets.forEach((rs) => checker.addRuleset(rs));
            return new Promise<Report>((resolve, reject) => {
                setTimeout(function () {
                    checker.check(document, policies).then(function (report) {
                        for (const result of report.results) {
                            delete result.node;
                            result.level = valueToLevel(result.value)
                        }
                        report.summary ||= {};
                        report.summary.counts ||= getCounts(report);
                        // Filter out pass results unless they asked for them in reports
                        // We don't want to mess with baseline functions, but pass results can break the response object
                        report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");
                        resolve(report);
                        done(report);
                    })
                }, 0)
            })
        }, { policies: Config.policies, customRulesets: ACEngineManager.customRulesets, reportLevels: (Config.reportLevels || []).concat(Config.failLevels || []).map(lvl => lvl.toString()) });
        if (curPol != null && !checkPolicy) {
            const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await page.execute(() => (new (window as any).ace_ibma.Checker().rulesetIds)));
            checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        let finalReport: IBaselineReport;

        // If there is something to report...
        if (report.results) {
            let url = await page.execute(() => document.location.href);
            let title = await page.execute(() => (document.location as any).title);
            let origReport = JSON.parse(JSON.stringify(report));

            if (Config.captureScreenshots) {
                let image = await page.screenshot({
                    fullPage: true,
                    encoding: "base64"
                });
                origReport.screenshot = image;
            }
            finalReport = ReporterManager.addEngineReport("WebDriverIO", startScan, url, title, label, origReport);
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

async function getComplianceHelperPuppeteer(label, parsed, curPol) : Promise<ICheckerResult> {
    try { 
        const startScan = Date.now();
        // NOTE: Engine should already be loaded
        const page = parsed;
        let report : IEngineReport = await page.evaluate(({ policies, customRulesets, reportLevels }) => {  
            const valueToLevel = (reportValue) => {
                let reportLevel;
                if (reportValue[1] === "PASS") {
                    reportLevel = "pass";
                }
                else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                    reportLevel = "manual";
                }
                else if (reportValue[0] === "VIOLATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "violation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialviolation";
                    }
                }
                else if (reportValue[0] === "RECOMMENDATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "recommendation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialrecommendation";
                    }
                }
                return reportLevel;
            }

            const getCounts = (engineReport) => {
                let counts: EngineSummaryCounts = {
                    violation: 0,
                    potentialviolation: 0,
                    recommendation: 0,
                    potentialrecommendation: 0,
                    manual: 0,
                    pass: 0
                }
                for (const issue of engineReport.results) {
                    ++counts[issue.level];
                }
                return counts;
            }

            let checker = new (window as any).ace_ibma.Checker();
            customRulesets.forEach((rs) => checker.addRuleset(rs));
            return new Promise<Report>((resolve, reject) => {
                setTimeout(function () {
                    checker.check(document, policies).then(function (report) {
                        for (const result of report.results) {
                            delete result.node;
                            result.level = valueToLevel(result.value)
                        }
                        report.summary ||= {};
                        report.summary.counts ||= getCounts(report);
                        // Filter out pass results unless they asked for them in reports
                        // We don't want to mess with baseline functions, but pass results can break the response object
                        report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");
                        resolve(report);
                    })
                }, 0)
            })
        }, { policies: Config.policies, customRulesets: ACEngineManager.customRulesets, reportLevels: (Config.reportLevels || []).concat(Config.failLevels || []).map(lvl => lvl.toString()) });
        if (curPol != null && !checkPolicy) {
            const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await page.evaluate("new window.ace_ibma.Checker().rulesetIds"));
            checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        let finalReport: IBaselineReport;

        // If there is something to report...
        if (report.results) {
            let url = await page.evaluate("document.location.href");
            let title = await page.evaluate("document.location.title");
            let origReport = JSON.parse(JSON.stringify(report));

            if (Config.captureScreenshots) {
                let image = await page.screenshot({
                    fullPage: true,
                    encoding: "base64"
                });
                origReport.screenshot = image;
            }
            finalReport = ReporterManager.addEngineReport("Puppeteer", startScan, url, title, label, origReport);
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
        const valueToLevel = (reportValue) => {
            let reportLevel;
            if (reportValue[1] === "PASS") {
                reportLevel = "pass";
            }
            else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                reportLevel = "manual";
            }
            else if (reportValue[0] === "VIOLATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = "violation";
                }
                else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = "potentialviolation";
                }
            }
            else if (reportValue[0] === "RECOMMENDATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = "recommendation";
                }
                else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = "potentialrecommendation";
                }
            }
            return reportLevel;
        }

        const getCounts = (engineReport) => {
            let counts: EngineSummaryCounts = {
                violation: 0,
                potentialviolation: 0,
                recommendation: 0,
                potentialrecommendation: 0,
                manual: 0,
                pass: 0
            }
            for (const issue of engineReport.results) {
                ++counts[issue.level];
            }
            return counts;
        }

        let startScan = Date.now();
        let checker = ACEngineManager.getChecker();
        ACEngineManager.customRulesets.forEach((rs) => checker.addGuideline(rs));
        let report : IEngineReport = await checker.check(parsed, Config.policies)
            .then(function (report) {
                for (const result of report.results) {
                    delete result.node;
                    result.level = valueToLevel(result.value)
                }
                report.summary ||= {};
                report.summary.counts ||= getCounts(report);
                let reportLevels = (Config.reportLevels || []).concat(Config.failLevels || []).map(lvl => lvl.toString());
                // Filter out pass results unless they asked for them in reports
                // We don't want to mess with baseline functions, but pass results can break the response object
                report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");
                return report;
            })

        if (curPol != null && !checkPolicy) {
            let valPolicies = checker.getGuidelineIds();
            checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        let finalReport: ICheckerReport;

        // If there is something to report...
        if (report.results) {
            let url = parsed.location && parsed.location.href;

            let origReport = JSON.parse(JSON.stringify(report));
            finalReport = ReporterManager.addEngineReport("Native", startScan, url, parsed.title, label, origReport);
        }

        return {
            "report": finalReport
        };
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}


///////////

export async function getSimulationHelper(content, label) : Promise<ISimulatorStructure> {
    await initialize();
    Config.DEBUG && console.log("START 'aChecker.getSimulationHelper' function");
    if (!content) {
        console.error("aChecker: Unable to get simulation of null or undefined object")
        //return null;
        throw new Error("aChecker: Unable to get simulation of null or undefined object");
    }

    let parsed = await getParsed(content);
    if (!parsed) {
        console.error("Invalid content: " + content);
        throw new Error("Invalid content: " + content);
    }
    await ACEngineManager.loadEngine(parsed);

    if (ACEngineManager.isSelenium(parsed)) {
        Config.DEBUG && console.log("getSimulationHelper:Selenium");
        return await getSimulationHelperSelenium(label, parsed);
    } else if (ACEngineManager.isPuppeteer(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getSimulationHelper:Puppeteer");
        return await getSimulationHelperPuppeteer(label, parsed);
    } else if (ACEngineManager.isPlaywright(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getSimulationHelper:Playwright");
        return await getSimulationHelperPuppeteer(label, parsed);
    } else if (ACEngineManager.isWebDriverIO(parsed)) {
        Config.DEBUG && console.log("ACHelper.ts:getSimulationHelper:WebDriverIO");
        return await getSimulationHelperWebDriverIO(label, parsed);
    } else {
        Config.DEBUG && console.log("ACHelper.ts:getSimulationHelper:Local");
        return await getSimulationHelperLocal(label, parsed);
    }
}

async function getSimulationHelperSelenium(label: string, parsed) : Promise<ISimulatorStructure> {
    try {
        let startScan = Date.now();
        // NOTE: Engine should already be loaded
        let browser = parsed;
        // Selenium
        let scriptStr =
            `let cb = arguments[arguments.length - 1];
try {
    const SRController = window.ace_ibma.SRController;
    setTimeout(function() {
        try {
            const result = SRController.renderStructure(window.document);
            cb(result);
        } catch(error) {
            cb(error);
        }
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

        let result : ISimulatorStructure = await browser.executeAsyncScript(scriptStr);

        // If there is something to report...
        if (result) {
            // Add URL to the result object
            const url = await browser.getCurrentUrl();
            const title = await browser.getTitle();
            ReporterManager.addSimulatorResult("Selenium-simulator", Date.now()-startScan, url, title, label, result);
        }
        
        return result;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}


async function getSimulationHelperWebDriverIO(label: string, parsed) : Promise<ISimulatorStructure> {
    try {
        const startScan = Date.now();
        // NOTE: Engine should already be loaded
        const page = parsed;
        let result : ISimulatorStructure = await page.executeAsync(({}, done) => {
            const SRController = (window as any).ace_ibma.SRController;
            return new Promise<Report>((resolve, reject) => {
                setTimeout(function () {
                    try {
                        const result = SRController.renderStructure(window.document);
                        resolve(result);
                        done(result);
                    } catch(error) {
                        reject(error);
                        done(error);
                    }
                }, 0)
            })
        }, {});

        if (result) {
            const url = await page.execute(() => document.location.href);
            const title = await page.execute(() => (document.location as any).title);
            const origResult: ISimulatorStructure = JSON.parse(JSON.stringify(result));
            ReporterManager.addSimulatorResult("WebDriverIO-simulator", Date.now()-startScan, url, title, label, origResult);
        }
        page.aceBusy = false;

        return result;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}

async function getSimulationHelperPuppeteer(label: string, parsed) : Promise<ISimulatorStructure> {
    try {
        const startScan = Date.now();
        // NOTE: Engine should already be loaded
        const page = parsed;
        let result : ISimulatorStructure = await page.evaluate(() => {
            const SRController = (window as any).ace_ibma.SRController;
            return new Promise<ISimulatorStructure>((resolve, reject) => {
                setTimeout(function () {
                    try {
                        const result = SRController.renderStructure(window.document);
                        resolve(result);
                    } catch(error) {
                        reject(error);
                    }
                }, 0)
            })
        });

        // If there is something to report...
        if (result) {
            const url = await page.evaluate("document.location.href");
            const title = await page.evaluate("document.location.title");
            const origResult: ISimulatorStructure = JSON.parse(JSON.stringify(result));

            ReporterManager.addSimulatorResult("Puppeteer-simulator", Date.now()-startScan, url, title, label, origResult);
        }
        
        page.aceBusy = false;

        return result;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}

async function getSimulationHelperLocal(label: string, parsed) : Promise<ISimulatorStructure> {
    try {
        let startScan = Date.now();
        const SRController = (window as any).ace_ibma.SRController;
        let result : ISimulatorStructure = SRController.renderStructure(window.document);

        // If there is something to report...
        if (result) {
            let url = parsed.location && parsed.location.href;
            const origResult: ISimulatorStructure = JSON.parse(JSON.stringify(result));
            ReporterManager.addSimulatorResult("Native-simulator", Date.now()-startScan, url, parsed.title, label, origResult);
        }

        return result;
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    };
}