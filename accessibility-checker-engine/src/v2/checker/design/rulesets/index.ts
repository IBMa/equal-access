/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/

import { Ruleset } from "../../Checker";
import { eRulePolicy, eRuleCategory } from "../../../api/IEngine";

let designRulesets: Ruleset[] = [];
/*
{
    id: "IBM_Design",
    category: eRuleCategory.DESIGN,
    "checkpoints": [
        {
            "num": "1", // Color
            "rules": [
                {
                    id: "DESIGN_COLOR_Palette_Foreground",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "DESIGN_COLOR_Palette_Background",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "2", // Type
            "rules": [
                {
                    id: "DESIGN_Typography_Plex",
                    level: eRulePolicy.VIOLATION
                },
                {
                    id: "DESIGN_Typography_TextAlignLeft",
                    level: eRulePolicy.VIOLATION
                }
            ]
        },
        {
            "num": "3", // Grid & Layout
            "rules": [
                // {
                //     id: "DESIGN_GridLayout_ImgAspectRatio",
                //     level: eRulePolicy.VIOLATION
                // }
            ]
        }
    ]
}]
*/
export { designRulesets }