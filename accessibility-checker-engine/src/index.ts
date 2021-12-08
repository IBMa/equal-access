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

import { Context } from "./v2/common/Context"
// import { Simulator } from "./v2/simulator"
import { Checker } from "./v2/checker"
import { ARIAMapper } from "./v2/aria/ARIAMapper";
import { Config } from "./v2/config/Config";
import { DOMWalker } from "./v2/dom/DOMWalker";

String.prototype.startsWith = String.prototype.startsWith || function (str) {
    return this.indexOf(str) === 0;
}
String.prototype.includes = String.prototype.includes || function (str) {
    return this.indexOf(str) !== -1;
}
Array.prototype.includes = Array.prototype.includes || function (str) {
    return this.indexOf(str) !== -1;
}
/*
function simDemo(timeout?: number) {
    if (!timeout) timeout = 0;
    setTimeout(function() {
        let sim = new Simulator();
        let s = sim.renderItem(document.documentElement);
        console.group("--- Item View ---");
        console.log(s);
        console.groupEnd();
        console.group("--- Link View ---");
        s = sim.renderLink(document.documentElement);
        console.log(s);
        console.groupEnd();
    }, timeout);
}
*/
function checkDemo(timeout?: number) {
    if (!timeout) timeout = 0;
    let checker = new Checker();
    setTimeout(function() {
        checker.check(document.documentElement, ["IBM_Accessibility", "IBM_Design"])
        .then(function(report) {
            console.log(report);
            const vals = {
                "FAIL": 0,
                "POTENTIAL": 1,
                "MANUAL": 2,
                "PASS": 3
            }
            for (let idx=0; idx<report.results.length; ++idx) {
                if (report.results[idx].value[1] === "PASS") {
                    report.results.splice(idx--,1);
                }
            }
            report.results.sort((a,b) => {
                if (a.category != b.category) {
                    return a.category.localeCompare(b.category);
                }
                if (a.path["aria"] === b.path["aria"]) {
                    return vals[a.value[1]]-vals[b.value[1]];
                }
                return a.path["aria"].localeCompare(b.path["aria"]);
            })
            let lastPath = null;
            let category = null;
            for (const result of report.results) {
                if (category !== result.category) {
                    if (category !== null) {
                        console.groupEnd();
                        console.groupEnd();
                        lastPath = null;
                    }
                    category = result.category;
                    console.group(result.category)
                }
                if (result.path["aria"] != lastPath) {
                    if (lastPath !== null) {
                        console.groupEnd();
                    }
                    lastPath = result.path["aria"];
                    if (lastPath === "") {
                        console.group("page");
                    } else {
                        console.group(lastPath);
                    }
                }
                console.log(result.value, result.message);
            }
            console.groupEnd();
            console.groupEnd();
        });
    }, timeout);
}

async function getTabbable(timeout?: number) {
    if (!timeout) timeout = 0;
    return await new Promise((resolve, reject) => {
        let checker = new Checker();
        setTimeout(async function() {
            let report = await checker.check(document.documentElement, ["IBM_Accessibility", "IBM_Design"])
            let tabbable = report.results.filter(rule => rule.ruleId === "detector_tabbable");
            tabbable.sort((a,b) => b.apiArgs[0].tabindex-a.apiArgs[0].tabindex);
            resolve(tabbable);
        },timeout);
    
    })
}
export { Checker, Context, ARIAMapper, checkDemo, Config/*, simDemo*/, DOMWalker, getTabbable };