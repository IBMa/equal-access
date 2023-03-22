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
import { genReport } from "../util/htmlReport/genReport";
import { getTabId } from "../util/tabId";
import MultiScanData from "../util/xlsxReport/multiScanReport/xlsx/MultiScanData";
import MultiScanReport from "../util/xlsxReport/multiScanReport/xlsx/multiScanReport";

let devtoolsState : {
    storeReports: boolean
    storedReports: IStoredReportMeta[]
    lastReport: IReport | null
    lastReportMeta: IStoredReportMeta | null
    lastElementPath: string | null
    lastIssue: IIssue | null
    viewState: ViewState
    focusedMode: boolean
} | null = null;

export interface ViewState {
    kcm: boolean
}

export class DevtoolsController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
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

    public async setStoredReportsMeta(updateMetaArr: IStoredReportMeta[]) : Promise<void> {
        return await this.hook("setStoredReportsMeta", updateMetaArr, async () => {
            if (updateMetaArr.length === 0) {
                devtoolsState!.storedReports = [];
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

    private scanCounter = 1;
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
                        pageTitle: tabInfo.title!,
                        pageURL: tabInfo.url!,
                        timestamp: now+"",
                        rulesets: await bgController.getRulesets(tabId!)
                    }),
                    testedUniqueElements: report.testedUniqueElements,
                    counts: report.counts
                };
                if (devtoolsState?.storeReports) {
                    devtoolsState.storedReports.push(devtoolsState.lastReportMeta);
                }
            }
            devtoolsState!.lastReport = report;
            setTimeout(async () => {
                this.notifyEventListeners("DT_onReport", this.ctrlDest.tabId, report);
                this.notifyEventListeners("DT_onStoredReportsMeta", this.ctrlDest.tabId, await this.getStoredReportsMeta());
                this.setSelectedElementPath("/html[1]");
            }, 0);
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

    /**
     * Set selected issue
     */
    public async setSelectedIssue(issue: IIssue | null) : Promise<void> {
        return this.hook("setSelectedIssue", issue, async () => {
            if (issue) {
                devtoolsState!.lastIssue = issue;
                setTimeout(() => {
                    this.notifyEventListeners("DT_onSelectedIssue", this.ctrlDest.tabId, issue);
                    this.setSelectedElementPath(issue.path.dom);
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

    /**
     * Set selected element path
     */
    public async setSelectedElementPath(path: string | null) : Promise<void> {
        return this.hook("setSelectedElementPath", path, async () => {
            if (path) {
                if (path !== devtoolsState!.lastElementPath) {
                    devtoolsState!.lastElementPath = path;
                    let report = await this.getReport();
                    if (report) {
                        for (const issue of report.results) {
                            if (issue.value[1] !== "PASS" && issue.path.dom === path) {
                                this.setSelectedIssue(issue);
                                break;
                            }
                        }
                    }
                }
                setTimeout(() => {
                    this.notifyEventListeners("DT_onSelectedElementPath", this.ctrlDest.tabId, path);
                }, 0);
            }
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
            let script = `
                function lookup(doc, xpath) {
                    if (doc.nodeType === 11) {
                        let selector = ":host" + xpath.replace(/\\//g, " > ").replace(/\\[(\\d+)\\]/g, ":nth-of-type($1)");
                        let element = doc.querySelector(selector);
                        return element;
                    } else {
                        let nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
                        let element = nodes.iterateNext();
                        if (element) {
                            return element;
                        } else {
                            return null;
                        }
                    }
                }
                function selectPath(srcPath) {
                    let doc = document;
                    let element = null;
                    while (srcPath && (srcPath.includes("iframe") || srcPath.includes("#document-fragment"))) {
                        if (srcPath.includes("iframe")) {
                            let parts = srcPath.match(/(.*?iframe\\[\\d+\\])(.*)/);
                            let iframe = lookup(doc, parts[1]);
                            element = iframe || element;
                            if (iframe && iframe.contentDocument) {
                                doc = iframe.contentDocument;
                                srcPath = parts[2];
                            } else {
                                srcPath = null;
                            }
                        } else if (srcPath.includes("#document-fragment")) {
                            let parts = srcPath.match(/(.*?)\\/#document-fragment\\[\\d+\\](.*)/);
                            let fragment = lookup(doc, parts[1]);
                            element = fragment || element;
                            if (fragment && fragment.shadowRoot) {
                                doc = fragment.shadowRoot;
                                srcPath = parts[2];
                            } else {
                                srcPath = null;
                            }
                        }
                    }
                    if (srcPath) {
                        element = lookup(doc, srcPath) || element;
                    }
                    if (element) {
                        inspect(element);
                        let elementRect = element.getBoundingClientRect();
                        let absoluteElementTop = elementRect.top + window.pageYOffset;
                        let middle = absoluteElementTop - 100;
                        element.ownerDocument.defaultView.scrollTo({
                            top: middle,
                            behavior: 'smooth'
                        });
                        return true;
                    }
                    return;
                }
                selectPath("${path}");
            `;
            await new Promise<void>((resolve, _reject) => {
                chrome.devtools.inspectedWindow.eval(script, function (result, isException) {
                    if (isException) {
                        console.error(isException);
                    }
                    if (!result) {
                        console.log('Could not select element, it may have moved');
                    }
                    resolve();
                });
            })
        });
        if (focusElem) {
            setTimeout(() => {
                focusElem?.focus();
            }, 100);
        }
    }

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
        } else {
            MultiScanReport.multiScanXlsxDownload(devtoolsState?.storedReports!.filter(report => report.isSelected)!, archives);
        }
    }

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
                viewState: {
                    kcm: false
                },
                focusedMode: false
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
                "DT_setSelectedElementPath": async (msgBody) => self.setSelectedElementPath(msgBody.content),
                "DT_getSelectedElementPath": async () => self.getSelectedElementPath(),
                "DT_inspectPath": async(msgBody) => self.inspectPath(msgBody.content),
                "DT_exportXLS": async(msgBody) => self.exportXLS(msgBody.content)
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

let singleton : DevtoolsController;
/**
 * Get a devtools controller
 * @param relay 
 * @param type Set to false if sending messages in the same context (e.g., from devtools panel to devtools main)
 * @param tabId 
 * @returns 
 */
export function getDevtoolsController(isContentScript?: boolean, type?: eControllerType, tabId?: number) {
    if (!singleton) {
        console.log("Creating devtools controller", type);
        singleton = new DevtoolsController(isContentScript === true, type || "remote", tabId);
    }
    return singleton;
}



