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
import * as LZString from '../../devtools/../../../node_modules/lz-string';

interface IHelpScreenState {
    issue: IIssue | null
    help1: string | null
    help2: string | null
    ai: boolean;
    aiHelp: string | null, // note this is a json string
    newResponse: boolean,
    loading: boolean
    errString?: string
}

interface IHelpScreenProps {
    // message: string;
}

interface ResponseEventDetail { // My custom event detail
    data: any;
}

export default class HelpScreen extends React.Component<IHelpScreenProps, IHelpScreenState> {
    private eventListener: ((event: CustomEvent<ResponseEventDetail>) => void) | undefined;

    state : IHelpScreenState = {
        issue: null,
        help1: null,
        help2: null,
        ai: true,
        aiHelp: null,
        newResponse: false,
        loading: true
    }
    private devtoolsAppController = getDevtoolsAppController();
    private devtoolsController = getDevtoolsController(this.devtoolsAppController.toolTabId);

    async componentDidMount(): Promise<void> {
        this.eventListener = async (event: CustomEvent<ResponseEventDetail>) => {
            console.log('Custom event received:', event.detail);
            this.setState({newResponse: true});
            this.setState({aiHelp: JSON.stringify(event.detail)}, () => {
                console.log("this.state.aiHelp = \n", this.state.aiHelp);
            });
            let issue = await this.devtoolsController.getSelectedIssue();
            this.setIssue(issue!);
        };
        window.addEventListener('my-custom-event', this.eventListener as EventListener);
        this.devtoolsController.addSelectedIssueListener(async (issue) => {
            this.setIssue(issue);
        });
        let issue = await this.devtoolsController.getSelectedIssue();
        this.setIssue(issue!);
    }

    componentWillUnmount() {
        if (this.eventListener) {
          window.removeEventListener('my-custom-event', this.eventListener as EventListener);
        }
    }

    handleCustomEvent(event:any) {
        // Access custom event data using event.detail
        console.log('Custom event received:', event.type, event.detail);
        // Perform actions based on the event
    }
    

