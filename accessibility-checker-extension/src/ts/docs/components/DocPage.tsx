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
    Column,
    Grid,
    //Theme
} from "@carbon/react";

// import OptionUtil  from '../util/optionUtil';
import beeLogoDark from "../../../assets/BE_for_DarkMode.svg";
import beeLogoLight from "../../../assets/BE_for_LightMode.svg";
import "./DocPage.scss";
import { BrowserDetection } from "../../util/browserDetection";

type ColDef = number | {
    span: number
    offest: number
}

interface DocPageProps {
    aside: React.ReactNode
    sm: ColDef
    md: ColDef
    lg: ColDef
}

interface DocPageState {
}

export class DocPage extends React.Component<DocPageProps, DocPageState> {
    
    render() {
        const manifest = chrome.runtime.getManifest();
        function displayVersion() {
            let extVersion = manifest.version;
            if (extVersion.endsWith(".9999")) {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
            } else {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
            }
        }

        return (<div className={BrowserDetection.isDarkMode()?"cds--g90":"g10"} style={{ minWidth: "100%" }}>
            <Grid style={{marginLeft: "-1rem"}}>
                <Column sm={4} md={8} lg={4} className={`leftCol ${BrowserDetection.isDarkMode()?"cds--g100":"cds--g10"}`}>
                    <div role="banner">
                        <img src={BrowserDetection.isDarkMode()?beeLogoDark:beeLogoLight} alt="purple bee icon" className="icon" />
                        <div style={{marginTop:"2rem"}} />
                        <div className="division">
                            IBM <strong>Accessibility</strong>
                        </div>
                        <div className="brand">
                            Equal Access Toolkit:
                        </div>
                        <div className="product">
                            Accessibility Checker
                        </div>
                        <div className="op_version">
                            Version {displayVersion()}
                        </div>
                    </div>
                    {this.props.aside}
                </Column>
                <Column sm={0} md={0} lg={1}>
                </Column>
                <Column sm={this.props.sm} md={this.props.md} lg={this.props.lg} className={`rightCol ${BrowserDetection.isDarkMode()?"cds--g90":"white"}`}>
                    {this.props.children}
                </Column>
            </Grid>
        </div>)
    }
}

