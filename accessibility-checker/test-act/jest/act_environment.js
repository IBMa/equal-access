// ACT_environment.js
const NodeEnvironment = require('jest-environment-node');
const request = require("request");
process.env.NODE_TLS_REJECT_UNAUTHORIZED="0"

// Aligned rules
let ruleMapping = require("./act_aligned.json");

// ruleMapping = {
// }
/*
// Rule defect
    "ff89c9": [{ // https://github.ibm.com/ibma/e2e/issues/3142
        ruleId: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
        reasonIds: ["Fail_1"]
    }],
/*
// Testcase defect
    "6a7281": [ // https://github.com/act-rules/act-rules.github.io/issues/1617
        {
            ruleId: "Rpt_Aria_ValidPropertyValue",
            reasonIds: ["Fail_1"]
        },
        {
            ruleId: "Rpt_Aria_ValidIdRef",
            reasonIds: ["Fail_1"]
        }
    ],
    "2ee8b8": [{ // https://github.com/act-rules/act-rules.github.io/issues/1618
        ruleId: "WCAG21_Label_Accessible",
        reasonIds: ["Fail_1"]
    }]
*/
/*
// Missing published
let ruleMapping = {
    // Viewport
    "b4f0c3": [{
        ruleId: "",
        reasonIds: []
    }]
}
*/
/*
// Aligned on failures
let ruleMapping = {
    "bf051a": [{
         ruleId: "WCAG20_Elem_Lang_Valid",
         reasonIds: ["Fail_1", "Fail_3"]
    }],
    "5b7ae0": [{
        ruleId: "WCAG20_Html_HasLang",
      reasonIds: []
    }],
    "de46e4": [{
        ruleId: "WCAG20_Elem_Lang_Valid",
        reasonIds: ["Fail_1"]
    }],
    "674b10": [{
        ruleId: "Rpt_Aria_ValidRole",
        reasonIds: ["Fail_2"]
    }]
}
*/

