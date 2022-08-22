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
import enter from "../../assets/enter.svg";
import esc from "../../assets/esc.svg";
import leftRight from "../../assets/left_right.svg";
import shift from "../../assets/shift.svg";
import space from "../../assets/space.svg";
import tab from "../../assets/tab.svg";
import upDown from "../../assets/up_down.svg";

interface UsingACAppState { }

class UsingACApp extends React.Component<{}, UsingACAppState> {
    state: UsingACAppState = {};

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
                                    <a href="#install" title="How to install">
                                        1. How to install
                                    </a>
                                </li>
                                <li>
                                    <a href="#issues" title="Accessibility issues">
                                        2. Accessibility issues
                                    </a>
                                </li>
                                <li>
                                    <a href="#view" title="The checker view">
                                        3. The Checker view
                                    </a>
                                </li>
                                    <ul className="sub-menu">
                                        <li>
                                            <a href="#a11y_check" title="Accessibility Checker">
                                                3.1 Accessibility Checker
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#t_single_scan_report"
                                                title="Create scan report"
                                            >
                                                3.2 Creating a scan report
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#t_multi_scan_report"
                                                title="Create multi-scan report"
                                            >
                                                3.3 Creating a multi-scan report
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#focus_view" title="Focus view">
                                                3.4 Focus view
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#keyboard_checker_mode" title="Keyboard checker mode">
                                                3.5 Keyboard checker mode
                                            </a>
                                        </li>
                                    </ul>
                                <li>
                                    <a href="#a11y_assess" title="The Assessment view">
                                        4. Accessibility Assessment
                                    </a>
                                </li>
                                <li>
                                    <a href="#t_select_settings" title="select an option">
                                        5. Options
                                    </a>
                                </li>
                                <li>
                                    <a href="#the_report" title="accessibility checker report">
                                        6. Accessibility Checker reports{" "}
                                    </a>
                                </li>
                                <li>
                                    <a href="#a11y_considerations" title="Accessibility Considerations">
                                        7. Accessibility Considerations
                                    </a>
                                </li>
                                <li>
                                    <a href="#feedback" title="feedback">
                                        8. Feedback
                                    </a>
                                </li>
                                <li>
                                    <a href="#troubleshooting" title="troubleshooting">
                                        9. Troubleshooting
                                    </a>
                                </li>
                            </ul>
                            <div>
                            <p>For bite-sized guidance, see <a href={chrome.runtime.getURL("quickGuideAC.html")} target="_blank" rel="noopener noreferred">quick guide</a>
                            </p>
                        </div>
                        </div>
                    </Column>
                    <Column sm={{span: 6}} md={{span: 8}} lg={{span: 8}} className="rightPanel"
                        role="main"
                        aria-label="User guide details"
                    >
                        <h1>IBM Accessibility Checker user guide</h1>

