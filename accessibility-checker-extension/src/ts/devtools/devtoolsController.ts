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

import { getBGController, TabChangeType } from "../background/backgroundController";
import { IBasicTableRowRecord, IIssue, IMessage, IReport, IStoredReportMeta } from "../interfaces/interfaces";
import { CommonMessaging } from "../messaging/commonMessaging";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import Config from "../util/config";
import { genReport } from "../util/htmlReport/genReport";
import { getTabId } from "../util/tabId";
import MultiScanData from "../util/xlsxReport/multiScanReport/xlsx/MultiScanData";
import MultiScanReport from "../util/xlsxReport/multiScanReport/xlsx/MultiScanReport";

let devtoolsState : {
    storeReports: boolean
    storedReports: IStoredReportMeta[]
    lastReport: IReport | null
    lastReportMeta: IStoredReportMeta | null
    lastElementPath: string | null
    lastIssue: IIssue | null
    viewState: ViewState
    focusedMode: boolean
    scanningState: ScanningState
    activePanel: ePanel | null
} | null = null;

export type ePanel = "main" | "elements";

export interface ViewState {
    kcm: boolean
}

export type ScanningState = "initializing" 
    | "running"
    | "processing"
    | "idle";

export class DevtoolsController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    ///// Stored reports functions /////////////////////////////////////////

    /**
     * Get stored reports
     */
    public async getStoredReports() : Promise<IBasicTableRowRecord[]> {
        let retVal = await this.hook("getStoredReports", null, async () => {
            return devtoolsState!.storedReports;
        });
        return retVal;
    }

    public async getStoredReportsMeta() : Promise<IStoredReportMeta[]> {
        return await this.hook("getStoredReportsMeta", null, async () => {
            return devtoolsState!.storedReports.map(report => ({
                id: report.id,
                timestamp: report.timestamp,
                label: report.label,
                ruleset: report.ruleset,
                guideline: report.guideline,
                pageTitle: report.pageTitle,
                pageURL: report.pageURL,
                screenshot: report.screenshot,
                counts: report.counts,
                storedScanData: report.storedScanData,
                testedUniqueElements: report.testedUniqueElements
            }));
        });
    }

     /**
     * Set stored reports
     */
    public async setStoredReportsMeta(updateMetaArr: IStoredReportMeta[]) : Promise<void> {
        return await this.hook("setStoredReportsMeta", updateMetaArr, async () => {
            if (updateMetaArr.length === 0) {
                devtoolsState!.storedReports = [];
                getBGController().setStoredScanCount({ tabId: this.ctrlDest.tabId, count: 0});
                this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, await this.getStoredReportsMeta());
            } else {
                let misMatch = false;
                let newReports = [];
                for (const updateMeta of updateMetaArr) {
                    let keepVal = devtoolsState!.storedReports.find(scan => scan.id === updateMeta.id);
                    if (keepVal) {
                        if (keepVal.timestamp !== updateMeta.timestamp) {
                            // Something's out of sync
                            misMatch = true;
                            break;
                        }
                        for (const key in updateMeta) {
                            (keepVal as any)[key] = (updateMeta as any)[key];
                        }
                        keepVal.id = ""+newReports.length;
                        newReports.push(keepVal);
                    } else {
                        // Something's out of sync
                        misMatch = true;
                        break;
                    }
                }
                if (!misMatch) {
                    devtoolsState!.storedReports = newReports;
                    let data = await this.getStoredReportsMeta();
                    getBGController().setStoredScanCount({ tabId: this.ctrlDest.tabId, count: data.length});
                    this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, data);
                }
            }
        });
    }

    public async setStoredReportsMetaLabel(idx: number, label: string) {
        return await this.hook("setStoredReportsMetaLabel", { idx, label }, async () => {
            if (devtoolsState!.storedReports![idx].label !== label) {
                devtoolsState!.storedReports![idx].label = label;
                let data = await this.getStoredReportsMeta();
                this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, data);
            }
        });
    }

    public async addStoredReportsMetaListener(listener: ListenerType<IStoredReportMeta[]>) {
        this.addEventListener(listener, `DT_onStoredReportsMeta`);
    }

    /**
     * Clear stored reports
     */
    public async clearStoredReports() : Promise<void> {
        return this.hook("clearStoredReports", null, async () => {
            devtoolsState!.storedReports = [];
            getBGController().setStoredScanCount({ tabId: this.ctrlDest.tabId, count: 0});
            this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, await this.getStoredReportsMeta());
        });
    }

    /**
     * Set store reports
     */
    public async getStoreReports() : Promise<boolean> {
        return this.hook("getStoreReports", null, async () => {
            return devtoolsState!.storeReports;
        });
    }

    /**
     * Set store reports
     */
    public async setStoreReports(bVal: boolean) : Promise<void> {
        return this.hook("setStoreReports", bVal, async () => {
            devtoolsState!.storeReports = bVal;
            this.notifyEventListeners("DT_onStoreReports", this.ctrlDest.tabId, bVal);
        });
    }

    public async addStoreReportsListener(listener: ListenerType<boolean>) {
        this.addEventListener(listener, `DT_onStoreReports`);
    }

    public async removeStoreReportsListener(listener: ListenerType<ViewState>) {
        this.removeEventListener(listener, `DT_onStoreReports`);
    }

    ///// Report functions /////////////////////////////////////////

    private scanCounter = 1;

    valueMap: { [key: string]: { [key2: string]: string } } = {
        "VIOLATION": {
            "POTENTIAL": "Needs review",
            "FAIL": "Violation",
            "PASS": "Pass",
            "MANUAL": "Needs review"
        },
        "RECOMMENDATION": {
            "POTENTIAL": "Recommendation",
            "FAIL": "Recommendation",
            "PASS": "Pass",
            "MANUAL": "Recommendation"
        },
        "INFORMATION": {
            "POTENTIAL": "Needs review",
            "FAIL": "Violation",
            "PASS": "Pass",
            "MANUAL": "Recommendation"
        }
    };

    initCount() {
        return {
            "Violation": 0,
            "Needs review": 0,
            "Recommendation": 0,
            "Hidden": 0,
            "Pass": 0,
            "total": 0,
        }
    }

    async getCountsWithHidden (reportCounts: IReport["counts"], ignored: IIssue[]) {
        let counts = this.initCount(); // setup counts
        // populate initial counts
        counts.Violation = reportCounts.Violation;
        counts["Needs review"] = reportCounts["Needs review"];
        counts.Recommendation = reportCounts.Recommendation;
        counts.Hidden = ignored.length;
        counts.Pass = reportCounts.Pass;

        // correct issue type counts to take into account the hidden issues
        if (ignored.length > 0) { // if we have hidden
            for (const ignoredIssue of ignored) {
                if ("Violation" === this.valueMap[ignoredIssue.value[0]][ignoredIssue.value[1]]) {
                    counts.Violation--;
                }
                if ("Needs review" === this.valueMap[ignoredIssue.value[0]][ignoredIssue.value[1]]) {
                    counts["Needs review"]--;
                }
                if ("Recommendation" === this.valueMap[ignoredIssue.value[0]][ignoredIssue.value[1]]) {
                    counts.Recommendation--;
                }
            }
        }
        counts.total = counts.Violation + counts["Needs review"] + counts.Recommendation;
        return counts;
    }

    /**
     * Set report 
     */
    public async setReport(report: IReport | null) : Promise<void> {
        return this.hook("setReport", report, async () => {
            let bgController = getBGController();
            let settings = await bgController.getSettings();
            if (report) {
                let tabId = getTabId();
                let tabInfo = await bgController.getTabInfo(tabId);
                let ignored: IIssue[] = await bgController.getIgnore(tabInfo.url!);
                let newCounts = await this.getCountsWithHidden(report.counts, ignored);
                const now = new Date().getTime();
                devtoolsState!.lastReportMeta = {
                    id: devtoolsState!.storedReports.length+"",
                    timestamp: now,
                    label: `scan_${this.scanCounter++}`,
                    ruleset: settings.selected_archive.id,
                    guideline: settings.selected_ruleset.id,
                    pageTitle: tabInfo.title!,
                    pageURL: tabInfo.url!,
                    screenshot: await bgController.getScreenshot(tabId),
                    storedScanData: MultiScanData.issues_sheet_rows({
                        settings: settings,
                        report: report,
                        ignored: ignored,
                        pageTitle: tabInfo.title!,
                        pageURL: tabInfo.url!,
                        timestamp: now+"",
                        rulesets: await bgController.getRulesets(tabId!)
                    }),
                    testedUniqueElements: report.testedUniqueElements,
                    counts: newCounts
                };
                if (devtoolsState?.storeReports) {
                    devtoolsState.storedReports.push(devtoolsState.lastReportMeta);
                }
            }
            devtoolsState!.lastReport = report;
            return new Promise((resolve, _reject) => {
                setTimeout(async () => {
                    this.notifyEventListeners("DT_onReport", this.ctrlDest.tabId, report);
                    let storedReportsMeta = await this.getStoredReportsMeta();
                    getBGController().setStoredScanCount({ tabId: this.ctrlDest.tabId, count: storedReportsMeta.length});
                    this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, storedReportsMeta);
                    resolve();
                }, 0)
            });
        });
    }

    /**
     * Get report
     */
    public async getReport() : Promise<IReport | null> {
        return this.hook("getReport", null, async () => {
            if (!devtoolsState) return null;
            return devtoolsState?.lastReport;
        });
    }

    public async getReportMeta() : Promise<IStoredReportMeta | null> {
        return this.hook("getReportMeta", null, async () => {
            if (!devtoolsState) return null;
            return devtoolsState?.lastReportMeta;
        });
    }

    public async addReportListener(listener: ListenerType<IReport>) {
        this.addEventListener(listener, `DT_onReport`);//, listener.callbackTabId);
    }

    public async removeReportListener(listener: ListenerType<IReport>) {
        this.removeEventListener(listener, `DT_onReport`);
    }

    public async setScanningState(newState: ScanningState) {
        return this.hook("setScanningState", null, async () => {
            if (!devtoolsState) return;
            devtoolsState.scanningState = newState;
            this.notifyEventListeners("DT_onScanningState", this.ctrlDest.tabId, newState);
        });
    }

    public async addScanningStateListener(listener: ListenerType<ScanningState>) {
        this.addEventListener(listener, `DT_onScanningState`);//, listener.callbackTabId);
    }

    public async rempoveScanningStateListener(listener: ListenerType<ScanningState>) {
        this.removeEventListener(listener, `DT_onScanningState`);
    }

    ///// View state (visualization) functions //////////////////////////////////////

    /**
     * Set view state
     */
    public async setViewState(newState: ViewState | null) : Promise<void> {
        return this.hook("setViewState", newState, async () => {
            if (newState) {
                devtoolsState!.viewState = newState;
                setTimeout(() => {
                    this.notifyEventListeners("DT_onViewState", this.ctrlDest.tabId, newState);
                }, 0);
            }
        });
    }

    /**
     * Get view state
     */
    public async getViewState() : Promise<ViewState | null> {
        return this.hook("getViewState", null, async () => {
            if (!devtoolsState) return null;
            return devtoolsState?.viewState;
        });
    }

    public async addViewStateListener(listener: ListenerType<ViewState>) {
        this.addEventListener(listener, `DT_onViewState`);
    }

    public async removeViewStateListener(listener: ListenerType<ViewState>) {
        this.removeEventListener(listener, `DT_onViewState`);
    }

    ///// Issue/path functions /////////////////////////////////////////

    /**
     * Set selected issue
     */
    public async setSelectedIssue(issue: IIssue | null) : Promise<void> {
        return this.hook("setSelectedIssue", issue, async () => {
            if (issue) {
                devtoolsState!.lastIssue = issue;
                setTimeout(async () => {
                    this.notifyEventListeners("DT_onSelectedIssue", this.ctrlDest.tabId, issue);
                }, 0);
            }
        });
    }

    /**
     * Get selected issue
     */
    public async getSelectedIssue() : Promise<IIssue | null> {
        return this.hook("getSelectedIssue", null, async () => {
            if (!devtoolsState) return null;
            return devtoolsState?.lastIssue;
        });
    }
    
    public async addSelectedIssueListener(listener: ListenerType<IIssue>) {
        this.addEventListener(listener, `DT_onSelectedIssue`);
    }

    programmaticInspect: boolean = false;

    /**
     * Set selected element path
     */
    public async setSelectedElementPath(path: string | null, fromElemChange?: boolean) : Promise<void> {
        return this.hook("setSelectedElementPath", { path, fromElemChange }, async () => {
            devtoolsState!.lastElementPath = path;
            if (fromElemChange === true) {
                // This path came from the Elements panel selection changing
                if (!this.programmaticInspect) {
                    // User clicked on this
                    if (Config.ELEM_FOCUS_MODE) {
                        await this.setFocusMode(true);
                    }
                    // if (path && path !== devtoolsState!.lastElementPath) {
                    if (path) {
                        let report = await this.getReport();
                        if (report) {
                            let newIssue : IIssue | null = null;
                            for (const issue of report.results) {
                                if (issue.value[1] !== "PASS" && issue.path.dom === path) {
                                    newIssue = issue;
                                    break;
                                } else if (!newIssue && issue.value[1] !== "PASS" && issue.path.dom.startsWith(path)) {
                                    newIssue = issue;
                                }
                            }
                            await this.setSelectedIssue(newIssue);
                        }
                    }
                } else {
                    // Side effect of inspectPath
                    this.programmaticInspect = false;
                }
            } else {
                // Called by some other process
            }
            setTimeout(() => {
                this.notifyEventListeners("DT_onSelectedElementPath", this.ctrlDest.tabId, path);
            }, 0);
        });
    }

    /**
     * Get Selected Element Path
     */
    public async getSelectedElementPath() : Promise<string | null> {
        return this.hook("getSelectedElementPath", null, async () => {
            if (!devtoolsState) return null;
            return devtoolsState?.lastElementPath;
        });
    }
    
    public async addSelectedElementPathListener(listener: ListenerType<string>) {
        this.addEventListener(listener, `DT_onSelectedElementPath`);
    }
    
    /**
     * Focus an element in the elements panel
     * @param path 
     * @param focusElem If specified, we will focus this element after the path is inspected
     */
    public async inspectPath(path: string, focusElem?: HTMLElement | null) {
        await this.hook("inspectPath", path, async () => {
            // We've already selected that...
            // let curSelectedPath = await this.getSelectedElementPath();
            // if (path === curSelectedPath) return;
            let script = `
                function docDomPathToElement(doc, xpath) {
                    if (doc.nodeType === 1) {
                        let selector = xpath.substring(1).replace(/\\//g, " > ").replace(/\\[(\\d+)\\]/g, ":nth-of-type($1)");
                        let element = doc.querySelector(selector);
                        return element;
                    } else if (doc.nodeType === 11) {
                        let selector = ":host" + xpath.replace(/\\//g, " > ").replace(/\\[(\\d+)\\]/g, ":nth-of-type($1)");
                        let element = doc.querySelector(selector);
                        return element;
                    } else {
                        xpath = xpath.replace(/\\/svg\\[/g, "/svg:svg[");
                        let nodes = doc.evaluate(xpath, doc, function(prefix) { 
                            if (prefix === 'svg') { 
                                return 'http://www.w3.org/2000/svg';
                            } else {
                                return null;
                            }
                        }, XPathResult.ANY_TYPE, null);
                        let element = nodes.iterateNext();
                        if (element) {
                            return element;
                        } else {
                            return null;
                        }
                    }
                }
                function domPathToElem(srcPath) {
                    let doc = document;
                    let element = null;
                    while (srcPath && (srcPath.includes("iframe") || srcPath.includes("#document-fragment") || srcPath.includes("slot"))) {
                        let parts = srcPath.match(/(.*?)(\\/#document-fragment\\[\\d+\\]|iframe\\[\\d+\\]|slot\\[\\d+\\]\\/[^/]*)(.*)/);
                        if (parts[2].includes("iframe")) {
                            let iframe = docDomPathToElement(doc, parts[1]+parts[2]);
                            element = iframe || element;
                            if (iframe && iframe.contentDocument) {
                                doc = iframe.contentDocument;
                                srcPath = parts[3];
                            } else {
                                srcPath = null;
                            }
                        } else if (parts[2].includes("#document-fragment")) {
                            let fragment = element;
                            if (parts[1].length > 0) {
                                fragment = docDomPathToElement(doc, parts[1]); // get fragment which is in main document
                            }
                            element = fragment || element;
                            if (fragment && fragment.shadowRoot) {
                                doc = fragment.shadowRoot;
                                srcPath = parts[3];
                            } else {
                                srcPath = null;
                            }
                        } else {
                            // slots
                            let slotParts = parts[2].match(/(slot\\[\\d+\\])\\/([^[]*)\\[(\\d+)\\]/);
                            let slot = docDomPathToElement(doc, parts[1]+slotParts[1]);
                            let count = parseInt(slotParts[3]);
                            for (let slotIdx=0; slotIdx < slot.assignedNodes().length; ++slotIdx) {
                                let slotNode = slot.assignedNodes()[slotIdx];
                                if (slotNode.nodeName.toLowerCase() === slotParts[2].toLowerCase()) {
                                    --count;
                                    if (count === 0) {
                                        element = slotNode;
                                        break;
                                    }
                                }
                            }
                            if (count !== 0) {
                                srcPath = null;
                            } else {
                                srcPath = parts[3];
                                doc = element;
                            }
                        }
                        // console.log(doc, element, srcPath)
                    }
                    if (srcPath) {
                        element = docDomPathToElement(doc, srcPath) || element;
                    }
                    if (element) {
                        inspect(element);
                        let elementRect = element.getBoundingClientRect();
                        let absoluteElementTop = elementRect.top + window.pageYOffset;
                        let middle = absoluteElementTop - 100;
                        // this is to scroll the element on the web page into view
                        element.ownerDocument.defaultView.scrollTo({
                            top: middle,
                            behavior: 'smooth'
                        });
                        return true;
                    }
                    return;
                }
                domPathToElem("${path}");
            `;
            await new Promise<void>((resolve, _reject) => {
                this.programmaticInspect = true;
                chrome.devtools.inspectedWindow.eval(script, function (result, isException) {
                    if (isException) {
                        console.error(isException);
                    }
                    if (!result) {
                        console.log('Could not select element, it may have moved');
                    }
                    resolve();
                });
            });
            let count = 0;
            // Until the programmatic inspect completes, wait
            while (this.programmaticInspect && count < 2) {
                ++count;
                await new Promise((resolve, _reject) => {
                    setTimeout(resolve, 100);
                })
            }
            // 
            this.programmaticInspect = false;
        });
        // This happens after the devtools controller returns to the original caller
        if (focusElem) {
            focusElem.focus();
        }
    }

    ///// Export report functions /////////////////////////////////////////

    public async exportXLS(type: "last" | "all" | "selected") {
        return this.hook("exportXLS", type, async () => {
            if (type === "all" || type === "selected") {
                this.xlsxReportHandler(type);
            } else {
                this.htmlReportHandler();
                this.xlsxReportHandler("current");
            }
        });
        
    }

    private async htmlReportHandler() {
        let bgController = await getBGController();
        let tabId = getTabId();
        let rulesets = await bgController.getRulesets(tabId!);
        let tabInfo = await bgController.getTabInfo(getTabId());
        if (devtoolsState?.lastReport && rulesets) {
            let reportObj: any = {
                tabURL: tabInfo.url,
                rulesets: rulesets,
                report: {
                    testedUniqueElements: devtoolsState?.lastReport.testedUniqueElements,
                    timestamp: devtoolsState?.lastReportMeta!.timestamp,
                    nls: devtoolsState?.lastReport.nls,
                    counts: {
                        "total": devtoolsState?.lastReport.counts.total
                    },
                    results: []
                }
            }
            for (const result of devtoolsState?.lastReport.results) {
                reportObj.report.results.push({
                    ruleId: result.ruleId,
                    reasonId: result.reasonId,
                    path: result.path,
                    value: result.value,
                    message: result.message,
                    snippet: result.snippet,
                    help: result.help
                });
            }

            let tabTitle: string = tabInfo.title!;
            let tabTitleSubString = tabTitle ? tabTitle.substring(0, 50) : "";
            let filename = "Accessibility_Report-" + tabTitleSubString + ".html";
            //replace illegal characters in file name
            filename = filename.replace(/[/\\?%*:|"<>]/g, '-');

            let fileContent = "data:text/html;charset=utf-8," + encodeURIComponent(genReport(reportObj));
            let a = document.createElement('a');
            a.href = fileContent;
            a.download = filename;
            let e = document.createEvent('MouseEvents');
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    }

    public async xlsxReportHandler(scanType:string) {
        // console.log("xlsxReportHandler");
        let archives = await (await getBGController()).getArchives();
        if (scanType === "current") {
            MultiScanReport.multiScanXlsxDownload([devtoolsState?.lastReportMeta!], archives);
        } else if (scanType === "all") {
            MultiScanReport.multiScanXlsxDownload(devtoolsState?.storedReports!, archives);
        } else {
            MultiScanReport.multiScanXlsxDownload(devtoolsState?.storedReports!.filter(report => report.isSelected)!, archives);
        }
    }

    ///// Focus mode functions /////////////////////////////////////////

    /**
     * Set selected issue
     */
    public async setFocusMode(value: boolean) : Promise<void> {
        return this.hook("setFocusMode", value, async () => {
            if (devtoolsState) {
                devtoolsState.focusedMode = value;
                setTimeout(() => {
                    this.notifyEventListeners("DT_onFocusMode", this.ctrlDest.tabId, value);
                }, 0);
            }
        });
    }

    /**
     * Get selected issue
     */
    public async getFocusMode() : Promise<boolean> {
        return this.hook("getFocusMode", null, async () => {
            if (!devtoolsState) return false;
            return devtoolsState!.focusedMode;
        });
    }
    
    public async addFocusModeListener(listener: ListenerType<boolean>) {
        this.addEventListener(listener, `DT_onFocusMode`);
    }

    public async setActivePanel(newPanel: ePanel | null) {
        return this.hook("setActivePanel", newPanel, async () => {
            devtoolsState!.activePanel = newPanel;
        });
    }

    public async getActivePanel() : Promise<ePanel | null> {
        return this.hook("getActivePanel", null, async () => {
            return devtoolsState!.activePanel;
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    constructor(isContentScript: boolean, type: eControllerType, tabId?: number) {
        super(type, { type: "devTools", tabId: (tabId || getTabId())!, relay: isContentScript}, "DT");
        if (type === "local") {
            let self = this;
            devtoolsState = {
                storeReports: false,
                storedReports: [],
                lastReport: null,
                lastReportMeta: null,
                lastElementPath: null,
                lastIssue: null,
                scanningState: "idle",
                viewState: {
                    kcm: false
                },
                focusedMode: false,
                activePanel: null
            };

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            } = {
                "DT_getFocusMode": async() => self.getFocusMode(),
                "DT_setFocusMode": async(msgBody) => self.setFocusMode(msgBody.content),
                "DT_getStoredReports": async () => self.getStoredReports(),
                "DT_getStoredReportsMeta": async() => self.getStoredReportsMeta(),
                "DT_setStoredReportsMeta": async(msgBody) => self.setStoredReportsMeta(msgBody.content),
                "DT_setStoredReportsMetaLabel": async(msgBody) => self.setStoredReportsMetaLabel(msgBody.content.idx, msgBody.content.label),
                "DT_clearStoredReports": async () => self.clearStoredReports(),
                "DT_getStoreReports": async () => self.getStoreReports(),
                "DT_setStoreReports": async (msgBody) => self.setStoreReports(!!msgBody.content),
                "DT_setReport": async (msgBody) => self.setReport(msgBody.content),
                "DT_getReport": async () => self.getReport(),
                "DT_getReportMeta": async () => self.getReportMeta(),
                "DT_getViewState": async () => self.getViewState(),
                "DT_setViewState": async (msgBody) => self.setViewState(msgBody.content),
                "DT_setSelectedIssue": async (msgBody) => self.setSelectedIssue(msgBody.content),
                "DT_getSelectedIssue": async () => self.getSelectedIssue(),
                "DT_setSelectedElementPath": async (msgBody) => self.setSelectedElementPath(msgBody.content.path, msgBody.content.fromElemChange),
                "DT_getSelectedElementPath": async () => self.getSelectedElementPath(),
                "DT_inspectPath": async(msgBody) => self.inspectPath(msgBody.content),
                "DT_exportXLS": async(msgBody) => self.exportXLS(msgBody.content),
                "DT_setScanningState": async(msgBody) => self.setScanningState(msgBody.content),
                "DT_setActivePanel": async(msgBody) => self.setActivePanel(msgBody.content),
                "DT_getActivePanel": async() => self.getActivePanel()
            }

            // Hook the above definitions
            this.hookListener(
                Object.keys(listenMsgs),
                async (msgBody: IMessage<any>, senderTabId?: number) => {
                    let f = listenMsgs[msgBody.type];
                    return f ? f(msgBody,senderTabId) : null;
                }
            )

            let bgController = getBGController();
            bgController.addTabChangeListener(async (content: TabChangeType) => {
                if (content.tabId === this.ctrlDest.tabId) {
                    this.setReport(null);
                    this.setViewState({
                        kcm: false
                    })
                }
            });

            CommonMessaging.send({
                type: "DT_onViewState",
                dest: {
                    type: "contentScript",
                    tabId: this.ctrlDest.tabId
                },
                content: devtoolsState.viewState
            });
        }
    }
}

let singletons : {
    [tabId: number] : DevtoolsController;
} = {};

/**
 * Get a devtools controller
 * @param relay 
 * @param type Set to false if sending messages in the same context (e.g., from devtools panel to devtools main)
 * @param tabId 
 * @returns 
 */
export function getDevtoolsController(isContentScript?: boolean, type?: eControllerType, tabId?: number) {
    if (!singletons[(tabId || getTabId())!]) {
        // console.log("Creating devtools controller", type);
        singletons[(tabId || getTabId())!] = new DevtoolsController(isContentScript === true, type || "remote", tabId);
    }
    return singletons[(tabId || getTabId())!];
}



