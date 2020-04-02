const request = require("request");
async function archiveList() {
    let archiveInfo = {
        "latest":[]
    }
    let ruleArchiveSet = await new Promise((resolve, reject) => {
        request.get(`https://able.ibm.com/rules/archives.json`, (err, response, body) => {
            err && reject(err);
            !err && resolve(JSON.parse(body));
        });
    });
    for (const archive of ruleArchiveSet) {
        if (archive.sunset) continue;
        archiveInfo[archive.id] = await new Promise((resolve, reject) => {
            let url = `able.ibm.com/rules/${archive.path}/js/ace.js`;
            url = "https://"+url.replace("//","/");
            request.get(`https://able.ibm.com/rules/${archive.path}/js/ace-node.js`, (err, response, body) => {
                err && reject(err);
                if (!err) {
                    let policies = [];
                    try {
                        let ace = eval(body);
                        let checker = new ace.Checker();
                        for (const rs of checker.rulesetIds) {
                            policies.push(rs);
                        }
                        policies.sort();
                    } catch (e) {}
                    resolve(policies);
                }
            })
        })
        if (archive.latest) {
            archiveInfo['latest'] = archiveInfo[archive.id];
        }
    }
    console.log("Archive / Policy ids:");
    for (const archiveId in archiveInfo) {
        console.log("Archive:",archiveId);
        for (const policyId of archiveInfo[archiveId]) {
            console.log("  -",policyId);
        }
    }
    process.exit(-1);
}
archiveList();