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
import Config from "./config";

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
    public static archives : IArchiveDefinition[] = [];
    public static engines : {
        [archiveId: string] : string
    } = {}

    public static clearCache() {
        EngineCache.archives = [];
        EngineCache.engines = {};
    }

    public static async getArchives() {
        if (EngineCache.archives.length === 0) {
            if (Config.engineEndpoint?.includes("localhost")) {
                EngineCache.archives = <IArchiveDefinition[]>await Fetch.json(Config.engineEndpoint+"/archives.json");
            } else {
                EngineCache.archives = <IArchiveDefinition[]>await Fetch.json("https://cdn.jsdelivr.net/npm/accessibility-checker-engine@next/archives.json");
            }
        }

        // console.log('---EngineCache.EngineCache----', EngineCache);
        return EngineCache.archives;
    }

    public static async getEngine(archiveId: string) : Promise<string> {
        if (archiveId in EngineCache.engines) {
            return EngineCache.engines[archiveId];
        } else {
            let archiveDefs = await this.getArchives();
            for (const archiveDef of archiveDefs) {
                if (archiveDef.id === archiveId) {
                    if (Config.engineEndpoint?.includes("localhost")) {
                        let engineURL = `${Config.engineEndpoint}${archiveDef.path}/js/ace.js`;
                        return EngineCache.engines[archiveId] = <string>await Fetch.content(engineURL);
                    } else {
                        let engineURL = `https://cdn.jsdelivr.net/npm/accessibility-checker-engine@${archiveDef.version}/ace.js`;
                        return EngineCache.engines[archiveId] = <string>await Fetch.content(engineURL);
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