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

import BackgroundMessaging from "../util/backgroundMessaging";
import EngineCache from './helper/engineCache';
import Config from "./helper/config";
import { ACMetricsLogger } from "../util/ACMetricsLogger";

let metrics = new ACMetricsLogger("ac-extension");

async function initTab(tabId: number, archiveId: string) {
    // Determine if we've ever loaded any engine
    let isLoaded = await new Promise((resolve, reject) => {
        chrome.tabs.executeScript(tabId, {
            code: "typeof window.ace",
            frameId: 0,
            matchAboutBlank: true
        }, function (res) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(res[0] !== "undefined");
        })
    });

    // Switch to the appropriate engine for this archiveId
    let engineCode = await EngineCache.getEngine(archiveId);
    await new Promise((resolve, reject) => {
        chrome.tabs.executeScript(tabId, {
            code: engineCode + "window.ace = ace;",
            frameId: 0,
            matchAboutBlank: true
        }, function (_res) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(_res);
        })
    });

    // Initialize the listeners once
    if (!isLoaded) {
        await new Promise((resolve, reject) => {
            chrome.tabs.executeScript(tabId, {
                file: "tabListeners.js",
                frameId: 0,
                matchAboutBlank: true
            }, function (_res) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve(_res);
            });
        });
    }
}

BackgroundMessaging.addListener("DAP_CACHED", async (message: any) => {
    await BackgroundMessaging.sendToTab(message.tabId, "DAP_CACHED_TAB", { tabId: message.tabId, tabURL: message.tabURL, origin: message.origin });
    return true;
});

BackgroundMessaging.addListener("DAP_SCAN", async (message: any) => {
    chrome.storage.local.get("OPTIONS", async function (result: any) {
        try {
            // Determine which archive we're scanning with
            let archiveId = Config.defaultArchiveId + "";
            const archives = await EngineCache.getArchives();
            const validArchive = ((id: string) => id && archives.some(archive => archive.id === id));

            if (!validArchive(archiveId)) archiveId = "latest";
            if (result.OPTIONS && result.OPTIONS.selected_archive && validArchive(result.OPTIONS.selected_archive.id)) {
                archiveId = result.OPTIONS.selected_archive.id;
            }
            let selectedArchive = archives.filter(archive => archive.id === archiveId)[0];

            // Determine which policy we're scanning with
            let policyId: string = selectedArchive.policies[0].id;
            const validPolicy = ((id: string) => id && selectedArchive.policies.some(policy => policy.id === id));
            if (!validPolicy(policyId)) policyId = "IBM_Accessibility";
            if (result.OPTIONS && result.OPTIONS.selected_ruleset && validPolicy(result.OPTIONS.selected_ruleset.id)) {
                policyId = result.OPTIONS.selected_ruleset.id;
            }

            await initTab(message.tabId, archiveId);
            await BackgroundMessaging.sendToTab(message.tabId, "DAP_SCAN_TAB", {
                tabId: message.tabId,
                tabURL: message.tabURL,
                archiveId: archiveId,
                archiveVersion: selectedArchive.version,
                policyId: policyId,
                origin: message.origin
            });
        } catch (err) {
            console.error(err);
        }
        return true;
    });
});

BackgroundMessaging.addListener("DAP_SCAN_TAB_COMPLETE", async (message: any) => {
    try {
        BackgroundMessaging.sendToPanel("DAP_SCAN_COMPLETE", message);
        if (message.archiveId && message.policyId) {
            let browser = (navigator.userAgent.match(/\) ([^)]*)$/) || ["", "Unknown"])[1];
            let totalTime = (message.report != undefined)? message.report.totalTime: message.totalTime;
            metrics.profileV2(totalTime, browser, message.policyId);
            metrics.sendLogsV2();
        }
    } catch (err) {
        console.error(err);
    }
    return true;
});

BackgroundMessaging.addListener("TAB_INFO", async (message: any) => {
    return await new Promise((resolve, _reject) => {
        chrome.tabs.get(message.tabId, async function (tab: any) {
            //chrome.tabs.get({ 'active': true, 'lastFocusedWindow': true }, async function (tabs) {
            let canScan = await new Promise((resolve, _reject) => {
                if (tab.id < 0) return resolve(false);
                chrome.tabs.executeScript(tab.id, {
                    code: "typeof window.ace",
                    frameId: 0,
                    matchAboutBlank: true
                }, function (res) {
                    resolve(!!res);
                })
            });
            tab.canScan = canScan;
            resolve(tab);
        });
    });
});

BackgroundMessaging.addListener("DAP_SCREENSHOT", async (_message: any) => { 
    return await new Promise((resolve, reject) => {
        //@ts-ignore
        chrome.tabs.captureVisibleTab(null, {}, function (image:string) {
            resolve(image);
            reject(new Error("Capture failed"));
        });
    });
});

BackgroundMessaging.addListener("DAP_Rulesets", async (message: any) => {
    return await new Promise((resolve, reject) => {

        chrome.storage.local.get("OPTIONS", async function (result: any) {
            let archiveId = Config.defaultArchiveId + "";

            if (result.OPTIONS) {
                archiveId = result.OPTIONS.selected_archive.id;
            } try {
                await initTab(message.tabId, archiveId);

                chrome.tabs.executeScript(message.tabId, {
                    code: "new window.ace.Checker().rulesets;",
                    frameId: 0,
                    matchAboutBlank: true
                }, function (res) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    resolve(res[0]);
                })
            } catch (err) {
                reject(err);
            }
        })
    });
});


// TODO: TAB: I broke this in making sure to not change all panels. Need to revisit
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    BackgroundMessaging.sendToPanel("TAB_UPDATED", {
        tabId: tabId,
        status: changeInfo && changeInfo.status,
        tabUrl: tab.url,
        tabTitle: tab.title
    });
});

