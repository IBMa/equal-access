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

import { IArchiveDefinition, IMessage, ISettings } from "../interfaces/interfaces";
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
        let retVal = (await this.hook("getSettings", null, async () => {
            let retVal = await new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.get("OPTIONS", async function (result: { OPTIONS?: ISettings}) {
                    let retSett = await myThis.validateSettings(result.OPTIONS);
                    resolve(retSett);
                });
            })
            return retVal;
        }))!;
        return retVal;
    }

    /**
     * Set settings for the extension
     */
    public async setSettings(settings: ISettings) : Promise<ISettings> {
        return this.hook("setSettings", settings, async () => {
            return new Promise<ISettings>((resolve, _reject) => {
                chrome.storage.local.set({ "OPTIONS": settings }, async function () {
                    resolve(settings!);
                });
            })
        });
    }

    /**
     * Get the archive definitions
     */
    public async getArchives() : Promise<IArchiveDefinition[]> {
        return this.hook("getArchives", null, async () => {
            return EngineCache.getArchives();
        });
    }

    /**
     * Get the tab id of the caller
     */
    public async getTabId(senderTabId?: number) : Promise<number> {
        return this.hook("getTabId", senderTabId, async () => {
            return senderTabId!;
        });
    }
    
    /**
     * Used by the tab controller to initialize the tab when the first scan is performmed on that tab
     * @param tabId 
     * @returns 
     */
    public async initTab(tabId: number) {
        Config.DEBUG && console.log("initTab", tabId);
        return this.hook("initTab", tabId, async () => {
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

    ///////////////////////////////////////////////////////////////////////////
    ///// PRIVATE API /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    constructor(type: eControllerType) {
        super(type, { type: "extension" }, "BG");
        if (type === "local") {
            let self = this;

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            }= {
                "BG_getSettings": async () => self.getSettings(),
                "BG_getArchives": async () => self.getArchives(),
                "BG_getTabId": async (_a, senderTabId) => self.getTabId(senderTabId),
                "BG_setSettings": async (msgBody) => {
                    let updSettings = await self.validateSettings(msgBody.content || undefined);
                    return self.setSettings(updSettings);
                },
                "BG_initTab": async (msgBody) => {
                    if (msgBody.content !== null) {
                        return self.initTab(msgBody.content);
                    }
                }
            }

            // Hook the above definitions
            this.hookListener(
                Object.keys(listenMsgs),
                async (msgBody: IMessage<any>, senderTabId?: number) => {
                    let f = listenMsgs[msgBody.type];
                    return f ? f(msgBody,senderTabId) : null;
                }
            )
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
        const validPolicy = ((id: string) => id && (settings as ISettings).selected_archive.rulesets.default.some((policy) => policy.id === id));
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
        Config.DEBUG && console.log("Creating background controller")
        singleton = new BackgroundController(type || "remote");
    }
    return singleton;
}



