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
// import tabStop from "../../assets/tab_stop.svg";
// import kbIssues from "../../assets/keyboard_issue.svg";
// import element from "../../assets/element.svg";
import { DocPage } from "./components/DocPage";
import { Link, ListItem, OrderedList, UnorderedList } from "@carbon/react";
import "./quickGuide.scss";

interface quickGuideACAppState { }

export class QuickGuideACApp extends React.Component<{}, quickGuideACAppState> {
    state: quickGuideACAppState = {};

    render() {
        let aside = (<>
            <div style={{ marginTop: "1.5rem" }} />
            <OrderedList style={{ marginLeft: "1.5rem" }}>
                <ListItem><Link href="#checker">Accessibility Checker</Link></ListItem>
                <ListItem><Link href="#scan">Create a scan report</Link></ListItem>
                <ListItem><Link href="#multiscan">Create a multi-scan report</Link></ListItem>
                <ListItem><Link href="#focus">Focus view</Link></ListItem>
                <ListItem><Link href="#keyboard">Keyboard checker mode</Link></ListItem>
                <ListItem><Link href="#troubleshooting">Troubleshooting</Link></ListItem>
            </OrderedList>
            <p>
                For more in-depth guidance, see <Link
                    href={chrome.runtime.getURL("usingAC.html")}
                    target="_blank"
                    rel="noopener noreferred"
                    inline={true}
                    size="lg">user guide</Link>
            </p>
        </>)
        return (
            <DocPage aside={aside} sm={4} md={8} lg={8}>
                <main
                    role="main"
                    aria-label="Quick guide details"
                >
                    <h1>IBM Accessibility Checker quick guide</h1>
                    <p>
                        The IBM Accessibility Checker is a browser extension that tests web pages for accessibility issues with W3C Web Content Accessibility Guidelines (WCAG) and IBM requirements with explanations and suggested fixes.
                    </p>
                    <p>
                        As with any automated test tool for accessibility, these tests don't catch all issues. Complete your accessibility testing with a quick unit test for accessibility or follow the full accessibility test 
                        process. <Link 
                            href={chrome.runtime.getURL("usingAC.html#categories")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">
                            Accessibility Issues
                        </Link> in the user guide.
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
                    <p>Here’s a quick look at what all the functionalities are in the Checker tool.</p>

                    <h2 id="checker">1. Accessibility Checker Scan button</h2>
                    <p>
                        The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component. For more in-depth guidance, view
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html#a11y_check")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >Accessibility Checker</Link> in the user guide.</p>

                    <p>
                        <img
                            src="assets/img/1_Checker.png"
                            alt="IBM checker tool highlighting the scan button"
                        />
                    </p>

                    <h2 id="scan">2. Create a scan report</h2>
                    <p>
                        You can generate a report for a single scan in the Checker view in both HTML and MS Excel spreadsheet formats. For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#t_single_scan_report")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >Create a scan report</Link> in
                        the user guide. 
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
                        the user guide.
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
                        the user guide.</p>
                    <p>
                        <img
                            src="assets/img/4_Focus.png"
                            alt="content switcher with two items: html and all"
                        />
                    </p>
                    <h2 id="keyboard">5. Keyboard checker mode</h2>
                    <p>
                        This mode shows a visualization of the keyboard tab order detected on the page, and elements with detectable keyboard access issues. For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#keyboard_checker_mode")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Keyboard checker mode</Link> in 
                        the user guide.
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
                    <p>Select the info icon next to ‘Keyboard tab stops’ to understand the basic functions.</p>
                    

                    <h2 id="troubleshooting">6. Troubleshooting</h2>
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
                </main>
            </DocPage>
        );
    }
}
