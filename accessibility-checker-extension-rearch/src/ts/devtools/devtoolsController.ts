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
import { IMessage, IReport } from "../interfaces/interfaces";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import { getTabId } from "../util/tabId";

let sessionStorage : {
    storeReports: boolean
    storedReports: IReport[]
    lastReport: IReport | null
    lastElement: HTMLElement | null
} | null = null;

let bgController = getBGController();

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
                lastElement: null
            };

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            } = {
                "DT_getStoredReports": async () => self.getStoredReports(),
                "DT_clearReports": async () => self.clearReports(),
                "DT_setStoreReports": async (msgBody) => self.setStoreReports(!!msgBody.content),
                "DT_setReport": async (msgBody) => self.setReport(msgBody.content),
                "DT_getReport": async () => self.getReport()
            }

            // Hook the above definitions
            this.hookListener(
                Object.keys(listenMsgs),
                async (msgBody: IMessage<any>, senderTabId?: number) => {
                    let f = listenMsgs[msgBody.type];
                    return f ? f(msgBody,senderTabId) : null;
                }
            )

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



