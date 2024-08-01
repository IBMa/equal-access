/******************************************************************************
     Copyright:: 2024- IBM, Inc

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

const { exec } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
    
function myExec(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                console.error(stderr);
                return;
            }
            resolve(stdout);
        });    
    });
}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const now = new Date();
const paddedDate = (""+now.getDate()).padStart(2,'0');
const monthStr = monthNames[now.getMonth()];
const archiveDir = `${now.getFullYear()}.${(""+(now.getMonth()+1)).padStart(2,'0')}.${paddedDate}`;
const archiveId = `${paddedDate}${monthStr}${now.getFullYear()}`;
(async () => {
    // Ensure latest
    await myExec("git pull");
    // **Install**: In `accessibility-checker-engine` and `rule-server` run `npm install`
    await myExec("pushd accessibility-checker-engine && npm install && popd");
    await myExec("pushd rule-server && npm install && popd");
    // **Build**: Delete `rule-server/dist`. In `rule-server`, `npm run build`
    await myExec("pushd rule-server && npx shx rm -rf ./dist && npm run build && popd");
    // **Deploy**: The new archive will be found in `rule-server/dist/static/archives/preview`. Copy and rename `preview` to the archive directory (e.g., `rule-server/src/static/archives/yyyy.mm.dd`)
    await myExec(`npx shx rm -rf rule-server/src/static/archives/${archiveDir}`);
    await myExec(`npx shx mv rule-server/dist/static/archives/preview rule-server/src/static/archives/${archiveDir}`);
    // **Metadata**: Add an entry to `rule-server/src/static/archives.json`. See other entries for examples. Ensure that you move the `latest` property to the new archive.
    const archives = JSON.parse(readFileSync("rule-server/src/static/archives.json"));
    let existArchiveIdx = archives.findIndex(archive => archive.id === archiveId);
    if (existArchiveIdx !== -1) {
        archives.splice(existArchiveIdx, 1);
    }
    let lastVersion = archives[1].version.split(".");
    lastVersion[lastVersion.length-1] = parseInt(lastVersion[lastVersion.length-1])+1;
    archives.splice(1, 0, {
        "id": `${paddedDate}${monthStr}${now.getFullYear()}`,
        "name": `${paddedDate} ${monthStr} ${now.getFullYear()} Deployment (IBM 7.2, 7.3)`,
        "version": lastVersion.join("."),
        "path": `/archives/${archiveDir}`
    })
    writeFileSync("rule-server/src/static/archives.json", JSON.stringify(archives, null, 4));
})();