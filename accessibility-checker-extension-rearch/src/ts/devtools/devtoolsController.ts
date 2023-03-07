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
import { IIssue, IMessage, IReport } from "../interfaces/interfaces";
import { CommonMessaging } from "../messaging/commonMessaging";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import { getTabId } from "../util/tabId";

let sessionStorage : {
    storeReports: boolean
    storedReports: IReport[]
    lastReport: IReport | null
    lastElementPath: string | null
    lastIssue: IIssue | null
    viewState: ViewState
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
    public async getStoredReports() : Promise<IReport[]> {
        let retVal = await this.hook("getStoredReports", null, async () => {
            return sessionStorage!.storedReports;
        });
        return retVal;
    }

    /**
     * Clear stored reports
     */
    public async clearReports() : Promise<void> {
        return this.hook("clearReports", null, async () => {
            sessionStorage!.storedReports = [];
        });
    }

    /**
     * Set report storing
     */
    public async setStoreReports(bVal: boolean) : Promise<void> {
        return this.hook("setStoreReports", bVal, async () => {
            sessionStorage!.storeReports = bVal;
        });
    }

    /**
     * Set report storing
     */
    public async setReport(report: IReport | null) : Promise<void> {
        return this.hook("setReport", report, async () => {
            if (report && sessionStorage?.storeReports) {
                sessionStorage.storedReports.push(report);
            }
            sessionStorage!.lastReport = report;
            setTimeout(() => {
                this.fireEvent("DT_onReport", report);
                this.setSelectedElementPath("/html[1]");
            }, 0);
        });
    }

    /**
     * Set report storing
     */
    public async getReport() : Promise<IReport | null> {
        return this.hook("getReport", null, async () => {
            if (!sessionStorage) return null;
            return sessionStorage?.lastReport;
        });
    }

    public async addReportListener(listener: ListenerType<IReport>) {
        this.addEventListener(listener, `DT_onReport`);//, listener.callbackTabId);
    }

    public async removeReportListener(listener: ListenerType<IReport>) {
        this.removeEventListener(listener, `DT_onReport`);
    }

    /**
     * Set report storing
     */
    public async setViewState(newState: ViewState | null) : Promise<void> {
        return this.hook("setViewState", newState, async () => {
            if (newState) {
                sessionStorage!.viewState = newState;
                setTimeout(() => {
                    this.fireEvent("DT_onViewState", newState);
                }, 0);
            }
        });
    }

    /**
     * Set report storing
     */
    public async getViewState() : Promise<ViewState | null> {
        return this.hook("getViewState", null, async () => {
            if (!sessionStorage) return null;
            return sessionStorage?.viewState;
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
                sessionStorage!.lastIssue = issue;
                setTimeout(() => {
                    this.fireEvent("DT_onSelectedIssue", issue);
                    this.setSelectedElementPath(issue.path.dom);
                }, 0);
            }
        });
    }

    /**
     * Set report storing
     */
    public async getSelectedIssue() : Promise<IIssue | null> {
        return this.hook("getSelectedIssue", null, async () => {
            if (!sessionStorage) return null;
            return sessionStorage?.lastIssue;
        });
    }
    
    public async addSelectedIssueListener(listener: ListenerType<IIssue>) {
        this.addEventListener(listener, `DT_onSelectedIssue`);
    }

    /**
     * Set selected issue
     */
    public async setSelectedElementPath(path: string | null) : Promise<void> {
        return this.hook("setSelectedElementPath", path, async () => {
            if (path) {
                sessionStorage!.lastElementPath = path;
                setTimeout(() => {
                    this.fireEvent("DT_onSelectedElementPath", path);
                }, 0);
            }
        });
    }

    /**
     * Set report storing
     */
    public async getSelectedElementPath() : Promise<string | null> {
        return this.hook("getSelectedElementPath", null, async () => {
            if (!sessionStorage) return null;
            return sessionStorage?.lastElementPath;
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
                    var elementRect = element.getBoundingClientRect();
                    var absoluteElementTop = elementRect.top + window.pageYOffset;
                    var middle = absoluteElementTop - 100;
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
        chrome.devtools.inspectedWindow.eval(script, function (result, isException) {
            if (isException) {
                console.error(isException);
            }
            if (!result) {
                console.log('Could not select element, it may have moved');
            } else {
                if (focusElem) {
                    setTimeout(() => {
                        focusElem?.focus();
                    }, 100);
                }
            }
        });
    }
    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    constructor(type: eControllerType, tabId?: number) {
        super(type, { type: "devTools", tabId: (tabId || getTabId())!}, "DT");
        if (type === "local") {
            let self = this;
            sessionStorage = {
                storeReports: false,
                storedReports: [],
                lastReport: null,
                lastElementPath: null,
                lastIssue: null,
                viewState: {
                    kcm: false
                }
            };

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            } = {
                "DT_getStoredReports": async () => self.getStoredReports(),
                "DT_clearReports": async () => self.clearReports(),
                "DT_setStoreReports": async (msgBody) => self.setStoreReports(!!msgBody.content),
                "DT_setReport": async (msgBody) => self.setReport(msgBody.content),
                "DT_getReport": async () => self.getReport(),
                "DT_getViewState": async () => self.getViewState(),
                "DT_setViewState": async (msgBody) => self.setViewState(msgBody.content),
                "DT_setSelectedIssue": async (msgBody) => self.setSelectedIssue(msgBody.content),
                "DT_getSelectedIssue": async () => self.getSelectedIssue(),
                "DT_setSelectedElementPath": async (msgBody) => self.setSelectedElementPath(msgBody.content),
                "DT_getSelectedElementPath": async () => self.getSelectedElementPath(),
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
            bgController.addTabChangeListener( {
                callbackDest: { 
                    type: "extension"
                },
                callback: async (content: TabChangeType) => {
                    if (this.ctrlDest.type === "devTools" && content.tabId === this.ctrlDest.tabId) {
                        this.setReport(null);
                    }
                },
            });

            ["DT_onViewState", "DT_onReport", "DT_onSelectedElementPath", "DT_onSelectedIssue"].forEach((s: string) => {
                this.addEventListener(
                    { 
                        callback: async (content: any) => {
                            try {
                                CommonMessaging.send({
                                    type: s,
                                    dest: {
                                        type: "contentScript",
                                        tabId: (this.ctrlDest as any).tabId
                                    },
                                    content: content
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        },
                        callbackDest: {
                            type: "contentScript",
                            tabId: (this.ctrlDest as any).tabId
                        }
                    },
                    s
                );
            });
            CommonMessaging.send({
                type: "DT_onViewState",
                dest: {
                    type: "contentScript",
                    tabId: (this.ctrlDest as any).tabId
                },
                content: sessionStorage.viewState
            });
            CommonMessaging.send({
                type: "DT_onReport",
                dest: {
                    type: "contentScript",
                    tabId: (this.ctrlDest as any).tabId
                },
                content: null
            });
        }
    }
}

let singleton : DevtoolsController;
export function getDevtoolsController(type?: eControllerType, tabId?: number) {
    if (!singleton) {
        singleton = new DevtoolsController(type || "remote", tabId);
    }
    return singleton;
}



