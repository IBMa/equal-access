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
import { Column, Grid } from "@carbon/react";
import { BrowserDetection } from "../../util/browserDetection";
import "./splashScreen.scss";

const splashScreen = "/assets/splash_screen.svg";

interface ISplashScreenState {
}

interface ISplashScreenProps {
}

export default class SplashScreen extends React.Component<ISplashScreenProps, ISplashScreenState> {
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
        return (
            <Grid className="splashScreen">
                <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                    <h2>
                        <div className="title">IBM <span style={{ fontWeight: 600 }}>Accessibility</span></div>
                        <div className="subtitle">Equal Access Toolkit: Accessibility Checker</div>
                        <div className="version">Version {displayVersion()}</div>
                    </h2>
                    <div className="description">
                        This extension helps you identify accessibility issues and understand how to fix them. Use the <span style={{ fontWeight: 600 }}>'Accessibility Checker' tab in 
                        the {BrowserDetection.isChrome()?"Elements":"Inspector" } panel</span> to locate your issues in the code and on the page.<br /><br />
                        These automated tests don't catch all issues. Complete your accessibility assessment
                        with <a className="link" href="https://www.ibm.com/able/toolkit/develop/overview/#unit-testing" target="_blank">developer unit testing</a><span> </span>
                        and follow all the <a className="link" href="https://www.ibm.com/able/toolkit/verify/overview"target="_blank">steps in the Verify phase</a>.<br /><br />
                        Learn how to design, build and test for accessibility with the <a className="link" href="https://ibm.com/able/toolkit" target="_blank">IBM Equal Access Toolkit</a>.
                        For bite-sized guidance, see <a className="link" href={chrome.runtime.getURL("quickGuideAC.html")} target="_blank" rel="noopener noreferred">Quick guide</a>.
                        For more in-depth guidance, see the <a className="link" href={chrome.runtime.getURL("usingAC.html")} target="_blank" rel="noopener noreferred">User guide</a>.
                    </div>
                </Column>
                <Column sm={{span: 4}} md={{span: 4}} lg={{span: 4}}>
                    <img src={splashScreen} alt="Splash screen" style={{ maxWidth: "100%", marginTop: "36px" }}></img>
                </Column>
            </Grid>
        )
    }
}