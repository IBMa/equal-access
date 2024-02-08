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
    import { BrowserDetection } from "../util/browserDetection";
    import { Column, Link, Grid } from "@carbon/react";
    import "./popup.scss";
    
    import beeLogoDark from "../../assets/BE_for_DarkMode.svg";
    import beeLogoLight from "../../assets/BE_for_LightMode.svg";

    const checker_chrome = "/assets/img/Chrome_Checker.png";
    const checker_firefox = "/assets/img/Firefox_Checker.png";
    const assessment_chrome = "/assets/img/Chrome_Assessment.png";
    const assessment_firefox = "/assets/img/Firefox_Assessment.png";
    
    export default class PopupApp extends React.Component {
    
      render() {
        BrowserDetection.setDarkLight();
        const manifest = chrome.runtime.getManifest();
        function displayVersion() {
            let extVersion = manifest.version;
            if (extVersion.endsWith(".9999")) {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
            } else {
                return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
            }
        }
    
        const checker_screen_copy = BrowserDetection.isChrome()
          ? checker_chrome
          : checker_firefox;
        const assessment_screen_copy = BrowserDetection.isChrome()
          ? assessment_chrome
          : assessment_firefox;
    
        return (
            <div className="popupPanel">
                <Grid>
                    <Column sm={3}>
                        <div className="popupTitle">
                            IBM <strong>Equal Access</strong><br/>
                            <div>Accessibility Checker</div>
                        </div>
                        <div className="versionDec">Version {displayVersion()}</div>
                    </Column>
                    <Column sm={1} style={{ textAlign: "right" }}>
                        <img
                            src={BrowserDetection.isDarkMode()?beeLogoDark:beeLogoLight}
                            style={{ width: "2.25rem", height: "2.25rem" }}
                            alt="purple bee icon"
                        />
                    </Column>
                </Grid>
                <Grid style={{paddingRight: "3rem"}}>
                    <Column sm={4} style={{paddingRight: '3rem'}}>
                        <h2 className="popupSubTitle">
                            Accessibility Assessment
                        </h2>
                        <div className="popupPanelDesc">
                            A comprehensive accessibility assessment tool. Start using by
                            navigating to the “Accessibility Assessment” panel in Dev Tools.
                        </div>
                    </Column>
                </Grid>
                <Grid style={{paddingRight: "3rem"}}>
                    <Column sm={4}>
                        <img style={{width: "100%", height: "145px"}} 
                            src={assessment_screen_copy}
                            alt="Accessibility Assessment panel screenshot"
                        />
                    </Column>
                </Grid>                
                <Grid style={{paddingRight: "3rem"}}>
                    <Column sm={4} style={{paddingRight: '3rem'}}>
                        <h2 className="popupSubTitle">
                            Accessibility Checker
                        </h2>
                        <div className="popupPanelDesc">
                            A code scanner for developers looking to find and fix errors quickly.
                            Start using by navigating to the “Accessibility Checker” panel in Dev
                            Tools.
                        </div>
                    </Column>
                </Grid>
                <Grid style={{paddingRight: "3rem"}}>
                    <Column sm={4} md={8} lg={16}>
                        <img style={{width: "100%", height: "145px"}} 
                            src={checker_screen_copy}
                            alt="Accessibility Checker panel screenshot"
                        />
                    </Column>
                </Grid>
                <div style={{marginTop: "1rem"}} />
                <Grid>
                    <Column sm={4} md={8} lg={16}>
                        <Link href={chrome.runtime.getURL("options.html")}
                            target="_blank"
                            rel="noopener noreferred"
                        >
                            Settings
                        </Link>
                        <span style={{marginLeft: "1.5rem"}}/>
                        <Link href="https://github.com/IBMa/equal-access"
                            target="_blank"
                            rel="noopener noreferred"
                        >
                            Git repo
                        </Link>
                        <span style={{marginLeft: "1.5rem"}}/>
                        <Link href={chrome.runtime.getURL("usingAC.html")}
                            target="_blank"
                            rel="noopener noreferred"
                        >
                            Docs
                        </Link>
                    </Column>
                </Grid>
            </div>
        )}
    }
    