                        <div className="pa">
                            <p>
                            The Accessibility Checker is a browser extension that tests web pages for accessibility issues with W3C Web Content Accessibility Guidelines (WCAG) and IBM requirements. There is a <a href={chrome.runtime.getURL("usingAC.html#view")} target="_blank" rel="noopener noreferred">Checker view</a> to find and fix issues in the code and an <a href={chrome.runtime.getURL("usingAC.html#a11y_assess")} target="_blank" rel="noopener noreferred">Assessment view</a> for an executive overview of the page. For teams seeking integrated accessibility testing, IBM offers plug-ins and modules for NodeJS and Karma that perform cross-platform testing in the build and development process. These tools use the same test engine as the Accessibility Checker.
                            </p>
                        </div>
                        <div className="pa">
                            <p>
                            <strong>Note:</strong> On rare occasions the Accessibility Checker extension does not appear in the developer tools for some sites due to a bug in the developer tools. The workaround is to go to a site where you know the checker will launch, and launch the checker in the developer tools. Then, in the same browser tab, load the site that did not launch.
                            </p>
                        </div>
                        <h2 id="install">1. How to install</h2>
                        <p>
                            <strong>Supported browsers:</strong>
                            <ul>
                                <li>Google Chrome version 81.x or later</li>
                                <li>Mozilla Firefox version 68.x or later</li>
                            </ul>
                        </p>
                        <div className="pa">
                        <p>
                        <strong>For Chrome:</strong>
                            <ol className="number">
                                <li>Open the Chrome browser.</li>
                                <li>
                                    Go to the{" "}
                                    <a
                                        target="_blank"
                                        href="https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp"
                                    >
                                        IBM Equal Access Accessibility Checker
                                    </a>{" "}
                                    in the Chrome Web Store.
                                </li>
                                <li>
                                    Click 'Add To Chrome' button.
                                </li>
                            </ol>
                        </p>
                        </div>
                        <div className="pa">
                        <p>
                        <strong>For Firefox:</strong>
                            <ol className="number">
                                <li>Open the Firefox browser</li>
                                <li>
                                    Go to the{" "}
                                    <a
                                        target="_blank"
                                        href="https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/"
                                    >
                                        IBM Equal Access Accessibility Checker
                                    </a>{" "}
                                    in Firefox Browser Add-on
                                </li>
                                <li>
                                    Click 'Add To Firefox' button
                                </li>
                            </ol>
                       </p>
                       </div>
                        <h2 id="issues">2. Accessibility issues</h2>
                        <div className="pa">
                            <p>As with any automated test tool for accessibility, these tests don’t catch all issues. Complete your accessibility testing with a {" "}
                                    <a
                                        target="_blank"
                                        href="https://www.ibm.com/able/toolkit/develop/considerations/unit-testing/"
                                    >
                                        quick unit test for accessibility
                                    </a>{" "}  or follow the <a
                                        target="_blank"
                                        href="https://www.ibm.com/able/toolkit/verify"
                                    >
                                        full accessibility test process
                                    </a>{" "}.
                            </p>
                        </div>
                        <img 
                                className="rectangle-image"
                                src="assets/img/2_A11yIssues.png"
                                alt="IBM checker tool highlighting issues filter and tab list for element roles, requirements, and rules"
                            />
                        <div className="pa">
                            <p>The issues are divided into three types:</p>
                        </div>
                        <br />
                        <ul>
                            <li className="unorder">
                                    <img
                                        src={violation}
                                        alt="violation icon"
                                    />{" "}
                                    <strong> Violation</strong> - failures that need
                                    to be corrected
                            </li>
                            <li className="unorder">
                                    <img
                                        src={needsReview}
                                        alt="needs review icon"
                                    />{" "}
                                    <strong> Needs review</strong> - need manual review to identify if it's a violation
                            </li>
                            <li className="unorder">
                                    <img
                                        src={recommendation}
                                        alt="recommendation icon"
                                    />{" "}
                                    <strong> Recommendation</strong> - opportunities to apply best practices
                            </li>
                        </ul>
                        <div className="pa">
                        <p>
                        There are three ways to view the same set of issues:
                        </p>
                        </div>
                        <div className="pa">
                               <p>
                                <strong>Element roles</strong> – issues are organized by the WAI-ARIA roles of the DOM elements. This view shows both implicit and explicit roles, and not the element names. Use this view to explore issues within a specific element and its children.
                                </p>
                        </div>
                        <div className="pa">
                                <p>
                                <strong>Requirements</strong> – issues are mapped to the most relevant IBM requirement, which corresponds to the WCAG 2.1 standards. Use this view to classify and report issues.
                                </p>
                        </div>
                        <div className="pa">
                                <p>
                                    <strong>Rules</strong> - issues organized by rules in the rule set. Use this view to see the different types of issues at once.
                                </p>
                        </div>

                        <h2 id="view">3. The Checker view</h2>
                        <div className="pa">
                            <p>The Accessibility Checker tab in the Elements panel in Chrome or the Inspector panel in Firefox is a code scanner for developers looking to find and fix issues in code and on the page quickly.</p>
                        </div>
                        <div className="pa">
                            <p>To use the Checker view, do one of the following:</p>
                        </div>
                        <br />
                        <ul>
                            <li className="abc"><strong>For Chrome:</strong>
                                <ol className="alpha">
                                    <li  className="abc">From the browser ‘View’ menu, select ‘Developer’</li>
                                    <li  className="abc">Select ‘Developer tools’</li>
                                </ol>
                            </li>
                            <br />
                            <li className="abc"><strong>For Firefox: </strong>
                                <ol className="alpha">
                                    <li className="abc">From the browser ‘Tools‘ menu, select ‘Web Developer’</li>
                                    <li className="abc">Select ‘Toggle Tools’</li>
                                </ol>
                            </li>
                            <br />
                            
