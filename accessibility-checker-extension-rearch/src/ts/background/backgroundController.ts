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

import { getDevtoolsController } from "../devtools/devtoolsController";
import { IArchiveDefinition, IMessage, IReport, IRuleset, ISettings } from "../interfaces/interfaces";
import { CommonMessaging } from "../messaging/commonMessaging";
import { Controller, eControllerType, ListenerType } from "../messaging/controller";
import Config from "../util/config";
import EngineCache from "./util/engineCache";

export type TabChangeType = {
    tabId: number
    changeInfo: chrome.tabs.TabChangeInfo
    tab: chrome.tabs.Tab
}

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
        return this.hook("getTabId", null, async () => {
            return senderTabId!;
        });
    }

    /**
     * Get the rulesets for the currently loaded engine
     */
    public async getRulesets(senderTabId: number) : Promise<IRuleset[]> {
        return this.hook("getRulesets", senderTabId, async () => {
            await this.initTab(senderTabId!);
            let retVal : IRuleset[] = await new Promise((resolve, reject) => {
                myExecuteScript({
                    target: { tabId: senderTabId!, frameIds: [0] },
                    func: () => {
                        let checker = new (<any>window).aceIBMa.Checker();
                        return checker.rulesets;
                    }
                }, function (res: any) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    resolve(res[0].result);
                })
            });
            return retVal;
        });
    }

    public async requestScan(senderTabId: number) {
        return this.hook("requestScan", senderTabId, async () => {
            await this.initTab(senderTabId!);
            // We want this to execute after the message returns
            (async () => {
                let settings = await this.getSettings();
                let report : IReport = await new Promise((resolve, reject) => {
                    myExecuteScript({
                        target: { tabId: senderTabId!, frameIds: [0] },
                        args: [
                            settings
                        ],
                        func: (settings: ISettings) => {
                            let checker = new (<any>window).aceIBMa.Checker();    
                            return checker.check(window.document, [settings.selected_ruleset.id, "EXTENSIONS"]).then((report: IReport) => {
                                try {
                                    if (report) {
                                        let passResults = report.results.filter((result) => {
                                            return result.value[1] === "PASS" && result.value[0] !== "INFORMATION";
                                        })
                                        let passXpaths : string[] = passResults.map((result) => result.path.dom);
                            
                                        report.passUniqueElements = Array.from(new Set(passXpaths));
                            
                                        report.results = report.results.filter((issue) => issue.value[1] !== "PASS" || issue.value[0] === "INFORMATION");
                                        for (let result of report.results) {
                                            let engineHelp = checker.engine.getHelp(result.ruleId, result.reasonId, settings.selected_archive.id);
                                            let version = settings.selected_archive.version || "latest";
                                            if (process.env.engineEndpoint && process.env.engineEndpoint.includes("localhost")) {
                                                engineHelp = engineHelp.replace(/able.ibm.com/,"localhost:9445");
                                            } else {
                                                engineHelp = engineHelp.replace(/https\:\/\/able\.ibm\.com\/rules\/archives\/[^/]*\/doc\//, `https://unpkg.com/accessibility-checker-engine@${version}/help/`);
                                                if (engineHelp.includes("//able.ibm.com/")) {
                                                    engineHelp = engineHelp.replace(/https\:\/\/able.ibm.com\/rules\/tools\/help\//, `https://unpkg.com/accessibility-checker-engine@${version}/help/en-US/`)+".html";
                                                }
                                            }
                                            let minIssue = {
                                                message: result.message,
                                                snippet: result.snippet,
                                                value: result.value,
                                                reasonId: result.reasonId,
                                                ruleId: result.ruleId,
                                                messageArgs: result.messageArgs
                                            };
                                            result.help = `${engineHelp}#${encodeURIComponent(JSON.stringify(minIssue))}`
                                        }
                                    }
                                    return report;
                                } catch (err) {
                                    console.error(err);
                                    return null;
                                }
                            });
                        }
                    }, function (res: any) {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
                        }
                        resolve(res[0].result);
                    })
                });
                getDevtoolsController("remote", senderTabId).setReport(report);
            })();
            return {};
        });
    }
    
    /**
     * Used by the tab controller to initialize the tab when the first scan is performmed on that tab
     * @param tabId 
     * @returns 
     */
    public async initTab(tabId: number) {
        return this.hook("initTab", tabId, async () => {
            let settings = await this.getSettings();
            let archiveId = settings.selected_archive.id;
            // Determine if we've ever loaded any engine
            await new Promise((resolve, reject) => {
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
        });
    }

    public async addTabChangeListener(listener: ListenerType<TabChangeType>) {
        this.addEventListener(listener, `BG_onTabUpdate`);
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
                "BG_getRulesets": async (msgBody) => self.getRulesets(msgBody.content),
                "BG_requestScan": async (msgBody) => self.requestScan(msgBody.content),
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

            // Extra
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

                self.fireEvent<TabChangeType>("BG_onTabUpdate", {
                    tabId, changeInfo, tab
                })
            });

            CommonMessaging.initRelays();
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

let singleton : BackgroundController | null = null;
export function getBGController(type?: eControllerType) {
    if (!singleton) {
        singleton = new BackgroundController(type || "remote");
    }
    return singleton;
}



