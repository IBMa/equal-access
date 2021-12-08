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

import TabMessaging from "../util/tabMessaging";

TabMessaging.addListener("DAP_CACHED_TAB", async (message: any) => {
    try {
        let c = (window as any).aceReportCache;
        TabMessaging.sendToBackground("DAP_SCAN_TAB_COMPLETE", { tabId: message.tabId, tabURL: message.tabURL, report: c.report, archiveId: c.archiveId, policyId: c.policyId, origin: message.origin });
    } catch (e) {
        console.error(e);
    }
    return true;
});


TabMessaging.addListener("DAP_SCAN_TAB", async (message: any) => {
    try {
        let checker = new (<any>window).ace.Checker();

        console.info(`Accessibility Checker - Scanning with archive ${message.archiveId} and policy ${message.policyId}`);

        (window as any).aceReportCache = {
            archiveId: message.archiveId,
            policyId: message.policyId,
            report: await checker.check(window.document, [message.policyId, "EXTENSIONS"])
        };

        TabMessaging.sendToBackground("DAP_SCAN_TAB_COMPLETE", { 
            tabId: message.tabId,
            tabURL: message.tabURL,
            report: (window as any).aceReportCache.report,
            archiveId: message.archiveId,
            policyId: message.policyId,
            origin: message.origin
        });
    } catch (err) {
        console.error(err);
    }
    return true;
});