                            <li className="abc"><p><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</p></li>
                            <li className="abc"><p>Right-click web page, select ‘<strong>Inspect</strong>’ (Chrome) or ‘<strong>Inspect Element</strong>’ (Firefox)</p></li>
                        </ul>
                        <h3 id="a11y_check">3.1 Accessibility Checker</h3>
                            <p>
                            The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component.     
                            </p>
                            <img 
                                className="fullWidth-image"
                                src="assets/img/3.1Checker1.png"
                                alt="Developer tools with 'elements tab', 'accessibility checker tab', and scan button highlighted and numbered 1 to 3"
                            />
                        <div className="pa">
                        <ol className="number">
                            <li className="numbers">Open ‘Elements’ panel (Chrome) or ‘Inspector’ panel (Firefox)</li>
                            <li className="numbers">Select 'Accessibility Checker' from the tabs in the right-hand panel</li>
                            <li className="numbers">Click the ‘Scan’ button to scan web page</li>
                        </ol>
                        </div>
                        <img 
                                className="fullWidth-image"
                                src="assets/img/3.1Checker2.png"
                                alt="IBM checker tool highlighting issues filter and tab list for element roles requirements and rules"
                            />
                            <div className="pa">
                                <p>
                                The scan results show the total number of issues divided by types. The same set of issues can also be viewed by element roles, requirements, and rules.   
                                </p>
                        </div>
                            <img 
                                className="fullWidth-image"
                                src="assets/img/3.1Checker3.png"
                                alt="IBM Checker tool highlighting list for element roles, requirements, and rules, an expand icon, and a 'learn more' link text"
                            />
                        <div className="pa">
                                <p>View issues by element roles, requirements, or rules and select the expand icon next to an element role/requirement/rule to see the related issues. Click on the ‘learn more’ link to view detailed information and how to fix it. </p>
                        </div>
                        <img 
                                className="fullWidth-image"
                                src="assets/img/3.1Checker4.png"
                                alt="browser highlighting search bar on page, an element in the DOM,and related issues in the checker tool"
                            />
                        <div className="pa">
                                <p>Select an element in the Checker, in the DOM, or use the ‘Inspect element’ command on the web page for the Checker to:</p>
                        </div>
                        <ul>
                            <li className="unorder"><p>Show number of issues of each type within selected element and its children</p></li>
                            <li className="unorder"><p>Open and highlight all issues in element, if any (dark purple highlight)</p></li>
                            <li className="unorder"><p>Open and highlight all issues in element’s children, if any (light purple highlight)</p></li>
                            <li className="unorder"><p>Show the same set of highlighted issues in the different tabs</p></li>
                        </ul>
                        <div className="pa">
                            <p><strong>Hidden content scanning</strong></p>
                            <p>
                            By default, the Checker skips hidden content (Web pages that use the visibility:hidden or display:none elements). If this content is revealed to users at any point, you must include the content in your test plan. Ensure the tests trigger the display of hidden content for the Checker to test.
                            </p>
                        </div>
                        <div className="pa">
                            <p>
                            <strong>Scan local files</strong>
                            The Checker is able to scan local .html or .htm files launched in the Firefox browser by default. Follow the steps below to allow scanning of local .html or .htm files in the Chrome browser:
                            </p>
                        </div>
                        <ol className="number">
                            <li className="numbers"><p>Open Chrome browser</p></li>
                            <li className="numbers"><p>Open the 'Window' menu</p></li>
                            <li className="numbers"><p>Select 'Extensions' menu option to see all installed extensions</p></li>
                            <li className="numbers"><p>Click 'Details' button of the IBM Accessibility Checker extension</p></li>
                            <li className="numbers"><p>Scroll down and turn on 'Allow access to file URLs'</p></li>
                        </ol>

