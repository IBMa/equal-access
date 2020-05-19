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

const splashScreen = "/assets/splash_screen.svg";

interface IReportSplashState {
}

interface IReportSplashProps {
}

export default class ReportSplash extends React.Component<IReportSplashProps, IReportSplashState> {
    render() {
        const manifest = chrome.runtime.getManifest();
        return <div className="reportSplash">
            <div className="bx--grid" style={{ margin: "2rem -1rem 0rem 0rem"}}>
                <div className="bx--row">
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <div className="title">IBM <span style={{fontWeight:600}}>Accessibility</span></div>
                        <div className="subtitle">Equal Access Accessibility Checker</div>
                        <div className="version">Version {manifest.version}</div>
                        <div className="description">
                            This extension helps you identify accessibility issues, offers tips on how to fix them, 
                            and flags items that need further review.<br/><br/>
                            These automated tests don't catch all issues. Complete your accessibility assessment with 
                            a <a className="link" href="https://ibm.com/able/toolkit/develop/considerations/unit-testing" target="_blank">quick unit test for accessibility</a><span> </span>
                            or follow the <a className="link" href="https://ibm.com/able/toolkit/verify" target="_blank">full accessibility test process</a>.<br/><br/>
                            Learn how to design, build and test for accessibility with the <a className="link" href="https://ibm.com/able/toolkit" target="_blank">IBM Equal Access Toolkit</a>.
                        </div>
                    </div>
                    <div className="bx--col-lg-8 bx--col-md-8 box--col-sm-4">
                        <img src={splashScreen} alt="Splash screen" style={{maxWidth: "100%", marginTop:"36px"}}></img>
                    </div>
                </div>
            </div>
        </div>;
    }
}