#!/usr/bin/env node

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
 
const aChecker = require("../index.js")
const fs = require('fs');
const readline = require('readline');
const path = require("path");

let validCLParams = [
    "inputFile"
]

let splitCLParams = [
    "policies",
    "failLevels",
    "reportLevels",
    "outputFormat",
    "label"
]

function processCommandLine(ACConfig) {
    const [, , ...args] = process.argv;
    let lastArg = null;
    let lastFlag = null;
    for (let arg of args) {
        if (arg.match(/^--.*$/)) {
            lastFlag = arg.substring(2);
            lastArg = null;
        } else if (lastFlag) {
            if (lastFlag in ACConfig || validCLParams.includes(lastFlag)) {
                if (splitCLParams.includes(lastFlag)) {
                    arg = arg.split(",");
                }
                ACConfig[lastFlag] = arg;
            }
            lastFlag = lastArg = null;
        } else {
            lastArg = arg;
        }
    }
    if (lastArg) {
        ACConfig.inputFile = lastArg;
    }
}

async function getFiles(dir) {
    let retVal = [];
    for (let f of fs.readdirSync(dir)) {
        if (f[0] === ".") {
            // skip
        } else {
            f = path.join(dir, f);
            if (fs.lstatSync(f).isDirectory()) {
                retVal = retVal.concat(await getFiles(f));
            } else if (f.endsWith(".htm") || f.endsWith(".html")) {
                retVal.push(f);
            }
        }
    }
    return retVal;
}

async function showHelp(config) {
    let lastArg = config.inputFile;
    if (!lastArg || lastArg === "help") {
        console.log(
`Usage: achecker [flags] [command / file / directory / URL]

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
    } else if (lastArg === "archives") {
        let archiveInfo = {
            "latest":[]
        }
        console.log();
        console.log("Archive [Archive Id]");
        console.log("  - Policy [Policy Id]:");
        console.log("-----------------------");
        console.log();
        for (const archive of config.ruleArchiveSet) {
            if (archive.sunset) continue;
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
}

async function getInputFileList() {
    let config = await aChecker.getConfig();
    processCommandLine(config);
    await showHelp(config);
    let inputs = [];
    let filename = config.inputFile.trim();
    if (filename.endsWith(".txt")) {
        const fileStream = fs.createReadStream(filename);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.

        for await (const line of rl) {
            if (line.trim().length === 0) {

            } else if (line.startsWith(path.sep)) {
                inputs.push(line);
            } else if (line.match(/[a-z]{4,5}:\/\//)) {
                inputs.push(line);
            } else {
                inputs.push(path.join(path.dirname(filename), line));
            }
        }
    } else {
        inputs = [filename];
    }

    let retVal = [];
    for (const input of inputs) {
        let isDirectory = false;
        try {
            isDirectory = fs.lstatSync(input).isDirectory();
        } catch (e) {}
        if (isDirectory) {
            retVal = retVal.concat(await getFiles(input));
        } else {
            retVal.push(input);
        }
    }
    return retVal;
}

// Prepare the configuration
getInputFileList().then(async (rptInputFiles) => {
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
            } catch (e) {}
            if (isFile) {
                result = await aChecker.getCompliance("file://"+f, f.replace(/^file:\/\//,"").replace(/[:?&=]/g,"_"));
            } else {
                result = await aChecker.getCompliance(f, f.replace(/^(https?:|file:)\/\//,"").replace(/[:?&=]/g,"_"));
            }
            if (result) {
                if (aChecker.assertCompliance(result.report) === 0) {
                    console.log("Passed:", f);
                } else {
                    failures.push({
                        file: f,
                        report: result.report
                    });
                    console.log("Failed:", f);
                }
            } else {
                ++errors;
                console.log("Error:", f);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await aChecker.close();
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
    console.log(`${rptInputFiles.length-failures.length-errors} of ${rptInputFiles.length} passed.`)
    //await aChecker.close();
    if (failures.length !== 0 || errors !== 0) {
        process.exitCode = 1;
    }
})