                        <h3 id="t_single_scan_report">3.2 Create a scan report</h3>
                            <p>
                            To generate a report for a single scan in the Checker view:    
                            </p>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.2Report.png"
                                alt="an open dropdown menu with focus on 'download current scan'."
                            />
                        <div className="pa">
                                <p>Open the ‘Reports’ dropdown menu and select ‘Download current scan.’ See <a href="#the_report" title="Accessibility Checker">Accessibility Checker reports </a>for more details.</p>
                        </div>
                        <h3 id="t_multi_scan_report">3.3 Create a multi-scan report</h3>
                            <p>
                            To combine up to 50 multiple scans into a single report:     
                            </p>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.3Multi1.png"
                                alt="an open dropdown menu with focus on 'start storing scans'"
                            />
                        <div className="pa">
                                <p>1. Open the ‘Reports’ dropdown menu and select ‘Start storing scans.'</p>
                        </div>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.3Multi2.png"
                                alt="status bar that says 'status:storing, 3 scans stored'"
                            />
                        <div className="pa">
                                <p>2. Scan desired pages, and the number of stored scans will show below scan button.</p>
                        </div>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.3Multi3.png"
                                alt="an open dropdown menu with focus on 'download stored scans"
                            />
                        <div className="pa">
                                <p>3. Open the ‘Reports’ dropdown menu and select ‘Download stored scans.’</p>
                        </div>
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.3Multi4.png"
                                alt="a table showing a list of stored scans"
                            />
                        <div className="pa">
                                <p>You can open the ‘Reports’ dropdown menu and select ‘View stored scans’ to:</p>
                        </div>
                        <ul>
                            <li className="unorder">Select or unselect scans you want in the report with the checkboxes</li>
                            <li className="unorder">Select all scans with the checkbox in the first column of the header row</li>
                            <li className="unorder">Edit scan labels to differentiate the scans</li>
                            <li className="unorder">Select ‘Download’ in the header row to download the multi-scan report</li>
                            <li className="unorder">Select ‘Back to list view’ to return to main Checker view</li>
                        </ul>

                        <h3 id="focus_view">3.4. Focus view</h3>
                            <p>
                            The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM.    
                            </p> 
                        <img 
                                className="rectangle-image"
                                src="assets/img/3.4Focus.png"
                                alt="content switcher with two items: html and alt"
                            />
                        <div className="pa">
                        <ol className="number">
                            <li className="numbers"><p>Select an element in the DOM, or use the ‘Inspect element’ command on page.</p></li>
                            <li className="numbers"><p>Select element name in focus view (e.g. &lt;html&gt;) to view related issues</p></li>
                            <li className="numbers"><p>Select ‘All’ in the focus view to see all issues again</p></li>
                        </ol>
                        </div>
                        <h3 id="keyboard_checker_mode">3.5. Keyboard checker mode</h3>
                            <p>
                            This mode shows a visualization of the keyboard tab order detected on the page, and elements with detectable keyboard access issues. Use this for manual keyboard accessibility testing.   
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
                        <div className="pa">
                            <p><strong>Manual keyboard testing</strong></p>
                            <p>Automated tools can’t find all keyboard access issues. Using the visualization, test for basic keyboard navigation:</p>
                        </div>
                        <div className="pa">
                        <ol className="number">
                            <li className="numbers"><p>Make sure every interactive element is a tab stop*</p>
                                <ol className="alpha">
                                    <li className="indent"><p>No tab stops on non-interactive or non-visible elements**</p></li>
                                    <li className="indent"><p>Tab order matches the visual flow of the page</p></li>
                                    <li className="indent"><p>Inspect elements with found issues (select the triangle icons)</p></li>
                                </ol>
                            </li>
                            <br />
                            <li className="numbers">Test interactive elements
                                <ol className="alpha">
                                    <li className="indent"><p>Start from browser URL bar, or click just above the part of page of interest</p></li>
                                    <li className="indent"><p>Press tab key to move keyboard focus through interactive elements</p></li>
                                    <li className="indent"><p>You shouldn’t get stuck in a keyboard trap (try the Esc key)</p></li>
                                    <li className="indent"><p>Operate the controls using standard keys</p></li>
                                    <li className="indent"><p>Focus should not jump to an unexpected place when operating controls</p></li>
                                    <li className="indent"><p>When dismissing or deleting items, focus should move to sensible location</p></li>
                                </ol>
                            </li>
                        </ol>
                        </div>
                        <div className="pa">
                        <p>* It may be acceptable to skip interactive elements if the UI provides another keyboard accessible way to perform the same function</p>
                        </div>
                        <div className="pa">
                        <p>** It may be acceptable if the first tab stop of the page is “skip to main content” link that is not visible until it has keyboard focus</p>
                        </div>
                        <div className="pa">
                        <p><strong>Keys to use for testing</strong></p>
                        </div>
                        <ul>
                        <li className="unorder">
                                <p>
                                    <img
                                        src={tab}
                                        alt="tab key"
                                    />{" "}
                                    moves to next interactive element 
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={shift}
                                        alt="shift key"
                                    />{" "}
                                    +
                                    <img
                                        src={tab}
                                        alt="tab key"
                                    />{" "}
                                    moves to previous interactive element
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={enter}
                                        alt="enter key"
                                    />{" "}
                                    activates a link, button, or menu
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={space}
                                        alt="space key"
                                    />{" "}
                                 selects or unselects a form element, or activates button/dropdown menu   
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={upDown}
                                        alt="up and down arrow keys"
                                    />{" "}
                                   moves between radio buttons or menu items, and scrolls page vertically
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={leftRight}
                                        alt="left and right arrow keys"
                                    />{" "}
                                   may move between tab or menu items, scroll horizontally, and adjust sliders
                                </p>
                            </li>
                            <li className="unorder">
                                <p>
                                    <img
                                        src={esc}
                                        alt="esc keys"
                                    />{" "}
                                   closes modal dialog or dropdown menu
                                </p>
                            </li>
                        </ul>
                        <div className="pa">
                        <p>
                        Additional keystrokes are defined for particular widgets within the <a href="https://www.w3.org/TR/wai-aria-practices/">W3C WAI-ARIA Authoring Practices Design Patterns</a>.    
                        </p></div>

