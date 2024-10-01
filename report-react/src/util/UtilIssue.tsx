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
import { IssueValue } from './UtilIssueReact';

export class UtilIssue {
    private static valueMap: { [key: string]: { [key2: string]: string } } = {
        "VIOLATION": {
            "POTENTIAL": "Needs review",
            "FAIL": "Violation",
            "PASS": "Pass",
            "MANUAL": "Needs review"
        },
        "RECOMMENDATION": {
            "POTENTIAL": "Recommendation",
            "FAIL": "Recommendation",
            "PASS": "Pass",
            "MANUAL": "Recommendation"
        },
        "INFORMATION": {
            "POTENTIAL": "Needs review",
            "FAIL": "Violation",
            "PASS": "Pass",
            "MANUAL": "Recommendation"
        }
    };

    public static valueToStringSingular(value: IssueValue) : string {
        return UtilIssue.valueMap[value[0]][value[1]];
    }

    public static valueToStringPlural(value: IssueValue) : string {
        let sing = UtilIssue.valueToStringSingular(value);
        return this.singToStringPlural(sing);
    }
    
    public static singToStringPlural(sing: string) : string {
        if (sing === "Violation") return "Violations";
        if (sing === "Needs review") return "Needs review";
        if (sing === "Recommendation") return "Recommendations";
        return sing;
    }

    public static valueToOrder(value: IssueValue) : number {
        let sing = UtilIssue.valueToStringSingular(value);
        if (sing === "Violation") return 0;
        if (sing === "Needs review") return 1;
        if (sing === "Recommendation") return 2;
        return 3;
    }
}