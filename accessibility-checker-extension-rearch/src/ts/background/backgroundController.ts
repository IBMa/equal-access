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

import { eMessageSrcDst, IMessage, ISettings } from "../interfaces/interfaces";
import { BackgroundMessaging } from "../messaging/backgroundMessaging";
import { PanelMessaging } from "../messaging/panelMessaging";
import { TabMessaging } from "../messaging/tabMessaging";
import Config from "../util/config";
import EngineCache from "./util/engineCache";

type eMessageId = "BG_getSettings" | "BG_setSettings";

class BackgroundController {
    src;

    private async hook<InT, OutT> (
        msgName: eMessageId, 
        msgBody: InT | null, 
        func: (msgBody: InT | null) => Promise<OutT>
    ) : Promise<OutT> {
        if (this.src === "background") {
            return func(msgBody);
        } else if (this.src === "panel") {
            let retVal = await PanelMessaging.send({
                type: msgName,
                dest: "background",
                content: msgBody
            })
            return retVal;
        } else {
            return TabMessaging.send({
                type: msgName,
                dest: "background",
                content: msgBody
            })
        }
    }

    private async hookListener<InT, OutT>(
        msgName: eMessageId,
        func: (msgBody: InT | null) => Promise<OutT>
    ) {
        BackgroundMessaging.addListener(msgName, (message: IMessage) => {
            return func(message.content);
        })
    }

    constructor(src: eMessageSrcDst) {
        this.src = src;
        let myThis = this;
        if (src === "background") {
            // One listener per function
            this.hookListener("BG_getSettings", () => {
                return this.getSettings();
            })
            this.hookListener("BG_setSettings", async (settings: ISettings | null) => {
                let updSettings = await myThis.validateSettings(settings || undefined);
                return this.setSettings(updSettings);
            })
            BackgroundMessaging.initRelays();
        }
    }

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

let singleton : BackgroundController;

export function getBGController(src: eMessageSrcDst) {
    if (!singleton) {
        singleton = new BackgroundController(src);
    }
    return singleton;
}



