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
 
import Fetch from "./fetch";

export interface IPolicyDefinition {
    id: string,
    name: string
}

export interface IArchiveDefinition {
    id: string,
    name: string,
    path: string,
    version: string,
    latest?: boolean,
    sunset?: boolean,
    policies: IPolicyDefinition[]
}

export default class EngineCache {
    public static async getArchives() {
        try {
            let archiveInfo = ((await chrome.storage.local.get(['archiveInfo'])) || {}).archiveInfo || { archives: [], ts: 0 };
            // If archive info is older than 30 minutes, or not there at all
            let archives : IArchiveDefinition[] = archiveInfo.archives;
            if (archives.length === 0 || !archiveInfo.ts || new Date().getTime()-new Date(archiveInfo.ts).getTime() >= 30*60*1000) {
                archives = <IArchiveDefinition[]>await Fetch.json(chrome.runtime.getURL("archives.json"));
            }
            await chrome.storage.local.set({ archiveInfo: { archives, ts: new Date().getTime() }});
            return archives;
        } catch (err) {
            console.error(err);
            return []
        }
    }

    public static async getEngine(archiveId: string) : Promise<string> {
        let engineInfo = ((await chrome.storage.local.get(['engineInfo'])) || {}).engineInfo || { engines: {}, ts: 0 };
        let engines = engineInfo.engines;
        if (archiveId in engines && new Date().getTime()-new Date(engineInfo.ts).getTime() >= 30*60*1000) {
            return engines[archiveId];
        } else {
            let archiveDefs = await this.getArchives();
            if (archiveId === "latest") {
                let latestVersion;
                for (const archiveDef of archiveDefs) {
                    if (archiveDef.id === "latest") {
                        latestVersion = archiveDef.version;
                        break;
                    }
                }
                for (const archiveDef of archiveDefs) {
                    if (archiveDef.id !== "latest" && archiveDef.version === latestVersion) {
                        let engineFile = `${archiveDef.path}/js/ace.js`;
                        engines[archiveId] = engineFile;
                        await chrome.storage.local.set({ engineInfo: { engines }, ts: new Date().getTime() });
                        return engineFile;
                    }
                }
            } else {
                for (const archiveDef of archiveDefs) {
                    if (archiveDef.id === archiveId) {
                        let engineFile = `${archiveDef.path}/js/ace.js`;
                        engines[archiveId] = engineFile;
                        await chrome.storage.local.set({ engineInfo: { engines }, ts: new Date().getTime() });
                        return engineFile;
                    }
                }
            }
        }
        return Promise.reject("Invalid Archive ID");
    }

    public static async getVersion(archiveId: string) : Promise<string> {
        let archiveDefs = await this.getArchives();
        for (const archiveDef of archiveDefs) {
            if (archiveDef.id === archiveId) {                
                return archiveDef.version;
            }
        }
        return Promise.reject("Invalid Archive ID");
    }
}