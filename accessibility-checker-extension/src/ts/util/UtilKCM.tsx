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
                result.ruleId === "application_content_accessible" ||

                result.ruleId === "HAAC_Audio_Video_Trigger" ||
                result.ruleId === "media_keyboard_controllable" ||

                result.ruleId === "Rpt_Aria_InvalidTabindexForActivedescendant" ||
                result.ruleId === "aria_activedescendant_tabindex_valid" ||

                result.ruleId === "Rpt_Aria_MissingFocusableChild" ||
                result.ruleId === "aria_child_tabbable" ||

                result.ruleId === "Rpt_Aria_MissingKeyboardHandler" ||
                result.ruleId === "aria_keyboard_handler_exists" ||

                result.ruleId === "RPT_Elem_EventMouseAndKey" ||
                result.ruleId === "element_mouseevent_keyboard" ||

                result.ruleId === "iframe_interactive_tabbable" ||
                result.ruleId === "element_scrollable_tabbable" ||

                // 2.4.3 Focus Order
                result.ruleId === "IBMA_Focus_MultiTab" ||
                result.ruleId === "widget_tabbable_single" ||

                result.ruleId === "IBMA_Focus_Tabbable" ||
                result.ruleId === "widget_tabbable_exists" ||

                result.ruleId === "element_tabbable_role_valid" ||

                // 2.4.7 Focus Visible
                // result.ruleId === "RPT_Style_HinderFocus1" ||
                // result.ruleId === "style_focus_visible" ||

                result.ruleId === "WCAG20_Script_FocusBlurs" ||
                result.ruleId === "script_focus_blur_review" ||

                result.ruleId === "element_tabbable_visible" ||

                // 2.4.11 Focus not obscured (Minimum)
                result.ruleId === "element_tabbable_unobscured" ||
                

                // 3.2.1 On Focus
                result.ruleId === "WCAG20_Select_NoChangeAction" ||
                result.ruleId === "script_select_review" ||

                // 4.1.2 Name, Role, Value
                result.ruleId === "Rpt_Aria_ValidRole" ||
                result.ruleId === "aria_role_allowed")) {
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