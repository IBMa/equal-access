const { existsSync } = require("fs");
const path = require("path");
var ace = require("../../../dist/ace-node");
var expect = require("chai").expect;

describe("Help Files", () => {
    const checker = new ace.Checker();
    for (const ruleId in checker.engine.helpMap) {
        const helpInfo = checker.engine.helpMap[ruleId];
        it("exists for rule "+ruleId, () => {
            for (const reasonId in helpInfo) {
                const helpFile = helpInfo[reasonId];
                const bExists = existsSync(path.join(__dirname, "..", "..", "..", "dist", "help", helpFile));
                expect(bExists).to.equal(true);
            }
        });
    }
});