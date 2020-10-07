const aChecker = require("accessibility-checker");

let sampNames = [
    "sample1",
    "sample2",
    "sample3",
    "sample1",
    "sample2",
    "sample3",
    "sample1",
    "sample2",
    "sample3",
    "sample1",
    "sample2",
    "sample3"
];

(async () => {
    let idx=0;
    try {
        let results = await Promise.all(
            sampNames.map(label => {
                return aChecker.getCompliance(`file://${process.cwd()}/${label}.html`, label+(++idx));
            })
        );
        aChecker.close();
        console.log(`Done scanning ${results.length} pages`);
        // console.log(process._getActiveHandles());
    } catch (err) {
        console.error(err);
    }
})()
