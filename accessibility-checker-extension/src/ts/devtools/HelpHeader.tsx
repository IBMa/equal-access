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
     Button
 } from 'carbon-components-react';
 
 
 const BeeLogo = "/assets/Bee_logo.svg";
 import { ArrowLeft16 } from '@carbon/icons-react';
 
 interface IHeaderState {
 }
 
 interface IHeaderProps {
     layout: "main" | "sub",
     learnHelp: () => void
 }
 
 export default class HelpHeader extends React.Component<IHeaderProps, IHeaderState> {
     state: IHeaderState = {};
     
     componentDidMount(){
        var button = document.getElementById('backToListView');
        if(button){
            button.focus();
        }
     }
     render() {
 
         let headerContent = (<div className="bx--grid" style={{paddingLeft:"1rem"}}>
             <div className="bx--row" style={{height: "2rem"}}>
                 <div className="bx--col-sm-3">
                     <div className="eaacTitle"><span style={{fontWeight:"bold"}}>IBM Equal Access Accessibility Checker</span></div>
                 </div>
                 <div className="bx--col-sm-1" style={{position: "relative"}}>
                     <img className="bee-logo" src={BeeLogo} alt="IBM Accessibility" />
                 </div>
             </div>
             <div className="bx--row">
                 <div className="bx--col-sm-2">
                     <Button id='backToListView' onClick={this.props.learnHelp} size="small" renderIcon={ArrowLeft16}>Back to list view</Button>
                 </div>
                 <div className="bx--col-sm-2" style={{position: "relative"}}>
                     <div className="headerTools" >
            
                     </div>
                 </div>
             </div>
         </div>);
 
         if (this.props.layout === "main") {
             return <div className="fixed-header" 
                     style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)", left: "50%", width: "50%", top: "1rem"}}>
                 {headerContent}                        
             </div>
         } else {
             return <div className="fixed-header" style={{zIndex:1000, backgroundColor:"rgba(255, 255, 255, 1)"}}>
                 {headerContent}            
             </div>
         }
     }
 }