import { IIssue, IReport } from "../interfaces/interfaces";

export class UtilKCM {
    public static processIssues(report: IReport) {
        let tabbable: IIssue[] = [];
        let tabbableErrors: IIssue[] = [];
        report?.results.map((result: IIssue) => {
            if (result.ruleId === "detector_tabbable") {
                // there will always be at least one tab
                tabbable?.push(result);
            } else if (result.value[1] !== "PASS" && 
                // 14 Keyboard Mode Rules
                // 2.1.1 Keyboard
                (result.ruleId === "HAAC_Application_Role_Text" ||
                result.ruleId === "HAAC_Audio_Video_Triggers" ||
                result.ruleId === "Rpt_Aria_InvalidTabindexForActivedescendant" ||
                result.ruleId === "Rpt_Aria_MissingFocusableChild" ||
                result.ruleId === "Rpt_Aria_MissingKeyboardHandler" ||
                result.ruleId === "RPT_Elem_EventMouseAndKey" ||
                // 2.4.3 Focus Order
                result.ruleId === "IBMA_Focus_MultiTab" ||
                result.ruleId === "IBMA_Focus_Tabbable" ||
                result.ruleId === "element_tabbable_role_valid" ||
                // 2.4.7 Focus Visible
                // result.ruleId === "RPT_Style_HinderFocus1" ||
                result.ruleId === "WCAG20_Script_FocusBlurs" ||
                result.ruleId === "element_tabbable_visible" ||
                // 3.2.1 On Focus
                result.ruleId === "WCAG20_Select_NoChangeAction" ||
                // 4.1.2 Name, Role, Value
                result.ruleId === "Rpt_Aria_ValidRole")) {
                tabbableErrors?.push(result);
            }
        });
        if (tabbable !== null) {
            tabbable.sort((a: any, b: any) => b.apiArgs[0].tabindex - a.apiArgs[0].tabindex);
        }
        let count = 1;
        for (const item of tabbable) {
            item.apiArgs[0].tabOrder = count++;
        }
        return {
            tabbable, tabbableErrors
        }
    }
}