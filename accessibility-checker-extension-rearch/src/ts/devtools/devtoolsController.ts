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

import { IReport } from "../interfaces/interfaces";
import { Controller, eControllerType } from "../messaging/controller";

let sessionStorage : {
    storeReports: boolean
    storedReports: IReport[]
    lastReport: IReport | null
} | null = null;

class DevtoolsController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Get stored reports
     */
    public async getStoredReports() : Promise<any[]> {
        let retVal = await this.hook("DT_getStoredReports", null, async () => {
            return sessionStorage!.storedReports;
        });
        return retVal;
    }

    /**
     * Clear stored reports
     */
    public async clearReports() : Promise<void> {
        return this.hook("DT_clearReports", null, async () => {
            sessionStorage!.storedReports = [];
        });
    }

    /**
     * Set report storing
     */
    public async setStoreReports(bVal: boolean) : Promise<void> {
        return this.hook("DT_setStoreReports", bVal, async () => {
            sessionStorage!.storeReports = bVal;
        });
    }

    /**
     * Set report storing
     */
    public async setReport(report: IReport | null) : Promise<void> {
        return this.hook("DT_setReport", report, async () => {
            if (!report) return;
            if (sessionStorage?.storeReports) {
                sessionStorage.storedReports.push(report);
            }
            sessionStorage!.lastReport = report;
            console.log(report);
        });
    }

    constructor(type: eControllerType) {
        super(type);
        if (type === "local") {
            sessionStorage = {
                storeReports: false,
                storedReports: [],
                lastReport: null
            };

            // One listener per function
            this.hookListener("DT_getStoredReports", () => {
                return this.getStoredReports();
            })
            this.hookListener("DT_clearReports", async () => {
                return this.clearReports();
            })
            this.hookListener("DT_setStoreReports", async(bVal: boolean | null) => {
                return this.setStoreReports(!!bVal);
            })
            this.hookListener("DT_setReport", async(report: IReport | null) => {
                return this.setReport(report);
            })
        }
    }
}

let singleton : DevtoolsController;
export function getDevtoolsController(type?: eControllerType) {
    if (!singleton) {
        console.log("Creating devtools controller")
        singleton = new DevtoolsController(type || "remote");
    }
    return singleton;
}



