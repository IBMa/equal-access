#!/usr/bin/env node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const aChecker = __importStar(require("../index.js"));
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const path = __importStar(require("path"));
let validCLParams = [
    "inputFile"
];
let splitCLParams = [
    "policies",
    "failLevels",
    "reportLevels",
    "outputFormat",
    "label"
];
function processCommandLine(ACConfig) {
    const [, , ...args] = process.argv;
    let lastArg = null;
    let lastFlag = null;
    for (let arg of args) {
        if (arg.match(/^--.*$/)) {
            lastFlag = arg.substring(2);
            lastArg = null;
        }
        else if (lastFlag) {
            if (lastFlag in ACConfig || validCLParams.includes(lastFlag)) {
                if (splitCLParams.includes(lastFlag)) {
                    arg = arg.split(",");
                }
                ACConfig[lastFlag] = arg;
            }
            lastFlag = lastArg = null;
        }
        else {
            lastArg = arg;
        }
    }
    if (lastArg) {
        ACConfig.inputFile = lastArg;
    }
}
function getFiles(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let retVal = [];
        for (let f of fs.readdirSync(dir)) {
            if (f[0] === ".") {
                // skip
            }
            else {
                f = path.join(dir, f);
                if (fs.lstatSync(f).isDirectory()) {
                    retVal = retVal.concat(yield getFiles(f));
                }
                else if (f.endsWith(".htm") || f.endsWith(".html")) {
                    retVal.push(f);
                }
            }
        }
        return retVal;
    });
}
function showHelp(config) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastArg = config.inputFile;
        if (!lastArg || lastArg === "help") {
            console.log(`Usage: achecker [flags] [command / file / directory / URL]

Commands:
    archives                : Display valid archive ids and policy ids

Flags:
    Flags can be set via .achecker.yml or aceconfig.js files. Specifying the flags here
    will override those options.

    --ruleArchive           : Archive id to use. Run "achecker archives" for valid ids
    --policies              : Comma separated list of policies. Run "achecker archives"
                                for valid ids
    --failLevels            : Comma separated list of levels that will indicate
                                a failure. Valid values: violation,
                                potentialviolation, recommendation,
                                potentialrecommendation, manual
    --reportLevels          : Comma separated list of levels that will be included
                                in reports. Valid values: violation,
                                potentialviolation, recommendation,
                                potentialrecommendation, manual, pass
    --outputFormat          : Comma separated list of output report formats.
                                Valid values: json, csv, xlsx, html, or disable
    --label                 : Comma separated list of labels to include in reports
    --outputFolder          : Folder to output results and reports
    --baselineFolder        : Folder that includes baseline files
`);
            process.exit(-1);
        }
        else if (lastArg === "archives") {
            let archiveInfo = {
                "latest": []
            };
            console.log();
            console.log("Archive [Archive Id]");
            console.log("  - Policy [Policy Id]:");
            console.log("-----------------------");
            console.log();
            for (const archive of config.ruleArchiveSet) {
                if (archive.sunset)
                    continue;
                console.log(`${archive.name} [${archive.id}]`);
                for (const policy of archive.policies) {
                    console.log(`  - ${policy.name} [${policy.id}]`);
                }
                archiveInfo[archive.id] = archive.policies;
                if (archive.latest) {
                    archiveInfo['latest'] = archiveInfo[archive.id];
                }
            }
            process.exit(-1);
        }
    });
}
function getInputFileList() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        let config = yield aChecker.getConfig();
        processCommandLine(config);
        yield showHelp(config);
        let inputs = [];
        let filename = config.inputFile.trim();
        if (filename.endsWith(".txt")) {
            const fileStream = fs.createReadStream(filename);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            try {
                // Note: we use the crlfDelay option to recognize all instances of CR LF
                // ('\r\n') in input.txt as a single line break.
                for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                    _c = rl_1_1.value;
                    _d = false;
                    const line = _c;
                    if (line.trim().length === 0) {
                    }
                    else if (line.startsWith(path.sep)) {
                        inputs.push(line);
                    }
                    else if (line.match(/[a-z]{4,5}:\/\//)) {
                        inputs.push(line);
                    }
                    else {
                        inputs.push(path.join(path.dirname(filename), line));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            inputs = [filename];
        }
        let retVal = [];
        for (const input of inputs) {
            let isDirectory = false;
            try {
                isDirectory = fs.lstatSync(input).isDirectory();
            }
            catch (e) { }
            if (isDirectory) {
                retVal = retVal.concat(yield getFiles(input));
            }
            else {
                retVal.push(input);
            }
        }
        return retVal;
    });
}
// Prepare the configuration
getInputFileList().then((rptInputFiles) => __awaiter(void 0, void 0, void 0, function* () {
    let idx = 0;
    let failures = [];
    let errors = 0;
    try {
        for (let f of rptInputFiles) {
            let result;
            let isFile = false;
            try {
                isFile = fs.lstatSync(f).isFile();
                f = path.resolve(f);
            }
            catch (e) { }
            if (isFile) {
                result = yield aChecker.getCompliance("file://" + f, f.replace(/^file:\/\//, "").replace(/[:?&=]/g, "_"));
            }
            else {
                result = yield aChecker.getCompliance(f, f.replace(/^(https?:|file:)\/\//, "").replace(/[:?&=]/g, "_"));
            }
            if (result) {
                if (aChecker.assertCompliance(result.report) === 0) {
                    console.log("Passed:", f);
                }
                else {
                    failures.push({
                        file: f,
                        report: result.report
                    });
                    console.log("Failed:", f);
                }
            }
            else {
                ++errors;
                console.log("Error:", f);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        yield aChecker.close();
    }
    if (failures.length > 0) {
        console.log();
        console.log("Failing scan details:");
        console.log();
        for (const fail of failures) {
            console.log(aChecker.stringifyResults(fail.report));
        }
    }
    console.log();
    console.log(`${rptInputFiles.length - failures.length - errors} of ${rptInputFiles.length} passed.`);
    //await aChecker.close();
    if (failures.length !== 0 || errors !== 0) {
        process.exitCode = 1;
    }
}));
//# sourceMappingURL=achecker.js.map