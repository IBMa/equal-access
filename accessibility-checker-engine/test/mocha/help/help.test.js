const { existsSync } = require("fs");
const path = require("path");
var ace = require("../../../dist/ace-node");
var expect = require("chai").expect;

describe("Help Files", () => {
    const checker = new ace.Checker();
    for (const ruleId in checker.engine.helpMap) {
        const helpInfo = checker.engine.helpMap[ruleId];
        const rule = checker.engine.ruleMap[ruleId];
        it("exists for rule "+ruleId, () => {
            for (const reasonId in helpInfo) {
                const helpFile = helpInfo[reasonId];
                const bExists = existsSync(path.join(__dirname, "..", "..", "..", "dist", "help", helpFile));
                expect(bExists).to.equal(true);
            }
        });
        it("Help codes are correct for rule "+ruleId, () => {
            let runF = rule.run.toString();
            let r = /Rule(Pass|Fail|Potential|Manual)\)\(["']([^"']+)["']/g;
            let m;
            while (m = r.exec(runF)) {
                let reasonId = m[2];
                expect(typeof helpInfo[reasonId]).to.equal("string", reasonId);
            }
        });
        it("Message codes are correct for rule "+ruleId, () => {
            let runF = rule.run.toString();
            let r = /Rule(Pass|Fail|Potential|Manual)\)\(["']([^"']+)["']/g;
            let m;
            while (m = r.exec(runF)) {
                let reasonId = m[2];
                expect(typeof checker.engine.getMessage(ruleId, reasonId, ["1", "2", "3", "4"])).to.equal("string", reasonId);
            }
        });
    }
});