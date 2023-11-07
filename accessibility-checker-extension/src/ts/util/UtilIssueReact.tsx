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
import { IssueValue } from '../interfaces/interfaces';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";
import ViewOff16 from "../../assets/img/View--off.svg"
import { UtilIssue } from './UtilIssue';

export class UtilIssueReact {
    public static valueToIcon(value: IssueValue, className?: string) : React.ReactNode {
        let sing = UtilIssue.valueToStringSingular(value);
        return this.valueSingToIcon(sing, className);
    }

    public static valueSingToIcon(sing: string, className?: string) : React.ReactNode {
        if (sing === "Violation") {
            return <img src={Violation16} alt={sing} className={className} />
        } else if (sing === "Needs review") {
            return <img src={NeedsReview16} alt={sing} className={className} />
        } else if (sing === "Recommendation") {
            return <img src={Recommendation16} alt={sing} className={className} />
        } else if (sing === "ViewOff") {
            return <img src={ViewOff16} alt={sing} className={className} />
        } else if (sing === "Pass") {
            return <></>
        } else {
            return <></>;
        }
    }
}