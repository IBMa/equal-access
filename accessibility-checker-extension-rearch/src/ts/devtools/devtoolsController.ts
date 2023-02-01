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

import { IMessage, IReport } from "../interfaces/interfaces";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import { getTabId } from "../util/tabId";

let sessionStorage : {
    storeReports: boolean
    storedReports: IReport[]
    lastReport: IReport | null
    lastElement: HTMLElement | null
} | null = null;

export class DevtoolsController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Get stored reports
     */
    public async getStoredReports() : Promise<any[]> {
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
            if (!report) return;
            if (sessionStorage?.storeReports) {
                sessionStorage.storedReports.push(report);
            }
            sessionStorage!.lastReport = report;
            setTimeout(() => {
                this.fireEvent("DT_onReport", report);
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
        this.addEventListener(listener, `${this.evtPrefix}_onReport`);//, listener.callbackTabId);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    constructor(type: eControllerType, tabId?: number) {
        super(type, { type: "devTools", tabId: (tabId || getTabId())!}, "DT");
        if (type === "local") {
            sessionStorage = {
                storeReports: false,
                storedReports: [],
                lastReport: null,
                lastElement: null
            };

            // One listener per function
            this.hookListener([
                "DT_getStoredReports",
                "DT_clearReports",
                "DT_setStoreReports",
                "DT_setReport",
                "DT_getReport"
            ], async (msgBody: IMessage<any>, _senderTabId?: number) => {
                if (msgBody.type === "DT_getStoredReports") {
                    return this.getStoredReports();
                } else if (msgBody.type === "DT_clearReports") {
                    return this.clearReports();
                } else if (msgBody.type === "DT_setStoreReports") {
                    return this.setStoreReports(!!msgBody.content);
                } else if (msgBody.type === "DT_setReport") {
                    return this.setReport(msgBody.content);
                } else if (msgBody.type === "DT_getReport") {
                    return this.getReport();
                }
                return null;
            });

            chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, _tab) => {
                this.fireEvent("DT_onReport", null);
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



