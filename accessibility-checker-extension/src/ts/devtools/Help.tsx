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
 
import React from "react";

import { IReportItem, ICheckpoint, IReport } from './Report';

import HelpFileSwitcher from "../help/helpSwitcher";

// const Violation16 = "/assets/Violation16.png";

interface IHelpState {
}

interface IHelpProps {
    report: IReport | null,
    item: IReportItem
    checkpoint? : ICheckpoint
}

export default class Help extends React.Component<IHelpProps, IHelpState> {
    state: IHelpState = {};

    render() {
        return <div id="help" style={{height: "100%", width: "100%", padding: "0rem"}}>
            {this.props.report && 
                <HelpFileSwitcher report={this.props.report} item={this.props.item}/>
            }
        </div>
    }
}