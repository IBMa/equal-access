const request = require("request");
async function archiveList() {
    let ruleArchiveSet = await new Promise((resolve, reject) => {
        request.get(`https://cdn.jsdelivr.net/npm/accessibility-checker-engine@next/archives.json`, (err, response, body) => {
            err && reject(err);
            !err && resolve(JSON.parse(body));
        });
    });
    let archiveInfo = {
        "latest":[]
    }
    console.log();
    console.log("Archive [Archive Id]");
    console.log("  - Policy [Policy Id]:");
    console.log("-----------------------");
    console.log();
    for (const archive of ruleArchiveSet) {
        if (archive.sunset || archive.hidden) continue;
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
archiveList();