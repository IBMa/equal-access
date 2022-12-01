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

 import {
    Column, Grid, Button
 } from '@carbon/react';
 
 
 // const BeeLogo = "/assets/BE_for_Accessibility_darker.svg";
 // import { ArrowLeft16 } from '@carbon/react/icons/lib/index';
 
 interface IHeaderState {
 }
 
 interface IHeaderProps {
     layout: "main" | "sub",
     learnHelp: () => void,
 }
 
 export default class HelpHeader extends React.Component<IHeaderProps, IHeaderState> {
     state: IHeaderState = {};

    render() {
        let headerContent = (<div style={{marginTop:"6px"}}>
            <Grid style={{padding: "0rem"}}>
            <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}}>
                    <Button id='backToListView2' onClick={this.props.learnHelp} size="sm" kind='tertiary'>Back to list view</Button>
                </Column>
                <Column sm={{span: 2}} md={{span: 4}} lg={{span: 8}} style={{position: "relative"}}>
                    <div className="headerTools" >
        
                    </div>
                </Column>
            </Grid>
        </div>);

        if (this.props.layout === "main") {
            return <div className="fixed-header" 
                    style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", left: "50%", width: "50%", top: "1rem"}}>
                {headerContent}                      
            </div>
        } else {
            return <div className="fixed-header" style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", width: "100%", height:"56px"}}>
                {headerContent}        
            </div>
        }
        
    }
     
 }