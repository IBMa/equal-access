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
import { InlineLoading } from "@carbon/react";
// import HelpFileSwitcher from "../help/helpSwitcher";

// const Violation16 = "/assets/Violation16.png";

interface IHelpState {
    loading: boolean
}

interface IHelpProps {
    report: IReport | null,
    item: IReportItem
    checkpoint? : ICheckpoint
}

export default class Help extends React.Component<IHelpProps, IHelpState> {
    state: IHelpState = {
        loading: true
    };

    componentDidUpdate() {
        var button = document.getElementById('backToListView2');
        if (button) {
            button.focus();
        }
     }

    onHelpLoaded() {
        this.setState({loading: false});
    }

    render() {
        return <div id="help" style={{position: "relative", height: "100%", width: "100%", padding: "0rem"}}>
            {this.props.report && <>
                <iframe onLoad={this.onHelpLoaded.bind(this)} title="Accessibility Checker Help" style={{position: "absolute", width: "100%", height: "100%"}} src={this.props.item.help} />
                {this.state.loading && 
                    <div style={{margin: "1rem"}}><InlineLoading /></div>
                }
                </>
            }

        </div>
    }
}