                        <h2 id="a11y_assess">4. The Assessment view</h2>
                        <div className="pa">
                            <p>
                            The Assessment view provides a simplified overall summary, with explanations for each issue. It has less functionality than the Checker view.   
                            </p>
                        </div>
                        <div className="pa">
                            <p>
                             To use the Assessment view, do one of the following: 
                            </p>
                        </div>
                        <br />
                        <ul>
                            <li className="abc"><p><strong>For Chrome:</strong></p>
                                <ol className="alpha">
                                    <li  className="abc"><p>From the browser ‘View’ menu, select ‘Developer’</p></li>
                                    <li  className="abc"><p>Select ‘Developer tools’</p></li>
                                </ol>
                            </li>
                            <br />
                            <li className="abc"><p><strong>For Firefox:</strong></p>
                                <ol className="alpha">
                                    <li className="abc"><p>From the browser ‘Tools‘ menu, select ‘Web Developer’</p></li>
                                    <li className="abc"><p>Select ‘Toggle Tools’</p></li>
                                </ol>
                            </li>
                            <br />
                            <li className="abc"><p><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</p></li>
                            <li className="abc"><p>Right-click web page, select ‘<strong>Inspect</strong>’ (Chrome) or ‘<strong>Inspect Element</strong>’ (Firefox)</p></li>
                        </ul>
                        <div className="pa">
                        <ol className="number">
                            <li className="numbers"><p>Select the 'Accessibility Assessment' panel</p></li>
                            <li className="numbers"><p>Click the ‘Scan’ button to scan web page</p></li>
                        </ol>
                        </div>
                        <img 
                                className="fullWidth-image2"
                                src="assets/img/4_A11yAssess.png"
                                alt="IBM Checker tool's accessibility assessment view"
                            />
                        <div className="pa">
                                <p>The left panel shows scan results with total number of issues divided by category, and the right panel shows the report summary.</p>
                        </div>
                        <img 
                                className="fullWidth-image2"
                                src="assets/img/4_A11yAssess2.png"
                                alt="IBM Checker tool's accessibility assessment view highlighting an issue and showing issue details"
                            />
                        <div className="pa">
                                <p>View the issues by element roles, requirements, or rules and select the expand icon next to a requirement/element role/rule to see the related issues, and select an issue to see the detailed description in the right panel. </p>
                        </div>
                        <img 
                                className="fullWidth-image"
                                src="assets/img/4_A11yAssess3.png"
                                alt="IBM Checker tool's accessibility assessment view highlighting the 'reports' icon button"
                            />
                        <div className="pa">
                                <p>Select the ‘Reports’ icon to download a generated accessibility report. See <a href="#the_report">Accessibility Checker reports</a> for more details.</p>
                        </div>

