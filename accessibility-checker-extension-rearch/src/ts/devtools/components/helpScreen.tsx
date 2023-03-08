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
import { Column, InlineLoading, Grid } from "@carbon/react";
import { IIssue } from "../../interfaces/interfaces";
import { getDevtoolsController } from "../devtoolsController";

interface IHelpScreenState {
    issue: IIssue | null
    loading: boolean
    errString?: string
}

interface IHelpScreenProps {
}

export default class HelpScreen extends React.Component<IHelpScreenProps, IHelpScreenState> {
    state : IHelpScreenState = {
        issue: null,
        loading: true
    }
    private static devtoolsController = getDevtoolsController();

    async componentDidMount(): Promise<void> {
        HelpScreen.devtoolsController.addSelectedIssueListener(async (issue) => {
            this.setIssue(issue);
        });
        let issue = await HelpScreen.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);
    }

    setIssue(issue: IIssue) {
        this.setState( { issue: null, loading: true, errString: undefined });
        setTimeout(() => {
            this.setState( { issue });
        }, 0);
    }

    onHelpLoaded() {
        this.setState({loading: false});
    }

    render() {
        return (
            <Grid className="helpScreen" style={{height: "100%"}}>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}} style={{height: "100%", margin: "0rem"}}>
                    <div style={{
                        position: "relative", height: "100%", width: "100%", padding: "0rem"
                    }}>
                        {this.state.issue && <iframe 
                            title="Accessibility Checker Help" 
                            src={this.state.issue.help}
                            onLoad={this.onHelpLoaded.bind(this)}
                            onError={() => {
                                this.setState({ errString: `Error while loading ${this.state.issue!.help}`})
                            }}
                            style={{
                                position: "absolute", width: "100%", height: "100%"
                            }}></iframe>}
                        {this.state.loading && 
                            <div style={{margin: "1rem"}}><InlineLoading /></div>
                        }
                        {this.state.errString && <>{this.state.errString}</>}
                    </div>
                </Column>
            </Grid>
        )
    }
}