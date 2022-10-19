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
    import OptionMessaging from "../util/optionMessaging";
    
    let metrics = new ACMetricsLogger("ac-extension");
    
    function myExecuteScript(
        params: any, 
        pCB?: (any) | undefined): void
    {
        if (chrome && chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript(params, pCB);
        } else {
            if (params.func) {
                chrome.tabs.executeScript(
                    params.target.tabId as number,
                    { 
                        code: `(${params.func.toString()})()`,
                        frameId: params.target.frameIds[0],
                        matchAboutBlank: true
                    },
                    (res) => {
                        if (!res) {
                            pCB && pCB(res);
                        } else {
                            pCB && pCB(res.map(item => ({ result: item })));
                        }
                    })
            } else {
                chrome.tabs.executeScript(
                    params.target.tabId as number,
                    { 
                        file: params.files[0],
                        frameId: params.target.frameIds[0],
                        matchAboutBlank: true
                    },
                    (res) => {
                        if (params.files[0].includes("ace.js")) {
                            chrome.tabs.executeScript(
                                params.target.tabId as number,
                                { 
                                    code: `window.aceIBMa = ace`,
                                    frameId: params.target.frameIds[0],
                                    matchAboutBlank: true
                                },
                                (res) => {
                                    if (!res) {
                                        pCB && pCB(res);
                                    } else {
                                        pCB && pCB(res.map(item => ({ result: item })));
                                    }
                                })
                        } else {
                            pCB && pCB(res.map(item => ({ result: item })));
                        }
                    })
            }
        }
    }
    
    async function initTab(tabId: number, archiveId: string) {
        // Determine if we've ever loaded any engine
        let isLoaded = await new Promise((resolve, reject) => {
            myExecuteScript({
                target: { tabId: tabId, frameIds: [0] },
                func: () => {
                    (window as any).aceIBMaTemp =  (window as any).ace;
                    return(typeof (window as any).aceIBMa);
                }
            }, function (res: any) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve(res[0].result !== "undefined");
            })
        });

        if (!chrome && !chrome.scripting) {
            await new Promise((resolve, reject) => {
                myExecuteScript({
                    target: { tabId: tabId, frameIds: [0] },
                    func: () => {
                        ((window as any).aceIBMa = (window as any).ace);
                        (window as any).ace = (window as any).aceIBMaTemp;
                    }
                }, function (res: any) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    resolve(res);
                })
            });
        }
    
        // Switch to the appropriate engine for this archiveId
        let engineFile = await EngineCache.getEngine(archiveId);
        await new Promise((resolve, reject) => {
            myExecuteScript({
                target: { tabId: tabId, frameIds: [0] },
                files: [engineFile]
            }, function (res: any) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve(res);
            });
        });

        if (chrome && chrome.scripting) {
            await new Promise((resolve, reject) => {
                myExecuteScript({
                    target: { tabId: tabId, frameIds: [0] },
                    func: () => {
                        ((window as any).aceIBMa = (window as any).ace);
                        (window as any).ace = (window as any).aceIBMaTemp;
                    }
                }, function (res: any) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    resolve(res);
                })
            });
        }
        
    
        // Initialize the listeners once
        if (!isLoaded) {
            await new Promise((resolve, reject) => {
                myExecuteScript({
                    target: { tabId: tabId, frameIds: [0] },
                    files: ["/tabListeners.js"]
                }, function (_res: any) {
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
            await BackgroundMessaging.sendToPanel("DAP_SCAN_COMPLETE", message);
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
                    myExecuteScript({
                        target: { tabId: tab.id, frameIds: [0] },
                        func: () => (typeof (window as any).aceIBMa)
                    }, function (res: any) {
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
                // console.log("result.OPTIONS.selected_archive = ",(typeof(result.OPTIONS.selected_archive)));
                if (result.OPTIONS && (typeof(result.OPTIONS.selected_archive)) !== "undefined" && (typeof(result.OPTIONS.selected_archive)) !== null) {
                    archiveId = result.OPTIONS.selected_archive.id;
                } else {
                    archiveId = "latest";
                }
                await initTab(message.tabId, archiveId);
                try {
                    myExecuteScript({
                        target: { tabId: message.tabId, frameIds: [0] },
                        func: () => (new (window as any).aceIBMa.Checker().rulesets)
                    }, function (res: any) {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
                        } else {
                            resolve(res[0].result);
                        }
                    })
                } catch (err) {
                    reject(err);
                }
            })
        });
    });
    
    BackgroundMessaging.addListener("OPTIONS", async (message: any) => {
        return await OptionMessaging.optionMessageHandling(message);
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
    
    BackgroundMessaging.addListener("DRAW_TABS_TO_BACKGROUND", async (message: any) => {
        
        await BackgroundMessaging.sendToTab(message.tabId,
            "DRAW_TABS_TO_CONTEXT_SCRIPTS", 
            { tabId: message.tabId, tabURL: message.tabURL, tabStopsResults: message.tabStopsResults, 
                tabStopsErrors: message.tabStopsErrors, tabStopLines: message.tabStopLines,
                tabStopOutlines: message.tabStopOutlines, tabStopAlerts: message.tabStopAlerts,
                tabStopFirstTime: message.tabStopFirstTime,
            });
        return true;
    });
    
    BackgroundMessaging.addListener("HIGHLIGHT_TABSTOP_TO_BACKGROUND", async (message: any) => {
        await BackgroundMessaging.sendToTab(message.tabId, "HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS", { tabId: message.tabId, tabURL: message.tabURL, tabStopId: message.tabStopId});
    
        return true;
    });
    
    BackgroundMessaging.addListener("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
        // console.log("BackgroundMessaging.addListener DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS")
        // console.log("BackgroundMessaging.sendToTab DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS START");
        await BackgroundMessaging.sendToTab(message.tabId, "DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", { tabId: message.tabId, tabURL: message.tabURL });
        // console.log("BackgroundMessaging.sendToTab DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS START");
        return true;
    });
    
    BackgroundMessaging.addListener("TABSTOP_XPATH_ONCLICK", async (message: any) => {
        // console.log("Message TABSTOP_XPATH_ONCLICK received in background, xpath: "+ message.xpath);
        // console.log("BackgroundMessaging.sendToPanel TABSTOP_XPATH_ONCLICK");
        await BackgroundMessaging.sendToPanel("TABSTOP_XPATH_ONCLICK", {
            xpath: message.xpath,
            circleNumber: message.circleNumber
        });
    
        return true;
    });