                        <h2 id="t_select_settings">5. Options</h2>
                        <div className="pa">
                        <p>
                        By default, the IBM Accessibility Checker uses the latest deployment with a set of rules that correspond to the most recent WCAG standards, plus additional IBM requirements. Use the options page to change the default rule set for a supported standard or a date of rule set deployment. 
                        </p>
                        </div>

                        <div className="pa">
                        <p>
                        To open the options page: 
                        </p>
                        </div>
                        <div className="pa">
                        <ol className="number">
                            <li>
                                <p>
                                    In the browser tool bar, select the IBM Equal Access
                                    Accessibility Checker icon as shown {" "}
                                    <img
                                        src={beeLogoUrl}
                                        width="16px"
                                        height="16px"
                                        alt="Accessibility checker application icon"
                                    />
                                    . This will usually be located in the upper right of the
                                    browser window. 
                                </p>
                            </li>
                            <br />
                            <li>
                                <p>
                                In the overlay that appears, select 'Options’ and the options will open in a new browser tab. 
                                <strong> Note:</strong> In Firefox, the Options page may fail to open if the Enhanced Tracking Protection option is set to Strict. To avoid this, change the browser privacy settings to Standard. 
                                </p>
                            </li>
                        </ol>
                        </div>
                        <div className="pa"></div>
                        <p>
                            <img
                                src="assets/img/5_Options.png"
                                alt="IBM checker's options page with a 'rule sets' heading and 2 dropdown menus: 'select a rule set deployment date' and 'select accessibility guidelines'"
                                width="100%"
                                height="100%"
                            />
                        </p>

                        <h3 id="rule_deploy">Rule sets</h3>
                        <p>
                        Rule sets with rules that map to specific WCAG versions are available. These rule sets are updated regularly and each update has a date of deployment. For consistent testing throughout a project, choose a specific date deployment. To replicate an earlier test, choose the deployment date of the original test.  
                        </p>
                        <div className="pa">
                            <p>
                            Options from 'Select a rule set deployment date' dropdown:
                            </p>
                        </div>
                        <div className="pa">
                        <ul>
                            <li>
                                <p>
                                    <strong>Latest Deployment</strong> - the latest version of the
                                    selected rule set(default option)
                                </p>
                            </li>
                            <li>
                                <p>
                                    <strong>&lt;date&gt; Deployment</strong> - the rule set from a specific date
                                </p>
                            </li>
                            <li>
                                <p>
                                    <strong>Preview Rules</strong> - try an experimental preview of a possible future rule set
                                </p>
                            </li>
                        </ul>
                        </div>
                        <div className="pa">
                        <p>
                        Options from 'Select accessibility guidelines' dropdown:  
                        </p>
                        </div>
                        <div className="pa">
                        <ul>
                            <li>
                                <p>
                                    <strong>IBM Accessibility</strong> - WCAG 2.1 (A, AA) and IBM requirements (default option)
                                </p>
                            </li>
                            <li>
                                <p>
                                    <strong>WCAG 2.1 (A,AA)</strong> - WCAG 2.0. and EN 301 549 standards (W3C’s choice)
                                </p>
                            </li>
                            <li>
                                <p>
                                    <strong>WCAG 2.0 (A,AA)</strong> - referenced by US Section 508 
                                </p>
                            </li>

                            <li>
                                <p>
                                    <strong>IBM Accessibility BETA</strong> - WCAG 2.1, IBM requirements, and experimental rules
                                </p>
                            </li>

