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
import violation from "../../assets/Violation16.svg";
import needsReview from "../../assets/NeedsReview16.svg";
import recommendation from "../../assets/Recommendation16.svg";
import tabStop from "../../assets/tab_stop.svg";
import tabStopChainError from "../../assets/tabStopChainError.svg";
import tabStopError from "../../assets/tabStopError.svg";
import { DocPage } from "./components/DocPage";
import { Link, 
    ListItem, 
    OrderedList, 
    UnorderedList, 
} from "@carbon/react";
import "./quickGuide.scss";

interface quickGuideACAppState { }

export class QuickGuideACApp extends React.Component<{}, quickGuideACAppState> {
    state: quickGuideACAppState = {};

    render() {
        // BrowserDetection.setDarkLight();
        
        let aside = (<>
            
            <div style={{ marginTop: "1.5rem" }} />
            <UnorderedList style={{ marginLeft: "1.5rem" }}>
                <ListItem><Link href="#issues">Accessibility issues</Link></ListItem>
                <ListItem><Link href="#functionality">Functionality in the Checker</Link>
                    <OrderedList nested={true}>
                    <ListItem><Link href="#checker">Scan to find issues</Link></ListItem>
                    <ListItem><Link href="#scan">Create a scan report</Link></ListItem>
                    <ListItem><Link href="#multiscan">Create a multi-scan report</Link></ListItem>
                    <ListItem><Link href="#focus">Focus view</Link></ListItem>
                    <ListItem><Link href="#filter">Filter views</Link></ListItem>
                    <ListItem><Link href="#hide">Show/Hide issues</Link></ListItem>
                    <ListItem><Link href="#keyboard">Keyboard Checker Mode</Link></ListItem>
                    <ListItem><Link href="#settings">Settings</Link></ListItem>
                    </OrderedList></ListItem>
                <ListItem><Link href="#feedback">Feedback</Link></ListItem>
                <ListItem><Link href="#troubleshooting">Troubleshooting</Link></ListItem>
            </UnorderedList>
            <p>
            See the <Link
                    href="https://www.ibm.com/able/requirements/requirements/"
                    target="_blank"
                    rel="noopener noreferred"
                    inline={true}
                    size="lg">IBM Accessibility requirements</Link> that need to be met to comply with standards and regulations 
            </p>
            <p>
            <strong>Rules updates</strong>: For details on rule changes at each deployment, see the <Link
                    href="https://github.com/IBMa/equal-access/releases"
                    target="_blank"
                    rel="noopener noreferred"
                    inline={true}
                    size="lg">Release notes</Link>
            </p>
            <p>
            <strong>Rules sets</strong>: A packaged set for a guideline, each of which is a collection of rules mapped to the requirements in the accessibility guideline, see the <Link
                    href="https://www.ibm.com/able/requirements/checker-rule-sets"
                    target="_blank"
                    rel="noopener noreferred"
                    inline={true}
                    size="lg">Checker rule sets</Link>
            </p>
            <p>
                For more in-depth guidance, see the <Link
                    href={chrome.runtime.getURL("usingAC.html")}
                    target="_blank"
                    rel="noopener noreferred"
                    inline={true}
                    size="lg">User guide</Link>
            </p>
            
        </>)
        return (
            <DocPage aside={aside} sm={4} md={8} lg={8}>
                
                <main
                    role="main"
                    aria-label="Quick guide details"
                >
                    
                    <h1>Quick guide - IBM Accessibility Checker</h1>
                    <p>
                        The IBM Equal Access Toolkit: Accessibility Checker ("the Checker") is a browser extension that tests web pages for accessibility issues with W3C Web Content Accessibility Guidelines (WCAG) and IBM requirements with explanations and suggested fixes.
                    </p>
                    
                
                    <p>
                        The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component. For more in-depth guidance, view
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html#a11y_check")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >Accessibility Checker</Link> in the User guide.</p>

                    <p>
                        <img
                            src="assets/img/1_Checker.png"
                            alt="IBM checker tool highlighting the scan button"
                        />
                    </p>

                    <h2 id="issues">Accessibility issues</h2>
                    <p>
                        As with any automated test tool for accessibility, these tests don't catch all issues. Complete your accessibility testing with developer unit testing and follow all the steps in the Verify 
                        phase. <Link 
                            href={chrome.runtime.getURL("usingAC.html#categories")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">
                            Accessibility Issues
                        </Link> in the User guide.
                    </p>
                    <p>
                        <img
                            src="assets/img/Quick_Intro.png"
                            alt="IBM checker tool highlighting the issues filter"
                        />
                    </p>
                    <p>The issues are divided into three types:</p>
                    <UnorderedList>
                        <ListItem>
                            <img
                                src={violation}
                                alt="violation icon"
                            />{" "}
                            <strong> Violation</strong> - failures that need
                            to be corrected
                        </ListItem>
                        <ListItem>
                            <img
                                src={needsReview}
                                alt="needs review icon"
                            />{" "}
                            <strong> Needs review</strong> - need manual review to identify if it's a violation
                        </ListItem>
                        <ListItem>
                            <img
                                src={recommendation}
                                alt="recommendation icon"
                            />{" "}
                            <strong> Recommendation</strong> - opportunities to apply best
                            practices
                        </ListItem>
                    </UnorderedList>
                    <p>
                        <img
                            src="assets/img/Quick_Look.png"
                            alt="IBM checker tool with numbers labeling each functionality"
                        />
                    </p>
            
                    <h2 id="functionality">Functionality in the Checker</h2>
                    <p>Here’s a quick look at what all the key functionalities are in the Checker.</p>

                    <h2 id="checker">1. Scan to find issues</h2>
                    <p>
                        The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component. For more in-depth guidance, view
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html#a11y_check")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >Accessibility Checker</Link> in the User guide.</p>

                    <p>
                        <img
                            src="assets/img/1_Checker.png"
                            alt="IBM checker tool highlighting the scan button"
                        />
                    </p><h2 id="scan">2. Create a scan report</h2>
                    <p>
                        You can generate a report for a single scan in the Checker view in both HTML and MS Excel spreadsheet formats. For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#t_single_scan_report")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >Create a scan report</Link> in
                        the User guide. 
                    </p>
                    <p>
                        <img
                            src="assets/img/2_Scan.png"
                            alt="an open dropdown menu with focus on 'download current scan'"
                        />
                    </p>

                    <h2 id="multiscan">3. Create a multi-scan report</h2>
                    <p>
                        You can combine up to 50 multiple scans into a single report in a MS Excel spreadsheet format. For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#t_multi_scan_report")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Create a multi-scan report</Link> in 
                        the User guide.
                    </p>
                    <p>
                        <img
                            src="assets/img/3_MultiScan.png"
                            alt="an open dropdown menu with focus on 'start storing scans'"
                        />
                    </p>

                    <h2 id="focus">4. Focus view</h2>
                    <p>
                        The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM. For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#focus_view")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Focus view</Link> in 
                        the User guide.</p>
                    <p>
                        <img
                            src="assets/img/4_Focus.png"
                            alt="content switcher with two items: html and all"
                        />
                    </p>

                    <h2 id="filter">5. Filter view</h2>
                    <p>
                        The Checker includes four filters when viewing issues. Each filter type has a checkbox. If the checkbox is checked the issue type will show.
                        If the checkbox is not checked the issue type will be filtered and not show.
                        The default is for three (3) types of issues: Violations, Needs review, and Recommendations, to be checked so that they will show.
                    </p>
                    <p>
                        The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM. For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#focus_view")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Focus view</Link> in 
                        the User guide.</p>
                    <p>
                        <img
                            src="assets/img/4_Focus.png"
                            alt="content switcher with two items: html and all"
                        />
                    </p>

                    <h2 id="hide">6. Show/Hide issues</h2>
                    <p>
                        The Hide feature allows issues to be ignored or marked as resolved. 
                        When this feature is used issues are not only hidden from view, they are also subtracted from the respective issue counts. 
                        Issues that are determined to be irrelevant or resolved can be hidden and removed from the counts towards achieving a goal of zero counts both in the issues list and in the Scan summary report.
                    </p>

                    <h2 id="keyboard">7. Keyboard checker mode</h2>
                    <p>
                        This mode shows a visualization of the keyboard tab order detected on the page, and elements with detectable keyboard access issues. For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#keyboard_checker_mode")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Keyboard checker mode</Link> in 
                        the User guide.
                    </p>
                    <p>
                        <img
                            src="assets/img/3.5Keyboard1.png"
                            alt="IBM Checker tool highlighting 'keyboard checker mode' icon button"
                        />
                    </p>
                    <p>
                        Select 'Keyboard checker mode' icon to turn on/off keyboard visualization.
                    </p>
                    <p><strong>Important note:</strong> the keyboard checker mode does not track page changes. Turn the mode off and on again to update the visualization.
                    </p>
                    <p>
                        <img
                            src="assets/img/3.5Keyboard2a.png"
                            alt="webpage with keyboard visualization overlay"
                        />
                    </p>
                    <p>Select these icons or tab through the page to see code and keyboard access issues:</p>
                    <UnorderedList>
                        <ListItem style={{marginBottom:".5rem"}}>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                src={tabStop}
                                alt="tab stop chain icon"
                                style={{verticalAlign:"middle"}}
                            /></div>{" "}
                            tab stops numbered by tab order of the page
                        </ListItem>
                        <ListItem style={{marginBottom: ".5rem"}}>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                    src={tabStopChainError}
                                    alt="tab stop with issues chain icon"
                                    style={{verticalAlign:"middle", marginTop: "-7px"}}
                                /></div>{" "}
                            keyboard access issue with tab stop number
                        </ListItem>
                        <ListItem>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                    src={tabStopError}
                                    alt="tab stop not in chain with issues icon"
                                    style={{verticalAlign:"middle", marginTop: "-7px"}}
                                /></div>{" "}
                            element not in tab stop chain with issues
                        </ListItem>
                    </UnorderedList>

                    <h2 id="settings">8. Settings</h2>
                    <p>
                        Select the Settings icon to change the Rule sets and Keyboard checker mode default settings.
                    </p>

                    <h2 id="feedback">Feedback</h2>
                    <p>
                        Visit the Equal Access GitHub repository to:
                    </p>
                    <UnorderedList>
                        <ListItem>Close the browser DevTools</ListItem>
                        <ListItem>Clear browser cookies</ListItem>
                        <ListItem>Refresh the page</ListItem>
                    </UnorderedList>

                    <h2 id="troubleshooting">Troubleshooting</h2>
                    <p>
                        If the Accessibility Checker appears unresponsive:
                    </p>
                    <UnorderedList>
                        <ListItem>Close the browser DevTools</ListItem>
                        <ListItem>Clear browser cookies</ListItem>
                        <ListItem>Refresh the page</ListItem>
                        <ListItem>Reopen the browser DevTools</ListItem>
                        <ListItem>Click the 'Scan' button</ListItem>
                    </UnorderedList>
                    <p>
                        See the User guide for more in-depth guidance:
                    </p>
                    <UnorderedList>
                        <ListItem>Helpful hints</ListItem>
                        <ListItem>Known issues</ListItem>
                    </UnorderedList>
                </main>
               
            </DocPage>
        );
    }
}
