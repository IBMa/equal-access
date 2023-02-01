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

import { getBGController } from "../background/backgroundController";
import { DevtoolsController, getDevtoolsController } from "../devtools/devtoolsController";
import { IMessage, IReport } from "../interfaces/interfaces";
import { Controller, eControllerType } from "../messaging/controller";
import { getTabId } from "../util/tabId";

let bgController = getBGController();

class TabController extends Controller {
    devtoolsController?: DevtoolsController;
    ///////////////////////////////////////////////////////////////////////////
    ///// PUBLIC API //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    constructor(type: eControllerType, tabId?: number) {
        super(type, { type: "contentScript", tabId: (tabId || getTabId())! }, "TAB");
        if (type === "local") {
            let self = this;
            this.devtoolsController = getDevtoolsController("remote", tabId);

            const listenMsgs : { 
                [ msgId: string ] : (msgBody: IMessage<any>, senderTabId?: number) => Promise<any>
            } = {
                "TAB_requestScan": async () => self.requestScan()
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

    public async requestScan() {
        if (this.type === "remote") {
            await bgController.initTab((this.ctrlDest as any).tabId);
        }
        return this.hook("requestScan", null, async () => {
            // We want this to execute after the message returns
            (async () => {
                let settings = await bgController.getSettings();
                let checker = new (<any>window).aceIBMa.Checker();    
                let report : IReport = await checker.check(window.document, [settings.selected_ruleset.id, "EXTENSIONS"]);
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
                this.devtoolsController!.setReport(report);
            })();
            return {};
        });
    }
}

let singleton : TabController;
export async function getTabController(type?: eControllerType) {
    if (!singleton) {
        let tabId = getTabId();
        if (!tabId) {
            tabId = await bgController.getTabId();
        }
        singleton = new TabController(type || "remote", tabId);
    }
    return singleton;
}