                        </ul>
                        </div>
                        <div className="pa">
                        <p>
                        Click the 'Save' button to keep the changes or the 'Reset' button to discard changes. Close and reopen the developer tools for the change to take effect.
                        </p>
                        </div>

                        <h3 id="rule_deploy">Keyboard checker mode</h3>
                        <p>
                        By default, the keyboard visualization options has the 'Lines connecting tab stops'  checkbox selected. Select the 'Element outlines' checkbox to see bounding boxes for each interactive element in the tab order.
                        </p>
                        <br />
                        <p>
                        The 'Alert notifications' toggles on and off the pop-up notification that appears every time you turn on the keyboard checker mode.
                        </p>

                        <h2 id="the_report">6. Accessibility Checker reports</h2>
                        <div className="pa">
                            <p>
                            Single scan reports are provided in both HTML and MS Excel spreadsheet formats. Multi-scan reports are available only in MS Excel spreadsheet format. For how to generate reports, see 3.2 Create a scan report and 3.3 Create a multi-scan report.
                            </p>
                        </div>
                        <div className="pa">
                            <p><strong>
                                HTML reports
                            </strong>
                            </p>
                            <p>
                            This interactive report is an HTML file that includes:
                            </p>
                        </div>
                            <img
                                className="rectangle-image"
                                src="assets/img/7_1_Report.png"
                                alt="an HTML page for 'IBM accessibility equal access toolkit: accessibility checker report'"
                            />
                        <div className="pa">
                        <ol className="number">
                            <li className="numbers">The scan date and time</li>
                            <li className="numbers">The scanned URL</li>
                            <li className="numbers">Percentage of elements with no detected violations or items to review</li>
                            <li className="numbers">A summary of test results </li>
                            <li className="numbers">Issue details organized by requirements, element roles, and rules</li>
                            <li className="numbers">‘Learn more’ link with detailed description for each issue</li>
                        </ol>
                        </div>
                        <div className="pa">
                            <p><strong>
                            Important Note: 
                            </strong>
                            This percentage is based on automated tests only. Be sure to perform additional reviews and manual tests to complete the accessibility assessments. Use the IBM Equal Access Toolkit as a guide.
                            </p>
                        </div>
                        <h3 id="t_excel_report">MS Excel Spreadsheet report</h3>
                        <p>
                        Both single scans or multiple scans can generate a five sheet spreadsheet report.
                        </p>
                        <img
                                className="rectangle-image"
                                src="assets/img/7.1Report.png"
                                alt="an excel spreadsheet of an accessibility scan report"
                            />
                        <div className="pa">
                        <ol className="number">
                            <li>
                                <p>
                                    <strong>Overview</strong> includes the name of the tool with its version, the scan date,
                                    ruleset, guidelines and platform used for the scan, and a summary of the overall results across all included scans.
                                </p>
                            </li>
                            <br />
                            <li>
                                <p>
                                    <strong>Scan summary</strong> provides an overview of the set of scans within the report.
                                </p>
                            </li>
                            <br />
                            <li>
                                <p>
                                    <strong>Issue Summary</strong> provides an overview of the issues found across all the scans.
                                    Issues are summarized in a prioritized order, starting with Level 1 items,
                                    as defined in the IBM Equal Access Toolkit, followed by Level 2 and Levels 3
                                    and 4.  Levels 1-3 are necessary to complete the IBM requirements. Within each
                                    level, the summary lists issues that are Violations, items that Need Review,
                                    and Recommendations. Counts are provided for each type of issue.
                                </p>
                            </li>
                            <br />
                            <li>
                                <p>
                                    <strong>Issues</strong> has the details of the individual issues. This includes the scan label
                                    assigned to the scan, an ID for each issue, relevant accessibility requirements,
                                    and toolkit levels.
                                </p>
                            </li>
                            <br />
                            <li>
                                <p>
                                    <strong>Definition of fields</strong> defines the columns in the other sheets.
                                </p>
                            </li>
                        </ol>
                        </div>
                        <div className="pa">
                            <p>
                        <strong>Important note:</strong> If the same page is scanned multiple times in a multi-scan report, there may be duplicate issues, which can be identified by having the same Issue ID. If a template or reused component has issues, these will also be repeated in the report, but may have different Issue IDs.
                        </p>
                        </div>

