import { readFileSync, writeFileSync, existsSync } from "fs";
import { IAbstractAPI } from "../../src/api-ext/IAbstractAPI.js";
import { IConfigInternal, eRuleLevel } from "../../src/config/IConfig.js";
import { ReporterManager } from "../../src/report/ReporterManager.js";
import { join } from "path";
import { IBaselineReport, IBaselineResult } from "../../src/engine/IReport.js";

const expected = {
    "report1.json": readFileSync(join(__dirname, "report1_expected.json")).toString(),
    "report2.json": readFileSync(join(__dirname, "report2_expected.json")).toString(),
    "report1.html": readFileSync(join(__dirname, "report1_expected.html")).toString(),
    "report2.html": readFileSync(join(__dirname, "report2_expected.html")).toString(),
    "summary_2023-06-16T17:42:28.053Z.json": readFileSync(join(__dirname, "summary_expected.json")).toString(),
    "results_2023-06-16T17:42:28.053Z.csv": readFileSync(join(__dirname, "results_expected.csv")).toString()
}

const written = {}
class FakeFS implements IAbstractAPI {
    writeFileSync(filePath: string, data: string | Buffer) {
        if (!expected[filePath]) {
            writeFileSync(join("test", "report", filePath), data);
        }
        // writeFileSync("test_out.json", data);
        written[filePath] = true;
        expect(data).toEqual(expected[filePath]);
    }
    prepFileSync(filePath: string) : string {
        return join("test", "report", filePath);
    }
    log(...args: any[]) {
        console.log(...args)
    }
    info(...args: any[]) {
        console.info(...args)
    }
    error(...args: any[]) {
        console.error(...args)
    }
    loadBaseline(label: string) : IBaselineReport | undefined {
        let filename = join(__dirname, `${label}_baseline.json`);
        if (existsSync(filename)) {
            return JSON.parse(readFileSync(filename).toString());
        }
        return null;
    }
    getChecker() {}
}

const myConfig : IConfigInternal = {
    ignoreHTTPSErrors: true,
    perfMetrics: false,
    reportLevels: [
        eRuleLevel.violation,
        eRuleLevel.potentialviolation,
        eRuleLevel.recommendation,
        eRuleLevel.potentialrecommendation,
        eRuleLevel.manual,
        eRuleLevel.pass
    ],
    failLevels: [
        eRuleLevel.violation,
        eRuleLevel.potentialviolation
    ],
    outputFormat: ["json", "html", "csv"],
    toolID: "accessibility-checker-v3.0.0",
    scanID: "37224196-4754-478e-a01e-93ca3116a327",
    ruleArchiveLabel: "Preview Rules (preview)",
    policies: [ "IBM_Accessibility" ],
    label: [
        "Chrome",
        "master",
        "IBMa-Node-TeSt"
    ],
    engineMode: "DEFAULT"
}

const rulesets = [
    
]

test("Generates reports", async () => {
    let rulesets = JSON.parse(readFileSync(join(__dirname, "rulesets.json")).toString());
    ReporterManager.initialize(myConfig, new FakeFS(), rulesets);

    const report1 = JSON.parse(readFileSync(join(__dirname, "report1.json")).toString());
    const baseline1 = JSON.parse(readFileSync(join(__dirname, "report1_baseline.json")).toString());
    const url = "data:text/html;charset=utf-8,%3C!--%0A%20%20%20%20%20%2F******************************************************************************%0A%20%20%20%20%20Copyright%3A%3A%202020-%20IBM%2C%20Inc%0A%0A%20%20%20%20Licensed%20under%20the%20Apache%20License%2C%20Version%202.0%20(the%20%22License%22)%3B%0A%20%20%20%20you%20may%20not%20use%20this%20file%20except%20in%20compliance%20with%20the%20License.%0A%20%20%20%20You%20may%20obtain%20a%20copy%20of%20the%20License%20at%0A%0A%20%20%20%20http%3A%2F%2Fwww.apache.org%2Flicenses%2FLICENSE-2.0%0A%0A%20%20%20%20Unless%20required%20by%20applicable%20law%20or%20agreed%20to%20in%20writing%2C%20software%0A%20%20%20%20distributed%20under%20the%20License%20is%20distributed%20on%20an%20%22AS%20IS%22%20BASIS%2C%0A%20%20%20%20WITHOUT%20WARRANTIES%20OR%20CONDITIONS%20OF%20ANY%20KIND%2C%20either%20express%20or%20implied.%0A%20%20%20%20See%20the%20License%20for%20the%20specific%20language%20governing%20permissions%20and%0A%20%20%20%20limitations%20under%20the%20License.%0A%20%20*****************************************************************************%2F%0A%0A--%3E%20%20%20%20%0A%20%20%20%20%3Chtml%3E%0A%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22fail.png%22%20id%3D%22ace%22%3E%0A%20%20%20%20%3C%2Fbody%3E%0A%3C%2Fhtml%3E";
    ReporterManager.addEngineReport("", 1686937348053, url, "My Report 1", "report1", report1);

    const report2 = JSON.parse(readFileSync(join(__dirname, "report2.json")).toString());
    const baseline2 = JSON.parse(readFileSync(join(__dirname, "report2_baseline.json")).toString());
    const url2 = "data:text/html;charset=utf-8,%3C!--%0A%20%20%20%20%20%2F******************************************************************************%0A%20%20%20%20%20Copyright%3A%3A%202020-%20IBM%2C%20Inc%0A%0A%20%20%20%20Licensed%20under%20the%20Apache%20License%2C%20Version%202.0%20(the%20%22License%22)%3B%0A%20%20%20%20you%20may%20not%20use%20this%20file%20except%20in%20compliance%20with%20the%20License.%0A%20%20%20%20You%20may%20obtain%20a%20copy%20of%20the%20License%20at%0A%0A%20%20%20%20http%3A%2F%2Fwww.apache.org%2Flicenses%2FLICENSE-2.0%0A%0A%20%20%20%20Unless%20required%20by%20applicable%20law%20or%20agreed%20to%20in%20writing%2C%20software%0A%20%20%20%20distributed%20under%20the%20License%20is%20distributed%20on%20an%20%22AS%20IS%22%20BASIS%2C%0A%20%20%20%20WITHOUT%20WARRANTIES%20OR%20CONDITIONS%20OF%20ANY%20KIND%2C%20either%20express%20or%20implied.%0A%20%20%20%20See%20the%20License%20for%20the%20specific%20language%20governing%20permissions%20and%0A%20%20%20%20limitations%20under%20the%20License.%0A%20%20*****************************************************************************%2F%0A%0A--%3E%20%0A%3Chtml%3E%0A%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22fail.png%22%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22fail.png%22%3E%0A%20%20%20%20%3C%2Fbody%3E%0A%3C%2Fhtml%3E";
    ReporterManager.addEngineReport("", 1686937348153, url2, "My Report 2", "report2", report2);

    await ReporterManager.generateSummaries(1686945479477);
    for (const key in expected) {
        expect(key in written).toBeTruthy();
    }
})