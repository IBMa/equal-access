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
import { getBGController } from "../../background/backgroundController";
import { getDevtoolsAppController } from "../devtoolsAppController";

interface IHelpScreenState {
    issue: IIssue | null
    help1: string | null
    help2: string | null
    aiNotA11yCode: string | null
    aiA11yCode: string | null
    aiSourceCode: string | null
    aiSummary: string | null
    loading: boolean
    errString?: string
}

interface IHelpScreenProps {
}

export default class HelpScreen extends React.Component<IHelpScreenProps, IHelpScreenState> {
    state : IHelpScreenState = {
        issue: null,
        help1: null,
        help2: null,
        aiNotA11yCode: null,
        aiA11yCode: null,
        aiSourceCode: null,
        aiSummary: null,
        loading: true
    }
    private devtoolsAppController = getDevtoolsAppController();
    private devtoolsController = getDevtoolsController(this.devtoolsAppController.toolTabId);

    async componentDidMount(): Promise<void> {
        this.devtoolsController.addSelectedIssueListener(async (issue) => {
            this.setIssue(issue);
        });
        let issue = await this.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);
    }

    setIssue(issue: IIssue) {
        this.setState( { issue: null, help1: null, help2: null, aiA11yCode: null, aiSourceCode: null, 
            aiSummary: null, loading: true, errString: undefined });
            this.setState
        setTimeout(async () => {
            let help1 = null;
            let help2 = null;
            if (issue) {
                help1 = issue.help;
                let m = help1.match(/[^@]*@([^/]*)\/help(.*)/);
                if (m) {
                    const version = m[1];
                    const helpFile = m[2];
                    let archiveDef = await getBGController().getArchiveDefForVersion(version);
                    if (version === "latest" && archiveDef.version && archiveDef.version.length > 0) {
                        help1 = `https://unpkg.com/accessibility-checker-engine@${archiveDef.version}/help${helpFile}`;
                    }
                    help2 = `https://able.ibm.com/rules${archiveDef.path}/doc${helpFile}`;
                }
            }
            // Fix help
            this.setState( { issue, help1, help2 });
        }, 0);
    }

    onHelpLoaded1(_evt: any) {
        this.setState({loading: false, help2: null});
    }

    onHelpLoaded2(_evt: any) {
        this.setState({loading: false, help1: null});
    }

    render() {
        return (
            <Grid className="helpScreen" style={{height: "100%"}}>
                <Column sm={{span: 4}} md={{span: 8}} lg={{span: 8}} style={{height: "100%", margin: "0rem"}}>
                    <div style={{
                        position: "relative", height: "100%", width: "100%", padding: "0rem"
                    }}>
                        {this.state.help1 && <>
                            {/* {this.state.help1} */}
                            <iframe 
                                title="Accessibility Checker Help" 
                                src={this.state.help1}
                                onLoad={this.onHelpLoaded1.bind(this)}
                                onError={() => {
                                    this.setState({ help1: null})
                                }}
                                style={{
                                    display: this.state.loading ? "none" : undefined,
                                    position: "absolute", width: "100%", height: "100%"
                                }}></iframe>
                        </>}
                        {this.state.help2 && <>
                            {/* {this.state.help2} */}
                            <iframe 
                                title="Accessibility Checker Help" 
                                src={this.state.help2}
                                onLoad={this.onHelpLoaded2.bind(this)}
                                onError={() => {
                                    this.setState({ help2: null})
                                }}
                                style={{
                                    display: this.state.loading ? "none" : undefined,
                                    position: "absolute", width: "100%", height: "100%"
                                }}></iframe>
                        </>}
                        {this.state.loading && 
                            <div style={{margin: "1rem"}}><InlineLoading /></div>
                        }
                        {this.state.errString && <>ERR: {this.state.errString}</>}
                    </div>
                </Column>
            </Grid>
        )
    }
}