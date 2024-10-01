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
import * as React from 'react';
import { UtilIssue } from './UtilIssue';
import { Violation16,NeedsReview16,Recommendation16,ViewOff16,ViewOn16 } from './UtilImages';

export type IssueValue = [ 
    "VIOLATION" | "RECOMMENDATION"| "INFORMATION", 
    "FAIL" | "POTENTIAL" | "MANUAL" | "PASS" 
];



export class UtilIssueReact {
    public static valueToIcon(value: IssueValue, className?: string) : React.ReactNode {
        let sing = UtilIssue.valueToStringSingular(value);
        return this.valueSingToIcon(sing, className);
    }

    public static valueSingToIcon(sing: string, className?: string) : React.ReactNode {
        if (sing === "Violation") {
            return <>{Violation16}</>
        } else if (sing === "Needs review") {
            return <>{NeedsReview16}</>
        } else if (sing === "Recommendation") {
            return <>{Recommendation16}</>
        } else if (sing === "ViewOff") {
            return <>{ViewOff16}</>
        } else if (sing === "ViewOn") {
            return <>{ViewOn16}</>
        } else if (sing === "Pass") {
            return <></>
        } else {
            return <></>;
        }
    }
}