/*
// Not evaluated
let ruleMapping = {
    "6cfa84": [{
        ruleId: "",
        reasonIds: []
    }],
    "a25f45": [{
        ruleId: "",
        reasonIds: []
    }],
    "b33eff": [{
        ruleId: "",
        reasonIds: []
    }],
    "80f0bf": [{
        ruleId: "",
        reasonIds: []
    }],
    "46ca7f": [{
        ruleId: "",
        reasonIds: []
    }],
    "307n5z": [{
        ruleId: "",
        reasonIds: []
    }],
    "ffd0e9": [{
        ruleId: "",
        reasonIds: []
    }],
    "fd3a94": [{
        ruleId: "",
        reasonIds: []
    }],
    "b20e66": [{
        ruleId: "",
        reasonIds: []
    }],
    "bc659a": [{
        ruleId: "",
        reasonIds: []
    }],
    "0ssw9k": [{
        ruleId: "",
        reasonIds: []
    }],
    "bc4a75": [{
        ruleId: "",
        reasonIds: []
    }],
    "e7aa44": [{
        ruleId: "",
        reasonIds: []
    }],
    "oj04fd": [{
        ruleId: "",
        reasonIds: []
    }],
    "de46e4": [{
        ruleId: "WCAG20_Elem_Lang_Valid",
        reasonIds: []
    }],
    "4b1c6c": [{
        ruleId: "",
        reasonIds: []
    }],
    "24afc2": [{
        ruleId: "",
        reasonIds: []
    }],
    "78fd32": [{
        ruleId: "",
        reasonIds: []
    }],
    "674b10": [{
        ruleId: "Rpt_Aria_ValidRole",
        reasonIds: ["Fail_1"]
    }],
    "d0f69e": [{
        ruleId: "",
        reasonIds: []
    }],
    "eac66b": [{
        ruleId: "",
        reasonIds: []
    }],
    "9e45ec": [{
        ruleId: "",
        reasonIds: []
    }],
    "2eb176": [{
        ruleId: "RPT_Media_AudioTrigger",
        reasonIds: []
    }],
    "afb423": [{
        ruleId: "",
        reasonIds: []
    }],
    "4c31df": [{
        ruleId: "",
        reasonIds: []
    }],
    "aaa1bf": [{
        ruleId: "",
        reasonIds: []
    }],
    "3e12e1": [{
        ruleId: "",
        reasonIds: []
    }],
    "cf77f2": [{
        ruleId: "",
        reasonIds: []
    }],
    "9eb3f6": [{
        ruleId: "",
        reasonIds: []
    }],
    "b40fd1": [{
        ruleId: "",
        reasonIds: []
    }],
    "ye5d6e": [{
        ruleId: "",
        reasonIds: []
    }],
    "047fe0": [{
        ruleId: "",
        reasonIds: []
    }],
    "36b590": [{
        ruleId: "",
        reasonIds: []
    }],
    "akn7bn": [{
        ruleId: "",
        reasonIds: []
    }],
    "5effbb": [{
        ruleId: "",
        reasonIds: []
    }],
    "09o5cg": [{
        ruleId: "",
        reasonIds: []
    }],
    "afw4f7": [{
        ruleId: "",
        reasonIds: []
    }],
    "f51b46": [{
        ruleId: "RPT_Media_VideoObjectTrigger",
        reasonIds: []
    }],
    "ab4d13": [{
        ruleId: "",
        reasonIds: []
    }],
    "c5a4ea": [{
        ruleId: "",
        reasonIds: []
    }],
    "1ea59c": [{
        ruleId: "RPT_Media_VideoReferenceTrigger",
        reasonIds: []
    }],
    "f196ce": [{
        ruleId: "HAAC_Video_HasNoTrack",
        reasonIds: []
    }],
    "1ec09b": [{
        ruleId: "",
        reasonIds: []
    }],
    "1a02b0": [{
        ruleId: "",
        reasonIds: []
    }],
    "c3232f": [{
        ruleId: "",
        reasonIds: []
    }],
    "d7ba54": [{
        ruleId: "",
        reasonIds: []
    }],
    "ac7dc6": [{
        ruleId: "",
        reasonIds: []
    }],
    "ee13b5": [{
        ruleId: "",
        reasonIds: []
    }],
    "fd26cf": [{
        ruleId: "",
        reasonIds: []
    }],
    "59br37": [{
        ruleId: "",
        reasonIds: []
    }],
    "e6952f": [{
        ruleId: "",
        reasonIds: []
    }],
    "9bd38c": [{
        ruleId: "",
        reasonIds: []
    }],
    "7677a9": [{
        ruleId: "",
        reasonIds: []
    }],
    "c249d5": [{
        ruleId: "",
        reasonIds: []
    }],
    "80af7b": [{
        ruleId: "",
        reasonIds: []
    }],
    "ebe86a": [{
        ruleId: "",
        reasonIds: []
    }],
    "a1b64e": [{
        ruleId: "",
        reasonIds: []
    }],
    "cc0f0a": [{
        ruleId: "Valerie_Label_HasContent",
        reasonIds: []
    }],
    "b49b2e": [{
        ruleId: "RPT_Header_HasContent",
        reasonIds: []
    }],
    "off6ek": [{
        ruleId: "",
        reasonIds: []
    }],
    "0va7u6": [{
        ruleId: "",
        reasonIds: []
    }],
    "ucwvc8": [{
        ruleId: "",
        reasonIds: []
    }],
    "c4a8a4": [{
        ruleId: "RPT_Title_Valid",
        reasonIds: []
    }],
    "qt1vmo": [{
        ruleId: "",
        reasonIds: []
    }],
    "e88epe": [{
        ruleId: "",
        reasonIds: []
    }],
    "aizyf1": [{
        ruleId: "",
        reasonIds: []
    }],
    "bisz58": [{
        ruleId: "",
        reasonIds: []
    }],
    "ffbc54": [{
        ruleId: "",
        reasonIds: []
    }],
    "efbfc7": [{
        ruleId: "",
        reasonIds: []
    }]
}
*/
let ruleTestInfo = {}

class ACTEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        await super.setup();

        this.global.ruleTestInfo = await new Promise((resolve, reject) => {
            request("https://act-rules.github.io/testcases.json", (err, req, body) => {
                let testcaseInfo = JSON.parse(body);
                for (const testcase of testcaseInfo.testcases) {
                    if (testcase.ruleId in ruleMapping) {
                        ruleTestInfo[testcase.ruleId] = ruleTestInfo[testcase.ruleId] || {
                            aceRules : ruleMapping[testcase.ruleId],
                            label: testcase.ruleName,
                            testcases: []
                        }
                        ruleTestInfo[testcase.ruleId].testcases.push(testcase);
                    }
                }
                resolve(ruleTestInfo);
            });
        })
    }

    async teardown() {
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = ACTEnvironment;