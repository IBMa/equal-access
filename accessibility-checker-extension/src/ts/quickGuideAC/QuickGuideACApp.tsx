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
import beeLogoUrl from "../../assets/BE_for_Accessibility_darker.svg";
import violation from "../../assets/Violation16.svg";
import needsReview from "../../assets/NeedsReview16.svg";
import recommendation from "../../assets/Recommendation16.svg";
import tabStop from "../../assets/tab_stop.svg";
import kbIssues from "../../assets/keyboard_issue.svg";
import element from "../../assets/element.svg";

interface quickGuideACAppState { }

class quickGuideACApp extends React.Component<{}, quickGuideACAppState> {
    state: quickGuideACAppState = {};

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
            
            <div>
                <Grid fullWidth>
                    <Column sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 4 }} className="leftPanel">
                        <div role="banner">
                            <img src={beeLogoUrl} alt="purple bee icon" className="icon" />
                            <br />
                                IBM <strong>Accessibility</strong>  
                        </div> 
                           
                        <div role="navigation">
                            <h3>Equal Access Toolkit:
                                    <br />
                            Accessibility Checker</h3>
                            <div className="op_version">Version {displayVersion()}</div> 
                            <ul className="toc">
                                <li>
                                    <a href="#checker" title="accessibility checker">
                                        1. Accessibility Checker
                                    </a>
                                </li>
                                <li>
                                    <a href="#scan" title="create a scan">
                                        2. Create a scan report
                                    </a>
                                </li>

                                <li>
                                    <a href="#multiscan" title="create a multi-scan">
                                        3. Create a multi-scan report
                                    </a>
                                </li>

                                <li>
                                    <a href="#focus" title="focus">
                                        4. Focus view
                                    </a>
                                </li>

                                <li>
                                    <a href="#keyboard" title="keyboard checker mode">
                                        5. Keyboard checker mode
                                    </a>
                                </li>
                                <li>
                                    <a href="#troubleshooting" title="troubleshooting">
                                        6. Troubleshooting
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p>For more in-depth guidance, see <a href={chrome.runtime.getURL("usingAC.html")} target="_blank" rel="noopener noreferred">user guide</a>
                            </p>
                        </div>
                    </Column>
                    <Column sm={{span: 6}} md={{span: 8}} lg={{span: 8}} className="rightPanel"
                        role="main"
                        aria-label="Quick guide details"
                    >
                        <h1>IBM Accessibility Checker quick guide</h1>
                    <div className="pa">
                        <p>
                            The IBM Accessibility Checker is a browser extension that tests web pages for accessibility issues with W3C Web Content Accessibility Guidelines (WCAG) and IBM requirements with explanations and suggested fixes. 
                        </p>
                    </div>
                    <div className="pa">
                        <p>
                            As with any automated test tool for accessibility, these tests don't catch all issues. Complete your accessibility testing with a quick unit test for accessibility or follow the full accessibility test process. {" "}
                            <a href={chrome.runtime.getURL("usingAC.html#categories")} target="_blank" rel="noopener noreferred">
                                Accessibility Issues
                            </a>{" "} in the user guide.
                        </p>
                    </div>
                            <img 
                                className="rectangle-image"
                                src="assets/img/Quick_Intro.png"
                                alt="IBM checker tool highlighting the issues filter"
                            />
                        <div className="pa">
                            <p>The issues are divided into three types:</p>
                        </div>
                            <ul>
                            <li>
                                    <img
                                        src={violation}
                                        alt="violation icon"
                                    />{" "}
                                    <strong> Violation</strong> - failures that need
                                    to be corrected
                            </li>
                            <li>
                                    <img
                                        src={needsReview}
                                        alt="needs review icon"
                                    />{" "}
                                    <strong> Needs review</strong> - need manual review to identify if it's a violation
                            </li>
                            <li>
                                    <img
                                        src={recommendation}
                                        alt="recommendation icon"
                                    />{" "}
                                    <strong> Recommendation</strong> - opportunities to apply best
                                    practices
                            </li>
                        </ul>

                        <img 
                                className="rectangle-image"
                                src="assets/img/Quick_Look.png"
                                alt="IBM checker tool with numbers labeling each functionality"
                            />
                       <div className="pa">
                            <p>Here’s a quick look at what all the functionalities are in the Checker tool.</p>
                        </div>  

                        <h2 id="checker">1. Accessibility Checker</h2>
                        <div>
                            <p>
                                The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component. For more in-depth guidance, view 
                                {" "}
                                <a href={chrome.runtime.getURL("usingAC.html#a11y_check")} target="_blank" rel="noopener noreferred">
                                Accessibility Checker
                                </a>{" "} in the user guide.</p>

                                <img 
                                    className="rectangle-image"
                                    src="assets/img/1_Checker.png"
                                    alt="IBM checker tool highlighting the scan button"
                                />
                        </div>

                        <h2 id="scan">2. Create a scan report</h2>
                        <div>
                            <p>
                                You can generate a report for a single scan in the Checker view in both HTML and MS Excel spreadsheet formats. For more in-depth guidance, view <a href={chrome.runtime.getURL("usingAC.html#t_single_scan_report")} target="_blank" rel="noopener noreferred">
                                Create a scan report
                                </a>{" "} in the user guide. </p>

                                <img 
                                    className="rectangle-image"
                                    src="assets/img/2_Scan.png"
                                    alt="an open dropdown menu with focus on 'download current scan'"
                                />
                        </div>

                        <h2 id="multiscan">3. Create a multi-scan report</h2>
                        <div>
                            <p>
                                You can combine up to 50 multiple scans into a single report in a MS Excel spreadsheet format. For more in-depth guidance, view <a href={chrome.runtime.getURL("usingAC.html#t_multi_scan_report")} target="_blank" rel="noopener noreferred">
                                Create a multi-scan report
                                </a>{" "} in the user guide.</p>

                                <img 
                                    className="rectangle-image"
                                    src="assets/img/3_MultiScan.png"
                                    alt="an open dropdown menu with focus on 'start storing scans'"
                                />
                        </div>

                        <h2 id="focus">4. Focus view</h2>
                        <div>
                            <p>
                                The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM. For more in-depth guidance, view <a href={chrome.runtime.getURL("usingAC.html#focus_view")} target="_blank" rel="noopener noreferred"> Focus view
                                </a>{" "} in the user guide.</p>
                                <img 
                                    className="rectangle-image"
                                    src="assets/img/4_Focus.png"
                                    alt="content switcher with two items: html and all"
                                />
                        </div>

                        <h2 id="keyboard">5. Keyboard checker mode</h2>
                        <div>
                            <p>
                                This mode shows a visualization of the keyboard tab order detected on the page, and elements with detectable keyboard access issues. For more in-depth guidance, view <a href={chrome.runtime.getURL("usingAC.html#keyboard_checker_mode")} target="_blank" rel="noopener noreferred"> Keyboard checker mode
                                </a>{" "}  in the user guide.</p>

                                <img 
                                    className="rectangle-image"
                                    src="assets/img/5_Keyboard.png"
                                    alt="IBM checker tool highlighting 'keyboard checker mode' icon button"
                                />
                                <div className="pa">
                                    <p>Select 'Keyboard checker mode' icon to turn on/off keyboard visualization.</p>
                                </div>
                                <p>

                                </p>
                                <img 
                                className="rectangle-image"
                                src="assets/img/3.5Keyboard1.png"
                                alt="IBM Checker tool highlighting 'keyboard checker mode' icon button"
                            />
                        <div className="pa">
                            <p>
                            Select 'Keyboard checker mode' icon to turn on/off keyboard visualization.
                            </p>
                        </div>
                        <div className="pa">
                            <p><strong>Important note:</strong> the keyboard checker mode does not track page changes. Turn the mode off and on again to update the visualization.
                            </p>
                        </div>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.5Keyboard2.png"
                                alt="webpage with keyboard visualization overlay"
                            />
                        <div className="pa"><p>Select these icons or tab through the page to see code and keyboard access issues:</p></div>
                        <div className="pa">
                        <ul>
                            <li>
                                <p>
                                    <img
                                        src={tabStop}
                                        alt="tab stop icon"
                                    />{" "}
                                    tab stops numbered by tab order of the page
                                </p>
                            </li>
                            <li>
                                <p>
                                    <img
                                        src={kbIssues}
                                        alt="keyboard issues icon"
                                    />{" "}
                                    keyboard access issue with tab stop number
                                </p>
                            </li>
                            <li>
                                <p>
                                    <img
                                        src={element}
                                        alt="element issues icon"
                                    />{" "}
                                    element with keyboard access issue (not a tab stop)
                                </p>
                            </li>
                        </ul>
                        </div>
                        </div>

                        <h2 id="troubleshooting">9. Troubleshooting</h2>
                            <p>
                                If the Accessibility Checker appears unresponsive:
                                <br />
                                <ul>
                                    <li>Close the browser DevTools</li>
                                    <li>Clear browser cookies</li>
                                    <li>Refresh the page</li>
                                    <li>Reopen the browser DevTools</li>
                                    <li>Click the 'Scan' button</li>
                                </ul>
                            </p>
                    </Column>
                </Grid>
            </div>
        );
    }
}

export default quickGuideACApp;
