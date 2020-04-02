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

import { IEngine } from "../api/IEngine";
import { Engine } from "../common/Engine";
import { ARIAMapper } from "../aria/ARIAMapper";
import { StyleMapper } from "../style/StyleMapper";
import { simRules } from "./rules";
import { simNls } from "./nls";

export class Simulator {
    engine: IEngine;

    constructor() {
        let engine = this.engine = new Engine();
        engine.addMapper(new ARIAMapper());
        engine.addMapper(new StyleMapper());
        engine.addRules(simRules);
        engine.addNlsMap(simNls);
        engine.enableRules(null); 
    }

    async renderItem(node: Node, bEndTag?: boolean) : Promise<string> {
        bEndTag = !!bEndTag;
        let report = await this.engine.run(node, { "mode": "ITEM" });
        let s = "";
        for (const result of report.results) {
            s += result.message
                .replace(/^\s+(\S)/g,"$1") // remove leading whitespace if there's a character
                .replace(/ +/g, " ") // replace multiple spaces with a single
                .replace(/^ +$/g, "") // replace all spaces with nothing
                .replace(/[\n]{2,}/g,"\n"); // replace two or more newlines with a single
        }
        return s;
    }

    async renderLink(node: Node, bEndTag?: boolean) :Promise<string> {
        bEndTag = !!bEndTag;
        let report = await this.engine.run(node, { "mode": "LINK" });
        let s = "";
        for (const result of report.results) {
            s += result.message;
        }
        return s.replace(/ +/g, " ");
    }

    getEngine() : IEngine {
        return this.engine;
    }
}