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

import { ISettings } from "../interfaces/interfaces";
import { Controller, eControllerType } from "../messaging/controller";
import Config from "../util/config";
import EngineCache from "./util/engineCache";

class BackgroundController extends Controller {
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Get settings for the extension
     */
    public async getSettings() : Promise<ISettings> {
        let myThis = this;
        let retVal = await this.hook("BG_getSettings", null, async () => {
            let retVal = await new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.get("OPTIONS", async function (result: any) {
                    resolve(await myThis.validateSettings(result.OPTIONS));
                });
            })
            return retVal;
        });
        return retVal;
    }

    /**
     * Set settings for the extension
     */
    public async setSettings(settings: ISettings) : Promise<ISettings> {
        return this.hook("BG_setSettings", null, async () => {
            return new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.set({ "OPTIONS": settings }, async function () {
                    resolve(settings!);
                });
            })
        });
    }

    public async initTab(tabId: number) {
        console.log("initTab", tabId);
        return this.hook("BG_initTab", tabId, async () => {
            console.log("INITTAB");
            let settings = await this.getSettings();
            let archiveId = settings.selected_archive.id;
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
        });
    }

    constructor(type: eControllerType) {
        super(type);
        let myThis = this;
        if (type === "local") {
            // One listener per function
            this.hookListener("BG_getSettings", () => {
                return this.getSettings();
            })
            this.hookListener("BG_setSettings", async (settings: ISettings | null) => {
                let updSettings = await myThis.validateSettings(settings || undefined);
                return this.setSettings(updSettings);
            })
            this.hookListener("BG_initTab", async (tabId: number | null) => {
                console.log("BG_initTab", tabId);
                if (tabId !== null) {
                    return this.initTab(tabId);
                }
            })
            // CommonMessaging.initRelays();
        }
    }

    /**
     * Calculate the default settings if settings don't exist
     */
    private async validateSettings(inSettings?: ISettings) : Promise<ISettings> {
        let settings : any = inSettings || {};
        if (!("tabStopLines" in settings)) { (settings as ISettings).tabStopLines = true; }
        if (!("tabStopOutlines" in settings)) { (settings as ISettings).tabStopLines = false; }
        if (!("tabStopAlerts" in settings)) { (settings as ISettings).tabStopLines = true; }
        if (!("tabStopFirstTime" in settings)) { (settings as ISettings).tabStopLines = true; }

        // Determine which archive we're scanning with
        let archiveId = Config.defaultArchiveId + "";
        const archives = await EngineCache.getArchives();
        const validArchive = ((id: string) => id && archives.some(archive => archive.id === id));

        if (!validArchive(archiveId)) archiveId = "latest";
        if (settings && settings.selected_archive && validArchive(settings.selected_archive.id)) {
            archiveId = settings.selected_archive.id;
        }
        settings.selected_archive = archives.filter(archive => archive.id === archiveId)[0];

        // Determine which policy we're scanning with
        let policyId: string = settings.selected_archive.policies[0].id;
        const validPolicy = ((id: string) => id && settings.selected_archive.policies.some((policy : any) => policy.id === id));
        if (!validPolicy(policyId)) policyId = "IBM_Accessibility";
        if (settings && settings.selected_ruleset && validPolicy(settings.selected_ruleset.id)) {
            policyId = settings.selected_ruleset.id;
        }
        settings.selected_ruleset = {
            id: policyId
        }
        return settings as ISettings;
    }
}

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

let singleton : BackgroundController;
export function getBGController(type?: eControllerType) {
    if (!singleton) {
        console.log("Creating background controller")
        singleton = new BackgroundController(type || "remote");
    }
    return singleton;
}



