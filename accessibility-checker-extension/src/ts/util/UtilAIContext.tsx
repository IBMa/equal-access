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

import { IIssue } from '../interfaces/interfaces';

interface MyObject {
    [key: string]: string; //  Any property with a string key will be a number
}

export class UtilAIContext {
    public static text_contrast_sufficient_Context(issue: IIssue) : {} | undefined {
        let inputValues = issue.messageArgs; // ['2.93', 32, 400, '#9188ff', '#ffffff', false, false]
        // don't need first entry in array
        inputValues.shift();
        // inputValues now [32, 400, '#9188ff', '#ffffff', false, false]
        const stringInputValues = inputValues.map(String); // ["32", "400", "#9188ff", "#ffffff", "false", "false"]

        const keys = ["fontSize", "fontWeight", "fgColor", "bgColor", "hasBGImage", "hasGradient"];
        
        let jsonObject : MyObject = {};
        if (issue.messageArgs.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                jsonObject[keys[i]] = stringInputValues[i];
            }
            return jsonObject;
        } else {
            console.log("Error: cannot form text_contrast_sufficient_Context");
            return ("Error: cannot form text_contrast_sufficient_Context");
        }
        
    }

    
}