    setIssue(issue: IIssue) {
        console.log("File: helpScreen Func: setIssue");
        
        // define JSON object
        // const aiHelp = {
        //     "inaccessible_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>",
        //     "accessible_dom": "<svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg>",
        //     "accessible_source": "import React from 'react'; function AccessibleSVG() { return ( <svg viewBox='0 0 600 400' width='0' height='0' xmlns:xlink='http://www.w3.org/1999/xlink' aria-hidden='true'><defs><filter id='protanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='deuteranopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter><filter id='tritanopia'><feColorMatrix in='SourceGraphic' type='matrix' values='0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0'></feColorMatrix></filter></defs></svg> ); } export default AccessibleSVG;",
        //     "change_summary": "The original SVG element was inaccessible because it had no accessible name. To fix this, I added the aria-hidden attribute to the SVG element and set it to true, indicating that the element is not visible, perceivable, or interactive to users. This change makes the SVG element accessible by providing a clear indication of its purpose.",
        //     "disclaimer": "Please note that while we aim to provide accurate and helpful information, the use of AI-generated content is at your own risk, and IBM does not assume any liability for outcomes or actions taken based on this content."
        // }

        // define JSON object
        const aiHelpTemp = {
            "inaccessible_dom": "We are waiting on AI server.",
            "accessible_dom": "We are waiting on AI server.",
            "accessible_source": "We are waiting on AI server.",
            "change_summary": "We are waiting on AI server.",
            "disclaimer": "Please note that while we aim to provide accurate and helpful information, the use of AI-generated content is at your own risk, and IBM does not assume any liability for outcomes or actions taken based on this content."
        }

        let aiHelp:string = "";

        if (this.state.aiHelp && this.state.newResponse === true) {
            console.log("We have aiHelp  this.state.aiHelp = \n", this.state.aiHelp);
            aiHelp = this.state.aiHelp;
            this.setState({newResponse: false});
        } else {
            console.log("We are waiting on AI server.");
            aiHelp = JSON.stringify(aiHelpTemp);
        }

        this.setState( { issue: null, help1: null, help2: null,  
            loading: true, errString: undefined });
        setTimeout(async () => {
            let help1 = null;
            let help2 = null;
            if (issue) {
                help1 = issue.help;
                console.log("issue.help = \n", issue.help);
                let m = help1.match(/[^@]*@([^/]*)\/help(.*)/);
                if (m) {
                    console.log("m = ", m);
                    const version = m[1];
                    const helpFile = m[2];
                    let archiveDef = await getBGController().getArchiveDefForVersion(version);
                    console.log("archiveDef.version = \n", archiveDef.version);
                    if (version === "latest" && archiveDef.version && archiveDef.version.length > 0) {
                        help1 = `https://unpkg.com/accessibility-checker-engine@${archiveDef.version}/help${helpFile}`;
                    }
                    help2 = `https://able.ibm.com/rules${archiveDef.path}/doc${helpFile}`;
                }
            }
            if (help1) {
                console.log("\n\n**** START Setup for help1 URL ****\n")
                console.log("JOHO File helpScreen.tsx help1 = \n", help1);
                console.log("Count = ", help1.length);
                
                // for testing while constructing the new url we will make a copy of help 1

                // Step 0: Setup URL with parameters
                console.log("\nStep 0: Setup URL with parameters");
                const testHelp1 = help1;
                // extract base url including hash
                const hashIndex = testHelp1!.indexOf('#');
                const help1BaseURL = testHelp1!.substring(0, hashIndex + 1);
                console.log("help1BaseURL = \n", help1BaseURL);
                console.log("Count = ", help1BaseURL.length);

                // extract from help 1 url everything after the # - part A
                const help1param1 = testHelp1?.substring(testHelp1.indexOf('#') + 1);
                console.log("help1param1 (string) = \n", help1param1);
                console.log("Count = ", help1param1.length); // ***** this is one count to match

                // convert json object to string
                const help1param2 = JSON.stringify(aiHelp);
                console.log("help1param2 (string) = \n", help1param2);
                console.log("Count = ", help1param2.length); // ***** this is one count to match

                // append the aiHelp to the part A after the # prepended by an & (note: don't include the #)
                let help1AllParams = "";
                if (help1param1) {
                    help1AllParams = help1param1 + ('&' + JSON.stringify(aiHelp));
                }
                console.log("help1AllParams = \n", help1AllParams); // should find & between parameters
                console.log("Count = ", help1AllParams.length);

                const completeHelp1URL = help1BaseURL + help1AllParams;
                console.log("\nComplete help1 URL with AI Help = \n", completeHelp1URL);
                console.log("Count = ", completeHelp1URL.length); // ***** this is one count to match

                // Step 1: Compress Params
                console.log("\nStep 1: Compress Params")
                const compressedHelp1Params = LZString.compressToEncodedURIComponent(help1AllParams);
                console.log("LZ compressedHelp1Params = \n", compressedHelp1Params);
                console.log("Count = ", compressedHelp1Params.length);
                
                // Step 2: create url with compressed params
                console.log("\nStep 2: create url with compressed params")
                const help1URLCompressed = help1BaseURL + compressedHelp1Params;
                console.log("**** Final help1URL is help1BaseURL + compressedHelp1Params = \n", help1URLCompressed);
                console.log("Count = ", help1URLCompressed.length); // ***** this is one count to match
                
                // if no AI just use help1
                help1 = help1URLCompressed;
                console.log("********** help1 = \n", help1);
            }
            if (help2)
                console.log("JOHO file helpScreen help2 = \n", help2);
                // extract from help 2 url everything after the # - part A
                // append the aiHelp to the part A after the # prepended by an & (note: don't include the #)
                // compress the parameters
                // append the compressed parameters to the url after the # completing the help 2 url
            // Fix help
            this.setState( { issue, help1, help2 });
        }, 0);
    }

    onHelpLoaded1(_evt: any) {
        console.log("onHelpLoaded1 _evt = \n", _evt);
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
                            {console.log("*** in helpScreen render, help1 = \n", this.state.help1)}
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