                        <h2 id="a11y_considerations">7. Accessibility considerations</h2>
                        <div className="pa">
                            <p>
                            Highlighted below are several accessibility features for adaptability and to ensure ease of access to the Checker functionality, including with keyboard or with a screen reader:
                            </p>
                        </div>

                        <div className="pa">
                        <ol className="number">
                            <li className="numbers">The Accessibility Checker is responsive to users’ preferred font size and colors.</li>
                            <li className="numbers">
                            The tool is fully keyboard accessible, tab order is as follows: 
                            <br />
                                <ol className="alpha">
                                    <li className="abc">‘Scan’ button </li>
                                    <li className="abc">‘Reports’ dropdown menu</li>
                                    <li className="abc">
                                        <p>‘Focus view’ switcher,
                                            <img
                                                src={leftRight}
                                                alt="left right arrow keys"
                                                />{" "} toggles
                                        </p>
                                    </li>
                                    <li className="abc">   
                                        <p>Issue filter checkboxes, 
                                            <img
                                                src={enter}
                                                alt="enter key"
                                                />{" "}  selects checkbox
                                        </p></li>
                                    <li className="abc">
                                        <p>Issue view tab list, <img
                                                src={leftRight}
                                                alt="left right arrow keys"
                                                />{" "} navigates between tabs 
                                        </p>
                                    </li>             
                                    <li className="abc">Issue groupings associated with each requirement (element role or rule)</li>
                                        <ul>
                                            <li className="indent">
                                                <p>
                                                <img
                                                    src={enter}
                                                    alt="enter key"
                                                    />{" "}
                                                opens/closes issue grouping
                                                </p> 
                                            </li>
                                            <li className="indent">
                                                <p>
                                                within open grouping, 
                                                <img
                                                    src={tab}
                                                    alt="tab key"
                                                    />{" "}
                                                to navigate to each issue
                                                </p> 
                                            </li>
                                            <li className="indent">
                                                <p>
                                                <img
                                                    src={enter}
                                                    alt="enter key"
                                                    />{" "}
                                                selects issue
                                                </p> 
                                            </li>
                                        </ul>
                                    <li className="abc">‘Learn more’ link or the next issue</li>
                                </ol> 
                                <br />
                            </li>
                            <li className="abc">Use the heading hierarchy or implemented landmarks to navigate:</li>
                            <br />
                            <div className="pa">
                            <ul>
                                <li>The Assessment or Checker view’s main landmark includes:
                                <br />
                                <div className="pa">
                                    <ul className="dashed">
                                        <li className="dashed"><p>- <strong>Issue count</strong> region (by issue type and the total number of issues found)</p></li>
                                        <li className="dashed"><p>- <strong>Issue list</strong> region (issues grouped by element roles/requirements/rules)</p></li>
		                                <li className="dashed"><p>- In the Checker view, the main landmark also contains issue help and the overview of stored scans, when those are requested by the user</p></li>
                                    </ul>
                                </div>
                                </li>
                                <br />
                                <li><p>The Assessment view <strong>Scan Summary</strong> aside or the complementary landmark contains the scan summary, after the scan completes or shows the issue help when any issue is selected.</p></li>
                                <br />
                                <li><p>The Assessment view <strong>Issue Help</strong> aside or the complementary landmark contains the issue help when any issue is selected.</p></li>
                            </ul>
                            </div>
                        </ol>
                        </div>

                        <h2 id="feedback">8. Feedback</h2>
                        <div className="pa">
                            Visit the{" "}
                            <a href="https://github.com/IBMa/equal-access/issues">
                                Equal Access git repository</a> to:
                                <br /><br />
                            <ul>
                                <li className="unorder">
                                    <p>
                                        report a problem with the tool
                                    </p>
                                </li>
                                <li className="unorder">
                                    <p>
                                        report a problem with the checker rules or accuracy of the errors reported by the tool
                                    </p>
                                </li>
                                <li className="unorder">
                                    <p>
                                        find information on any existing issues
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <h2 id="troubleshooting">9. Troubleshooting</h2>
                            <p>
                            If the Accessibility Checker appears unresponsive:
                            <br /><br />
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

export default UsingACApp;
