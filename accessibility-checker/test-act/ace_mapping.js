// Aligned rules
let ace_mapping = require("./act_aligned.json");
// ace_mapping = {}

ace_mapping["bc4a75"] = [{
    ruleId: "Rpt_Aria_RequiredChildren_Native_Host_Sematics",
    reasonIds: [ "Potential_1" ]
}]
// Rule defect
ace_mapping["ff89c9"] = [{ // https://github.ibm.com/ibma/e2e/issues/3142
    ruleId: "Rpt_Aria_RequiredParent_Native_Host_Sematics",
    reasonIds: ["Fail_1"]
}];

// Testcase defect
ace_mapping["6a7281"] = [ // https://github.com/act-rules/act-rules.github.io/issues/1617
    {
        ruleId: "Rpt_Aria_ValidPropertyValue",
        reasonIds: ["Fail_1"]
    },
    {
        ruleId: "Rpt_Aria_ValidIdRef",
        reasonIds: ["Fail_1"]
    }
];

ace_mapping["2ee8b8"] = [{ // https://github.com/act-rules/act-rules.github.io/issues/1618
    ruleId: "WCAG21_Label_Accessible",
    reasonIds: ["Fail_1"]
}]

// Missing published
// Viewport
ace_mapping["b4f0c3"] = []

// Aligned on failures
ace_mapping["5b7ae0"] = [// Mismatch because they only check when both are specified
    {
        ruleId: "WCAG20_Html_HasLang",
        reasonIds: ["Fail_4"],
        treatAsPass: ["Fail_5"]
    }
];
ace_mapping["de46e4"] = [{ // Mismatch because they don't check the html element in the same rule
    ruleId: "WCAG20_Elem_Lang_Valid",
    reasonIds: ["Fail_1"],
    treatAsPass: ["Fail_2"]
}];
ace_mapping["674b10"] = [{ // One item passes that we flag as potential
    ruleId: "Rpt_Aria_ValidRole",
    reasonIds: ["Fail_1", "Fail_2"]
}]
ace_mapping["bisz58"] = [{ // Passes redirect, so can't test. Fail 1 we trigger potential
    "ruleId": "RPT_Meta_Refresh",
    "reasonIds": ["Potential_1"]
},
{
    "ruleId": "WCAG20_Meta_RedirectZero",
    "reasonIds": ["Fail_1"]
}]
ace_mapping["bc659a"] = [{ // Not clear the difference between this and bisz58
    "ruleId": "RPT_Meta_Refresh",
    "reasonIds": ["Potential_1"]
},
{
    "ruleId": "WCAG20_Meta_RedirectZero",
    "reasonIds": ["Fail_1"]
}]


// Not evaluated
ace_mapping["ffd0e9"] = []
ace_mapping["6cfa84"] = []
ace_mapping["a25f45"] = []
ace_mapping["b33eff"] = []
ace_mapping["80f0bf"] = []
ace_mapping["46ca7f"] = []
ace_mapping["307n5z"] = []
ace_mapping["fd3a94"] = []
ace_mapping["b20e66"] = []
ace_mapping["0ssw9k"] = []
ace_mapping["e7aa44"] = []
ace_mapping["oj04fd"] = []
ace_mapping["4b1c6c"] = []
ace_mapping["24afc2"] = []
ace_mapping["78fd32"] = []
ace_mapping["d0f69e"] = []
ace_mapping["eac66b"] = []
ace_mapping["9e45ec"] = []
ace_mapping["2eb176"] = []
ace_mapping["afb423"] = []
ace_mapping["4c31df"] = []
ace_mapping["aaa1bf"] = []
ace_mapping["3e12e1"] = []
ace_mapping["cf77f2"] = []
ace_mapping["b40fd1"] = []
ace_mapping["ye5d6e"] = []
ace_mapping["047fe0"] = []
ace_mapping["36b590"] = []
ace_mapping["akn7bn"] = []
ace_mapping["09o5cg"] = []
ace_mapping["afw4f7"] = []
ace_mapping["f51b46"] = []
ace_mapping["ab4d13"] = []
ace_mapping["c5a4ea"] = []
ace_mapping["1ea59c"] = []
ace_mapping["f196ce"] = []
ace_mapping["1ec09b"] = []
ace_mapping["1a02b0"] = []
ace_mapping["c3232f"] = []
ace_mapping["d7ba54"] = []
ace_mapping["ac7dc6"] = []
ace_mapping["ee13b5"] = []
ace_mapping["fd26cf"] = []
ace_mapping["59br37"] = []
ace_mapping["9bd38c"] = []
ace_mapping["7677a9"] = []
ace_mapping["c249d5"] = []
ace_mapping["80af7b"] = []
ace_mapping["ebe86a"] = []
ace_mapping["a1b64e"] = []
ace_mapping["off6ek"] = []
ace_mapping["0va7u6"] = []
ace_mapping["ucwvc8"] = []
ace_mapping["e88epe"] = []
ace_mapping["ffbc54"] = []
ace_mapping["efbfc7"] = []

// Manual Checks
ace_mapping["cc0f0a"] = []
ace_mapping["c4a8a4"] = []
ace_mapping["aizyf1"] = []
ace_mapping["qt1vmo"] = []
ace_mapping["b49b2e"] = []
ace_mapping["5effbb"] = []

// Pre-parse - can't check
ace_mapping["e6952f"] = []

module.exports = {
    ace_mapping
}