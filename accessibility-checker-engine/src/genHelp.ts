import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { Rule } from "./v4/api/IRule";

//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const rules = require("./v4/rules");

function myExec(cmd: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });    
    });
}

(async () => {
    await myExec(`shx rm -rf ${path.join(__dirname, '..', 'dist', 'help')}`);
    try {
        await myExec(`shx mkdir ${path.join(__dirname, '..', 'dist')}`);
    } catch (err) {}
    await myExec(`shx cp -r ${path.join(__dirname, 'v4', 'help')} ${path.join(__dirname, '..', 'dist', 'help')}`);

    for (const ruleId in rules) {
        const rule : Rule = rules[ruleId];
        for (const locale in rule.help) {
            for (const reasonId in rule.help[locale]) {
                let helpFile = readFileSync(path.join(__dirname, 'v4', 'help', locale, rule.help[locale][reasonId])).toString();
                helpFile = helpFile.replace(/\<head\>/, `<head>
    <title>${rule.id} - Accessibility Checker Help</title>
    <script>
        RULE_MESSAGES = ${JSON.stringify(rule.messages)};
        RULE_ID = "${rule.id}"
    </script>
`)
                writeFileSync(path.join(__dirname, '..', 'dist', 'help', locale, rule.help[locale][reasonId]), helpFile);
            }
        }
    }
})();