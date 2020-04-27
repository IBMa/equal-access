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
    TabMessaging.sendToBackground("DAP_SCAN_TAB_COMPLETE", { tabId: message.tabId, report: (window as any).report });
    return true;
});


TabMessaging.addListener("DAP_SCAN_TAB", async (message: any) => {
    let checker = new (<any>window).ace.Checker();

    console.info(`Accessibility Checker - Scanning with archive ${message.archiveId} and policy ${message.policyId}`);
    (window as any).report = await checker.check(window.document, [message.policyId]);
    TabMessaging.sendToBackground("DAP_SCAN_TAB_COMPLETE", { tabId: message.tabId, report: (window as any).report });
    return true;
});
