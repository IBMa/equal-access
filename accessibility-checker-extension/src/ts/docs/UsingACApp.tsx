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
import beeLogoDark from "../../assets/BE_for_DarkMode.svg";
import beeLogoLight from "../../assets/BE_for_LightMode.svg";
import { BrowserDetection } from '../util/browserDetection';
import violation from "../../assets/Violation16.svg";
import needsReview from "../../assets/NeedsReview16.svg";
import recommendation from "../../assets/Recommendation16.svg";
import ViewOff16current from "../../assets/img/View--off-currentcolor.svg"; //test media dark and applies styler dark
// import ViewOff16 from "../../assets/img/View--off-purple.svg"; //trying purple on both dark and light
// import ViewOn16 from "../../assets/img/View--on.svg";
import tabStop from "../../assets/tab_stop.svg";
import tabStopChainError from "../../assets/tabStopChainError.svg";
import tabStopError from "../../assets/tabStopError.svg";
import enter from "../../assets/OGkeys/enterOG.svg"; // ___OG.svg images @media (prefers-color-scheme: dark) {path { fill: white; }
import esc from "../../assets/OGkeys/escOG.svg"; // @media 
import leftRight from "../../assets/OGkeys/left_rightOG.svg"; // @media
import shift from "../../assets/OGkeys/shiftOG.svg"; // @media 
import space from "../../assets/OGkeys/spaceOG.svg"; // @media
import tab from "../../assets/OGkeys/tabOG.svg"; // @media
import upDown from "../../assets/OGkeys/up_downOG.svg"; // @media
import { DocPage } from "./components/DocPage";
import "./usingAC.scss";
import { Link, ListItem, OrderedList, UnorderedList } from "@carbon/react";
// import { LibraryTemplatePlugin } from "webpack";

interface UsingACAppState { }

class UsingACApp extends React.Component<{}, UsingACAppState> {
    state: UsingACAppState = {};

    render() {
        let aside = (<>
            <div style={{ marginTop: "1.5rem" }} />
            <OrderedList>
                <ListItem><Link href="#install">How to install</Link></ListItem>
                <ListItem><Link href="#issues">Accessibility issues</Link></ListItem>
                <ListItem><Link href="#view">The Checker view</Link>
                    <UnorderedList>
                        <ListItem><Link href="#a11y_check">3.1 Scanning</Link></ListItem>
                        <ListItem><Link href="#local_files">3.2 Scan local files</Link></ListItem>
                        <ListItem><Link href="#sync">3.3 Synchronize views</Link></ListItem>
                        <ListItem><Link href="#t_single_scan_report">3.4 Create a scan report</Link></ListItem>
                        <ListItem><Link href="#t_multi_scan_report">3.5 Create a multi-scan report</Link></ListItem>
                        <ListItem><Link href="#focus_view">3.6 Focus view</Link></ListItem>
                        <ListItem><Link href="#filter_views">3.7 Filter views</Link></ListItem>
                        <ListItem><Link href="#hide_issues">3.8 Show/Hide issues</Link></ListItem>
                        <ListItem><Link href="#keyboard_checker_mode">3.9 Keyboard checker mode</Link></ListItem>
                    </UnorderedList>
                </ListItem>
                <ListItem><Link href="#a11y_assess">The Assessment view</Link></ListItem>
                <ListItem><Link href="#t_select_settings">Settings</Link></ListItem>
                <ListItem><Link href="#the_report">Checker reports</Link></ListItem>
                <ListItem><Link href="#a11y_considerations">Accessibility features</Link></ListItem>
                <ListItem><Link href="#feedback">Feedback</Link></ListItem>
                <ListItem><Link href="#troubleshooting">Troubleshooting</Link></ListItem>
            </OrderedList>
            <p>For bite-sized guidance, see the <Link inline={true} size="lg" href={chrome.runtime.getURL("quickGuideAC.html")} target="_blank" rel="noopener noreferred">Quick guide</Link>
            </p>
            {/* </Theme> */}
            </>)

        return (
            
            <DocPage aside={aside} sm={4} md={8} lg={8}>
            <main
                aria-label="User guide details"
            >
                <h1>User guide - IBM Accessibility Checker</h1>
                <p>
                    The IBM Equal Access Toolkit: Accessibility Checker ("<strong>the Checker</strong>") tests web pages for accessibility issues with
                    W3C Web Content Accessibility Guidelines (WCAG 2.2), IBM Accessibility requirements, and other standards.
                    The Checker is <Link 
                        href="https://www.ibm.com/able/toolkit/tools/#develop" target="_blank" rel="noopener noreferred" inline={true}
                        size="lg">also available as a Node package</Link> for automated testing within a continuous integration / continuous delivery (CI/CD) pipeline. 
                    The Checker rules include explanations and help for suggested fixes.
                </p>
                <UnorderedList>
                    <ListItem><strong>Chrome browser extension</strong>: integrates automated accessibility checking capabilities into the Chrome Developer Tools</ListItem>
                    <ListItem><strong>Firefox browser add-ons</strong>: integrates automated accessibility checking capabilities into the Firefox Web Developer Tools</ListItem>
                    <ListItem><strong>Edge browser add-ons</strong>: integrates automated accessibility checking capabilities into the Edge Developer Tools</ListItem>
                    <ListItem><strong>Node accessibility-checker</strong>: automated accessibility testing within a continuous integration pipeline, such as Travis CI for Node-based test environments, 
                        such as Selenium, Puppeteer, Playwright, and Zombie; the ability to validate results against baseline files and scan local files</ListItem>
                    <ListItem><strong>Karma-accessibility-checker</strong>: automated accessibility testing for the Karma environment</ListItem>
                    <ListItem><strong>Cypress-accessibility-checker</strong>: wrapper of the accessibility-checker in the Cypress environment</ListItem>
                </UnorderedList>
                <p>
                    The CI/CD packages use the same engine and rules as the browser extensions, 
                    making it easy to replicate finding issues in either environment when the Rule set settings are similar.
                </p>

                <h2 id="install">1. How to install</h2>
                <p>
                    Each supported browser comes with DevTools pre-installed, simplifying the installation and integration with the Checker.
                    New users should become familiar with DevTools and its features and settings by visiting the documentation: 
                </p>
                <UnorderedList>
                    <ListItem>Google Chrome and <Link  inline={true} size="md" href="https://developer.chrome.com/docs/devtools/" target="_blank" rel="noopener noreferred">Chrome DevTools</Link></ListItem>
                    <ListItem>Mozilla Firefox and <Link inline={true}  size="md" href="https://firefox-source-docs.mozilla.org/devtools-user/" target="_blank" rel="noopener noreferred">Firefox DevTools</Link></ListItem>
                    <ListItem>Microsoft Edge and <Link inline={true} size="md" href="https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/landing/" target="_blank" rel="noopener noreferred">Edge DevTools</Link></ListItem>
                </UnorderedList>
                
                <h3 id="for_chrome">Install for Chrome:</h3>
                <OrderedList>
                    <ListItem>Open the Chrome browser</ListItem>
                    <ListItem>
                        Go to the{" "}
                        <Link
                            target="_blank" inline={true}
                            href="https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp"
                            >IBM Equal Access Accessibility Checker
                        </Link>{" "}
                        in the Chrome Web Store
                    </ListItem>
                    <ListItem>
                        Press 'Add To Chrome' button
                    </ListItem>
                </OrderedList>

                <h3 id="for_firefox">Install for Firefox:</h3>
                <OrderedList>
                    <ListItem>Open the Firefox browser</ListItem>
                    <ListItem>
                        Go to the{" "}
                        <Link
                            target="_blank" inline={true}
                            href="https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/"
                            >IBM Equal Access Accessibility Checker
                        </Link>{" "}
                        in Firefox Browser Add-ons
                    </ListItem>
                    <ListItem>
                        Press 'Add To Firefox' button
                    </ListItem>
                </OrderedList>

                <h3 id="for_edge">Install for Edge:</h3>
                <OrderedList>
                    <ListItem>Open the Edge browser</ListItem>
                    <ListItem>
                        Go to the{" "}
                        <Link
                            target="_blank" inline={true}
                            href="https://microsoftedge.microsoft.com/addons/detail/ibm-equal-access-accessib/ompccpejakabkmfepbijnagedbdfldka"
                            >IBM Equal Access Accessibility Checker
                        </Link>{" "}
                        in Microsoft Edge Add-ons
                    </ListItem>
                    <ListItem>
                        Press 'Add To Edge' button
                    </ListItem>
                </OrderedList>

                <h3 id="layout">DevTools layout and settings</h3>
                <p>
                    The Checker is a “<strong>DevTools</strong>” extension that includes an <Link 
                        inline={true} size="lg" href="#view">Accessibility Checker</Link> tab to 
                    find and fix issues in the code and an <Link 
                        inline={true} size="lg" href="#a11y_assess">Accessibility Assessment</Link> tab for 
                    an executive summary of the page.
                    The DevTools settings affect the layout and appearance of the Checker:
                </p> 
                <OrderedList>
                    <ListItem><strong>Dock side</strong> settings affect the layout:
                        <UnorderedList>
                            <ListItem>Dock to the right</ListItem>
                            <ListItem>Dock to the left</ListItem>
                            <ListItem>Dock to the bottom</ListItem>
                        </UnorderedList>
                    </ListItem>    
                    <ListItem><strong>Appearance</strong> settings are supported:
                        <UnorderedList>
                            <ListItem><strong>Theme</strong>: System preferences (recommended), Dark, and Light</ListItem>
                            <ListItem><strong>Panel Layout</strong>: horizontal, vertical, and auto</ListItem>
                        </UnorderedList>
                    </ListItem>
                </OrderedList>
                <p>
                    For example, the screenshots in this User guide use 'Dock to the right', 'System preferences' with 'Dark' theme, and ‘horizontal’ panel layout. 
                    Experienced DevTools users will appreciate the power and functionality that the integration provides. 
                    All users may want to experiment with the 'Dock side' and 'Appearance' settings to take advantage of their own screen size and user preferences. 
                </p>
        
                <h2 id="issues">2. Accessibility issues</h2>
                <p>
                    As with any automated test tool for accessibility, these tests don’t catch all issues. 
                    Complete the accessibility testing with {" "}
                    <Link
                        target="_blank" inline={true} size="lg"
                        href="https://www.ibm.com/able/toolkit/develop/considerations/unit-testing/"
                    >
                        developer unit testing
                    </Link>{" "}  and follow all the <Link
                        target="_blank" inline={true} size="lg"
                        href="https://www.ibm.com/able/toolkit/verify"
                    >
                        steps in the Verify phase
                    </Link>{" "} in the IBM Equal Access Toolkit.

.
                </p>
                <p>
                    <img
                        src="assets/img/1_RoleFilters.png" //was 2_A11yIssues.png
                        alt="Checker highlighting issues found, filters, and dropdown for Element roles, Requirements, and Rules"
                    />
                </p>
                <p>The issues are divided into three types:</p>
                <UnorderedList>
                    <ListItem>
                        <img
                            src={violation}
                            alt="violation icon"
                        />{" "}
                        <strong> Violation</strong> - failures that need to be corrected
                    </ListItem>
                    <ListItem>
                        <img
                            src={needsReview}
                            alt="needs review icon"
                        />{" "}
                        <strong> Needs review</strong> - review to confirm that it's not a violation
                    </ListItem>
                    <ListItem>
                        <img
                            src={recommendation}
                            alt="recommendation icon"
                        />{" "}
                        <strong> Recommendation</strong> - opportunities to apply best practices
                    </ListItem>
                    <ListItem>
                        <img
                            src={ViewOff16current}
                            alt="hide icon" // added via import
                        />
                        {" "}
                        <strong> Hidden</strong> - issues to be ignored or have been resolved
                        </ListItem>
                </UnorderedList>
                <p>There are three (3) ways to organize and group the set of issues detected:</p>
                    <UnorderedList>
                        <ListItem>by <strong>Element roles</strong> – issues are organized by the ARIA roles of the Document Object Model (DOM) elements. This view shows both implicit and explicit roles, and not the element names. Use this view to explore issues within a specific element role and its children. (default)</ListItem>
                        <ListItem>by <strong>Requirements</strong> – issues are mapped to the most relevant IBM requirement, which corresponds to the WCAG standards. Use this view to classify and report issues.</ListItem>
                        <ListItem>by <strong>Rules</strong> - issues organized by rules in the rule set. Use this view to see all the issues common to a rule at once.</ListItem>
                    </UnorderedList>
                <p>There are four (4) ways to further filter one or more <strong>types</strong> of issues detected:</p>
                    <UnorderedList>
                        <ListItem><strong>Violations</strong> – failures that need to be corrected (default checked)</ListItem>
                        <ListItem><strong>Needs review</strong> – review to confirm that it's not a violation (default checked)</ListItem>
                        <ListItem><strong>RecommendationsRules</strong> - opportunities to apply best practices (default checked)</ListItem>
                        <ListItem><strong>Hidden</strong> - issues to be ignored or have been resolved (default not-checked)</ListItem>
                    </UnorderedList>
                <p>
                    For in-depth guidance, view 
                    {" "}
                    <Link 
                    href="#filter_views"
                    inline={true} size="lg"
                    >Filter views</Link> in the User guide.
                </p>

                <h2 id="view">3. The Checker view</h2>
                <p>
                    The 'Accessibility Checker' tab is located in the 'Elements' panel in Chrome/Edge or the 'Inspector' panel in Firefox.
                    Developers use this view to quickly find and fix issues in code and on the page.
                </p>
                <p>
                    <img
                        src="assets/img/3_1_CheckerSplash.png"
                        alt="Accessibility Checker tab highlighted"
                    />
                </p>
                <p>Note: The location of the 'Accessibility Checker' tab is dependent on the layout and appearance settings in DevTools.</p>
                <p><strong>To launch the Checker</strong>, do one of the following:</p>
                <UnorderedList>
                    <ListItem>Launch Developer Tools:
                        <OrderedList>
                            <ListItem><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</ListItem>
                            <ListItem>Or, Right-click the web page, select '<strong>Inspect</strong>'</ListItem>
                            <ListItem>Select 'Elements' panel in Chrome/Edge or the 'Inspector' panel in Firefox</ListItem>
                            <ListItem>Select 'Accessibility Checker' tab</ListItem>
                        </OrderedList>    
                    </ListItem>
                    <ListItem>From the Chrome and Edge browser menu:
                        <OrderedList>
                            <ListItem>Select 'More tools', then 'Developer Tools'</ListItem>
                            <ListItem>Select 'Elements' panel</ListItem>
                            <ListItem>Select 'Accessibility Checker' tab</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem>From the Firefox browser menu:
                        <OrderedList>
                            <ListItem>Select 'More tools', then 'Web Developer Tools'</ListItem>
                            <ListItem>Select 'Inspector' panel</ListItem>
                            <ListItem>Select 'Accessibility Checker' tab</ListItem>
                        </OrderedList>
                    </ListItem>
                </UnorderedList>

                <h2 id="a11y_check">3.1 Scan to find issues</h2>
                <p>
                    Press the blue 'Scan' button to quickly find issues with a component or web page.
                </p>    
                <p>
                    <img
                        src="assets/img/2_1_Scan.png"
                        alt="Checker scan button highlighted"
                    />
                </p>    
                <p>
                    Launch developer tools on the web page to be tested.
                </p>
                <p>
                    <img
                        src="assets/img/3.1Checker123.png"
                        alt="DevTools with 'Elements tab', 'Accessibility Checker tab', and blue scan button highlighted and numbered 1 to 3"
                    />
                </p>
                <OrderedList>
                    <ListItem>Open ‘Elements’ panel (Chrome/Edge) or ‘Inspector’ panel (Firefox)</ListItem>
                    <ListItem>Select 'Accessibility Checker' tab (usually in the lower or right-hand panel)</ListItem>
                    <ListItem>Press the ‘Scan’ button to get a list of issues</ListItem>
                </OrderedList>
                <p>
                    <img
                        src="assets/img/1_RoleFilters.png" //was Quick_Intro.png
                        alt="Checker highlighting types of issues"
                    />
                </p>
                <p>The scan results show the total number of issues grouped by the four (4) types:</p>
                <UnorderedList>
                    <ListItem>
                        <img
                            src={violation}
                            alt="violation icon"
                        />{" "}
                        <strong> Violation</strong> - failures that need to be corrected
                    </ListItem>
                    <ListItem>
                        <img
                            src={needsReview}
                            alt="needs review icon"
                        />{" "}
                        <strong> Needs review</strong> - review to confirm that it's not a violation
                    </ListItem>
                    <ListItem>
                        <img
                            src={recommendation}
                            alt="recommendation icon"
                        />{" "}
                        <strong> Recommendation</strong> - opportunities to apply best practices
                    </ListItem>
                    <ListItem>
                        <img
                            src={ViewOff16current}
                            alt="hide icon" // added via import
                        />
                        {" "}
                        <strong> Hidden</strong> - issues to be ignored or have been resolved
                        </ListItem>
                </UnorderedList>
                {/* <p>
                    <img
                        src="assets/img/3.1Checker3.png"
                        alt="highlighted list for element roles, requirements, and rules, an expand icon, and a 'learn more' link text"
                    />
                </p> */}
                <p>
                    There are three (3) ways to organize and group the set of issues listed:</p>
                    <UnorderedList>
                        <ListItem>by <strong>Element roles</strong> – issues are organized by the ARIA roles of the Document Object Model (DOM) elements. This view shows both implicit and explicit roles, and not the element names. Use this view to explore issues within a specific element role and its children. (default)</ListItem>
                        <ListItem>by <strong>Requirements</strong> – issues are mapped to the most relevant IBM requirement, which corresponds to the WCAG standards. Use this view to classify and report issues.</ListItem>
                        <ListItem>by <strong>Rules</strong> - issues organized by rules in the rule set. Use this view to see all the issues common to a rule at once.</ListItem>
                    </UnorderedList>
                
                <p>
                    <strong>Filter</strong>: there are four (4) ways to further filter the set of issus listed by one or more <strong>types</strong> of issues detected:</p>
                <UnorderedList>
                    <ListItem><strong>Violations</strong> – failures that need to be corrected (default checked)</ListItem>
                    <ListItem><strong>Needs review</strong> – review to confirm that it's not a violation (default checked)</ListItem>
                    <ListItem><strong>RecommendationsRules</strong> - opportunities to apply best practices (default checked)</ListItem>
                    <ListItem><strong>Hidden</strong> - issues to be ignored or have been resolved (default not-checked)</ListItem>
                </UnorderedList>
                <p>
                    For in-depth guidance, view 
                    {" "}
                    <Link 
                    href="#filter_views"
                    inline={true} size="lg"
                    >Filter views</Link> in the User guide.
                </p>
                <p>
                    <strong>Additional actions</strong> that can be taken with the list of issues:
                </p>
                <UnorderedList>
                    <ListItem>Collapse or Expand the group of issues to see the individual issues</ListItem>
                    <ListItem>Select an individual or groups of issues to be hidden</ListItem>
                    <ListItem>Click 'Learn more' link in the issue for detailed help on how to fix it</ListItem>
                    <ListItem>Press 'Export to XLS' to download the results in a spreadsheet format</ListItem>
                </UnorderedList>

                <h3 id="hidden_content">Hidden content not scanned</h3>
                <p>
                    By default, the Checker skips hidden content (Web pages that use the visibility:hidden or display:none elements). 
                    When the content is changed or revealed to users at any point, re-scan the page. 
                    Trigger the dynamic content live in the browser and in test scripts and see <Link 
                    href="#t_multi_scan_report" inline={true} size="lg"
                    >Create a multi-scan report</Link>. 
                    Ensure the tests trigger the display of non-visible content so that the Checker can test it.
                </p>
                
                <h2 id="local_files">3.2 Scan local files</h2>
                <p>
                    The Checker is able to scan local .html or .htm files launched in the Firefox browser by default. 
                    Follow the steps below to allow scanning of local .html or .htm files in the Chrome browser:
                </p>
                <OrderedList>
                    <ListItem>Open 'Extensions' from the Chrome browser toolbar</ListItem>
                    <ListItem>Open 'Manage Extensions' to see all installed extensions</ListItem>
                    <ListItem>Press the 'Details' button of the IBM Equal Access Accessibility Checker extension</ListItem>
                    <ListItem>Scroll down and turn on 'Allow access to file URLs'</ListItem>
                </OrderedList>

                <h3 id="automated_local_scanning">Automated batch scanning of local files</h3>
                <p>
                    The Checker is <Link 
                        href="https://www.ibm.com/able/toolkit/tools/#develop" target="_blank" rel="noopener noreferred" inline={true}
                        size="lg">available as a Node package</Link> for automated testing within a continuous integration / continuous delivery (CI/CD) pipeline that can scan a batch of local files:
                </p>
                <UnorderedList>
                    <ListItem><strong>Node accessibility-checker</strong>: automated accessibility testing within a continuous integration pipeline, such as Travis CI for Node-based test environments, 
                        such as Selenium, Puppeteer, Playwright, and Zombie; the ability to validate results against baseline files and scan local files</ListItem>
                    <ListItem><strong>Karma-accessibility-checker</strong>: automated accessibility testing for the Karma environment</ListItem>
                    <ListItem><strong>Cypress-accessibility-checker</strong>: wrapper of the accessibility-checker in the Cypress environment</ListItem>
                </UnorderedList>

                <h2 id="sync">3.3 Synchronize views</h2>
                <p>
                    'Inspect' an element on the web page (or select an issue in the list of issues) to synchronize the highlighting on the web page, 
                    highlighting related issues in the issue list, and easily view the help information for the specific selected issue. 
                    Using the integrated power of DevTools, make changes to the code and re-scan to see the accessibility results.
                </p>
                {/* <p>
                    <img

                        src="assets/img/3_3_SynchronizedViewWithHelp.png" 
                        alt="issue highlighted in issue list synchronized with help and issue on the page"
                    />
                </p> */}
                {/* <p>
                    <img

                        src="assets/img/3.1Checker2.png"
                        alt="IBM checker tool highlighting issues filter and tab list for element roles requirements and rules"
                    />
                </p> */}
                <p>
                    <img
                        src="assets/img/3_5_SynchronizedViewsElementsIssuesPageHelp.png" //was 3.1Checker4.png
                        alt="browser highlighting search bar on page, an element in the DOM,and related issues in the checker tool"
                    />
                </p>
                <p>Select an issue in the Checker, an element in the DOM, or 'Inspect' an element on the web page to:</p>
                <UnorderedList>
                    <ListItem>Show the number of issues for that selected element on the page</ListItem>
                    <ListItem>Highlight all related issues, if any, with a light purple border (e.g., 4 issues in this example)</ListItem>
                    <ListItem>Click 'Learn more' to view detailed help information with ‘Why is this important?’ for the specific selected issue</ListItem>
                    <ListItem>Show the synchronized set of highlighted issues in the different panels</ListItem>
                    <ListItem><strong>Note</strong>: mouse and keyboard selections by the user will affect the item with current focus</ListItem>
                </UnorderedList>
                
                <h2 id="t_single_scan_report">3.4 Create a scan report</h2>
                <p>
                    To generate a report for a single scan in the Checker view:
                </p>
                <p>
                    <img

                        src="assets/img/2_2_ScanReport.png" //was 3.2Report.png
                        alt="an open dropdown menu with focus on 'download current scan'."
                    />
                </p>
                <p>
                    Open the 'Reports' dropdown menu and select 'Download current scan'. 
                </p>
                <p>
                    See <Link inline={true} size="lg" href="#the_report" title="Checker reports">Checker reports</Link> for more details.
                </p>

                <h2 id="t_multi_scan_report">3.5 Create a multi-scan report</h2>
                <p>
                    To combine up to 50 multiple scans into a single report:
                </p>
                <p>
                    <img

                        src="assets/img/3.3Multi1.png"
                        alt="an open dropdown menu with focus on 'Start storing scans'"
                    />
                </p>
                <p>1. Open the 'Reports' dropdown menu and select 'Start storing scans.'</p>
                <p>
                    <img

                        src="assets/img/3.3Multi2.png"
                        alt="status bar that says 'status:storing, 3 scans stored'"
                    />
                </p>
                <p>
                    2. Scan additional pages by loading new pages and changing dynamic content with end-user input or scripting. 
                    Remember to press the Scan button on each desired state of the page(s). 
                </p>
                <p>    
                    3. The number of stored scans will show below Scan button.
                </p>
                {/* <p>
                    <img
                        src="assets/img/3.3Multi3.png"
                        alt="an open dropdown menu with focus on 'download stored scans"
                    />
                </p> */}
                <p>4. Open the 'Reports' dropdown menu and select 'View stored scans'.</p>
                <p>
                    <img
                        src="assets/img/3_5_StoredScans.png" //was 3.3Multi4.png
                        alt="a table showing a list of stored scans"
                        sizes="220"
                    />
                </p>
                <p>5. Manage the stored scans via the 'Stored scans' panel:</p>
                <UnorderedList>
                    <ListItem><strong>Detail</strong>: incudes a screenshot of the page when the scan was preformed</ListItem>
                    <ListItem><strong>Scan label</strong>: edit the label to uniquely differentiate the scan and customize the report</ListItem>
                    <ListItem><strong>Delete</strong>: select one or more scans to be deleted from the report</ListItem>
                    <ListItem><strong>All</strong>: select all the scans by using the checkbox in the first column of the header row</ListItem>
                    <ListItem><strong>Download</strong>: select one or more scans to download the multi-scan report</ListItem>
                    <ListItem><strong>Cancel</strong>: to uncheck the selections</ListItem>
                    <ListItem><strong>Return</strong>: click back (or navigate) into the Checker to continue using the functionality, such as storing more scans</ListItem>
                </UnorderedList>

                <h2 id="focus_view">3.6 Focus view</h2>
                <p>
                    The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM.
                </p>
                <p>
                    <img

                        src="assets/img/2_4_Focus.png" //was 3.4Focus.png"
                        alt="content switcher with two items: html and alt"
                    />
                </p>
                <OrderedList>
                    <ListItem>Select an element in the DOM, or use the 'Inspect element' command on the page in the browser</ListItem>
                    <ListItem>Select element name in focus view (e.g., &lt;div&gt;) to view the related issues</ListItem>
                    <ListItem>Select 'All' in the focus view to see all issues again</ListItem>
                </OrderedList>

                <h2 id="filter_views">3.7 Filter views</h2>
                    <p>
                        The Checker includes four (4) filters when viewing issues. 
                        Each filter type has a checkbox in the dropdown menu. 
                        If the checkbox is checked the issue type will show.
                        If the checkbox is not checked the issue type will be filtered and not show.
                        The default is for three (3) types of issues: Violations, Needs review, and Recommendations, to be checked so that they will show.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_5_Filter.png"
                            alt="dropdown menu with 3 checkboxes selected"
                        />
                    </p>
                    <p>
                    Unchecking one of the checkboxes will filter (not show) the associated issues from the list, 
                    but those issues are still counted in the total issues found and Scan summary report.
                    </p>
                    <p>
                        All the filters are independent. 
                        Checking or unchecking one filter does not affect the other filters. 
                        For example, if the Violations filter is checked the Violation issues will show. 
                        Unchecking the Violations filter will result in the Violations issues not showing.
                    </p>
                    <p>
                        <img
                            src="assets/img/3_7_FilterScanSummary.png"
                            alt="Scan summary updated"
                        />
                    </p>
                    <p><strong>Note</strong>: Checked or unchecked types in the Filter dropdown menu are reflected in the checkboxes in the tiles of the Scan summary and vice versa. 
                    Thus, the checkboxes in the Filter dropdown and the Scan summary behave the same and can be used interchangeably. 
                    Select or deselect checkboxes in the Filter dropdown or Scan summary to filter issues by type.
                    </p>
                    <p>
                    'Filter views' differs from 'Focus view' because it applies only to issue types, 
                    while 'Focus view' applies only to the selected element.                    
                    </p>

                <h2 id="hide_issues">3.8 Show/Hide issues</h2>
                    <p>
                        The Hide feature allows issues to be removed from view and subtracted from the respective issue counts and Scan summary report. 
                        This can be useful for showing a set of issues or reflecting progress by hiding issues that have been resolved or identified to be fixed later.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_6_HideRecommendations.png"
                            alt="recommendation type issues are selected with Hide button highlighted"
                        />
                    </p>
                    <p>
                        To hide one or more issues, check the checkbox at the beginning of the row of the issue. 
                        Once issues have been checked the blue 'Hide' button appears in the toolbar. 
                        Pressing the 'Hide' button will hide those issues that have been selected and the counts will be updated.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_6_Show.png"
                            alt="previously hidden issues selected so Show button available"
                        />
                    </p>
                    <p><strong>Note</strong>: A 'Hidden' icon is displayed next to the 'Type' icon in the list of individual issues in each row, 
                        the count of hidden issues is updated, 
                        and the count of hidden issues is listed in the Scan summary. 
                        Issue counts will also be reduced for the Violations, Needs review, and Recommendations 
                        accounting for those types of issues that are now hidden.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_6_Hide6wFilterOff.png"
                            alt="Scan summary updated"
                        />
                    </p>
                    <p>When the 'Hidden' filter is not selected (unchecked) in the dropdown menu, then those hidden issues are filtered (not shown) from the list of issues displayed.  
                        Unlike using the Filter views feature (which only affects whether an issue is shown), 
                        Hide removes the issues from the counts and Scan summary report so they can be ignored or marked as resolved.
                    </p>
                    <p><strong>Note</strong>: When the 'Hidden' filter is selected (checked), the hidden issues reappear so they can be selected individually or as a group. 
                        When one or more hidden issues are selected, then the blue 'Show' button appears in the toolbar in the heading row. 
                        When the 'Show' button is pressed, the once-hidden issues are now shown and the counts and Scan summary report are updated.</p>

                    <h3 id="resolving">Resolving Needs review issues</h3>
                    <p>A common scenario is to resolve 'Needs review' issues. 
                        Follow these simple steps:</p>
                    <OrderedList>
                        <ListItem>Check the 'Needs review' filter only (uncheck the other filter options)</ListItem>
                        <ListItem>Determine if those issues have been reviewed and confirm they are not violations and can be ignored (resolved) from further investigation</ListItem>
                        <ListItem>Confirm that those 'Needs review' type issues that have not been reviewed are not checked</ListItem>
                        <ListItem>Press the 'Hide' button to remove the checked issues</ListItem>
                    </OrderedList>

                    <h3 id="showing">Show previously hidden issues</h3>
                        <p>Another common scenario is to un-hide issues that were previously hidden so that they can be worked on and be included in the reports. 
                        Follow these simple steps:</p>
                    <OrderedList>
                        <ListItem>Check the 'Hidden' filter only (uncheck the other filter options)</ListItem>
                        <ListItem>Determine if those previously hidden issues now need to be worked on and be included in the reports</ListItem>
                        <ListItem>Confirm that those ready to be worked on (to be unhidden) are checked</ListItem>
                        <ListItem>Press the 'Show' button to unhide the checked issues</ListItem>
                    </OrderedList>

                <h2 id="keyboard_checker_mode">3.9 Keyboard checker mode</h2>
                <p>
                    This mode shows a visualization of the keyboard tab order detected on the page, 
                    and elements with detectable keyboard access issues. Use this for manual keyboard accessibility testing.
                </p>
                <p>
                    Press the 'Keyboard checker mode' icon to turn on/off keyboard visualization.
                </p>
                <p>
                    <img

                        src="assets/img/2_7_KCM.png" //was 3.5Keyboard1.png
                        alt="Keyboard checker mode' icon button"
                    />
                </p>
                <p><strong>Note</strong>: The keyboard checker mode does not track page changes. 
                    Turn the mode off and on again to update the visualization.
                    Remember to re-scan the page when the dynamic content has changed.
                </p>
                <p>
                    <img

                        src="assets/img/3.5Keyboard2.png"
                        alt="webpage with keyboard visualization overlay"
                    />
                </p>
                <p>Select these icons or tab through the page to see keyboard access issues:</p>
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

                <h3 id="manual">Manual keyboard testing</h3>
                <p>Automated tools can’t find all keyboard access issues. Using the visualization, test for basic keyboard navigation:</p>
                <UnorderedList>
                    <ListItem>Make sure every interactive element is a tab stop*
                        <OrderedList>
                            <ListItem>No tab stops on non-interactive or non-visible elements**</ListItem>
                            <ListItem>Tab order matches the visual flow of the page</ListItem>
                            <ListItem>Inspect elements with found issues</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem>Test interactive elements
                        <OrderedList>
                            <ListItem>Start from browser URL bar, or click just above the part of page of interest</ListItem>
                            <ListItem>Press tab key to move keyboard focus through interactive elements</ListItem>
                            <ListItem>You shouldn’t get stuck in a keyboard trap (try the Esc key)</ListItem>
                            <ListItem>Operate the controls using standard keys</ListItem>
                            <ListItem>Focus should not jump to an unexpected place when operating controls</ListItem>
                            <ListItem>When dismissing or deleting items, focus should move to sensible location</ListItem>
                        </OrderedList>
                    </ListItem>
                </UnorderedList>
                <p>* It may be acceptable to skip interactive elements if the UI provides another keyboard accessible way to perform the same function</p>
                <p>** It may be acceptable if the first tab stop of the page is “skip to main content” link that is not visible until it has keyboard focus</p>
                
                <h3 id="keys_testing">Keys to use for testing</h3>
                <UnorderedList>
                    <ListItem>
                        <img
                            src={tab}
                            alt="tab key"
                        />{" "}
                        moves to next interactive element
                    </ListItem>
                    <ListItem>
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
                    </ListItem>
                    <ListItem>
                        <img
                            src={enter}
                            alt="enter key"
                        />{" "}
                        activates a link, button, or menu
                    </ListItem>
                    <ListItem>
                        <img
                            src={space}
                            alt="space key"
                        />{" "}
                        selects or unselects a form element, or activates button/dropdown menu
                    </ListItem>
                    <ListItem>
                        <img
                            src={upDown}
                            alt="up and down arrow keys"
                        />{" "}
                        moves between radio buttons or menu items, and scrolls page vertically
                    </ListItem>
                    <ListItem>
                        <img
                            src={leftRight}
                            alt="left right arrow keys"
                        />{" "}
                        may move between tab or menu items, scroll horizontally, and adjust sliders
                    </ListItem>
                    <ListItem>
                        <img
                            src={esc}
                            alt="esc keys"
                        />{" "}
                        closes modal dialog or dropdown menu
                    </ListItem>
                </UnorderedList>
                <p>
                    Keyboard assignment conventions are defined for widgets and functions in the <Link 
                    inline={true} size="lg" href="https://www.w3.org/TR/wai-aria-practices/">ARIA Authoring Practices Guide - Developing a Keyboard Interface</Link>.
                </p>
                <p>
                    The Keyboard Checker Mode helps complete the critical manual testing step in the Verify phase. 
                    However, complete all the other <Link
                        target="_blank" inline={true} size="lg"
                        href="https://www.ibm.com/able/toolkit/verify"
                    >
                        steps in the Verify phase
                    </Link> in the IBM Equal Access Toolkit to confirm the accessibility.
                </p>
                <h2 id="a11y_assess">4. The Assessment view</h2>
                <p>
                    Auditors use the ‘Accessibility Assessment’ tab because it provides an executive summary with totals for each type of issue group. 
                    It has the same functionality as the ‘Accessibility Checker’ tab but has more area to display the results because it is integrate with the ‘Elements’ panel (DOM code view) displayed by DevTools. 
                </p>
                <p>
                    <img

                        src="assets/img/4_AccessibilityAssessmentSplash.png"
                        alt="accessibility assessment panel with tab highlighted"
                    />
                </p>
                <p>
                    To launch the Assessment view, do one of the following:
                </p>
                <UnorderedList>
                    <ListItem>Launch Developer Tools:
                        <OrderedList>
                            <ListItem><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</ListItem>
                            <ListItem>Or, Right-click the web page, select '<strong>Inspect</strong>'</ListItem>
                            {/* <ListItem>Select 'Elements' panel in Chrome/Edge or the 'Inspector' panel in Firefox</ListItem> */}
                            <ListItem>Select 'Accessibility Assessment' tab</ListItem>
                        </OrderedList>    
                    </ListItem>
                    <ListItem>From the Chrome and Edge browser menu:
                        <OrderedList>
                            <ListItem>Select 'More tools', then 'Developer Tools'</ListItem>
                            {/* <ListItem>Select 'Elements' panel</ListItem> */}
                            <ListItem>Select 'Accessibility Assessment' tab</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem>From the Firefox browser menu:
                        <OrderedList>
                            <ListItem>Select 'More tools', then 'Web Developer Tools'</ListItem>
                            {/* <ListItem>Select 'Inspector' panel</ListItem> */}
                            <ListItem>Select 'Accessibility Assessment' tab</ListItem>
                        </OrderedList>
                    </ListItem>
                </UnorderedList>
                <p>
                    <img

                        src="assets/img/4_A11yAssess.png"
                        alt="IBM Checker tool's accessibility assessment view"
                    />
                </p>
                <p>
                    After pressing the 'Scan' button, the left panel shows a detailed list of issues grouped by 'Element roles'.
                    The right panel shows the 'Scan summary' report with totals for each type of issue group.
                </p>
                <p>
                    The default view is by 'Element roles' that shows a detailed list of issues with expand/collapse control for each group.
                    The view is also available by 'Requirements' or by 'Rules' when selected from the dropdown menu. 
                    Auditors often organize the view by ‘Requirement’ to get a list of issues by the WCAG accessibility guideline.
                </p>
                <p>
                    <img

                        src="assets/img/4_A11yAssess2.png"
                        alt="IBM Checker tool's accessibility assessment view highlighting an issue and showing issue details"
                    />
                </p>
                
                <p>
                    Select an issue and click on the 'Learn more' link to see the detailed help information shown in the right panel that replaces the Scan summary. 
                    The help information includes applicable messages specific to the issue.
                    The help information also includes sections for 'Why is this important?', 'Element location' with code snippet, 'What to do', 'About this requirement', and 'Who does this affect?'.
                </p>
                <p>
                    Select the number of 'issues found' above the list of issues in the left panel to return the Scan summary to the right panel.
                </p>
                
                <h2 id="t_select_settings">5. Settings</h2>
                <p>
                    By default, the Checker uses the latest deployment of a set of rules that correspond to the WCAG standard, plus additional IBM requirements. 
                    Use the 'Settings' page to change the default rule set for a supported guideline (standard) and the 'Keyboard Checker Mode' settings.
                </p>
                <p>
                    There are two methods to open the Settings page, the browser toolbar and the settings gear icon:
                </p>
                <p>
                    <img
                        src="assets/img/0_SettingsLaunchBrowserToolbar.png"
                        alt="browser toolbar with a 'Settings' link on the bottom of the overlay"
                    />
                </p>
                <OrderedList>
                    <ListItem>
                        In the browser toolbar, select the IBM Equal Access
                        Accessibility Checker icon as shown {" "}
                        <img
                            src={BrowserDetection.isDarkMode()?beeLogoDark:beeLogoLight}
                            width="16px"
                            height="16px"
                            alt="Checker bee equal icon"
                        />
                        . This will usually be located in the upper right of the browser window.
                    </ListItem>
                    <ListItem>
                        At the bottom of the overlay that appears, select 'Settings' and the settings page will open in a new browser tab. 
                    </ListItem>
                    <ListItem>
                        <strong>Note</strong>: In Firefox, the Settings page may fail to open if the Enhanced Tracking Protection option is set to Strict. 
                        To avoid this, change the browser privacy settings to Standard.
                    </ListItem>
                </OrderedList>
                <p>
                    <img
                        src="assets/img/2_8_SettingsIcon.png" //was 3.5Keyboard2a.png"
                        alt="settings gear icon highlighted"
                    />
                </p>
                <p>
                    In the Checker panel itself, select the Settings gear icon to open the settings page.
                </p>
                <p>
                    <img
                        src="assets/img/2_8_SettingsRulesets.png"
                        alt="Rule set options"
                    />
                </p>
                <h3 id="rule_deploy">Rule set settings</h3>
                <p>
                    Rule sets with rules that map to a specific WCAG version are available. 
                    The rule sets are updated regularly and each update has a date of deployment. 
                    For consistent testing throughout a project, choose a specific date of deployment. 
                    To replicate an earlier test, choose the deployment date of the original test.
                </p>
                <p>
                    Select one of the following:
                </p>
                <UnorderedList>
                    <ListItem><strong>Latest deployment</strong> - the latest rule set of the selected accessibility guideline (default)</ListItem>
                    <ListItem><strong>&lt;date&gt; Deployment</strong> - replicate an earlier test by choosing the deployment date of the original test</ListItem>
                    <ListItem><strong>Preview Rules</strong> - experiment with a possible future rule set</ListItem>
                </UnorderedList>
                <p>
                    <img
                        src="assets/img/2_8_SettingsSelectGuideline.png"
                        alt="Accessibility guidelines options"
                    />
                </p>
                <p>
                    Rule sets for a specific accessibility guideline or version of the IBM Accessibility requirements are available to check against an established policy. 
                    Select one of the following options from the 'Select accessibility guidelines' dropdown:
                </p>
                    <UnorderedList>
                        <ListItem><strong>IBM Accessibility 7.2</strong>: includes checking against WCAG 2.1 plus additional IBM requirements</ListItem>
                        <ListItem><strong>WCAG 2.2 (A, AA)</strong>: this is the latest W3C specification. Content that conforms to WCAG 2.2 also conforms to WCAG 2.1 and 2.0</ListItem>
                        <ListItem><strong>WCAG 2.1 (A, AA)</strong>: referenced by EN 301 549 and other policies, but not the latest W3C specification</ListItem>
                        <ListItem><strong>WCAG 2.0 (A, AA)</strong>: referenced by US Section 508</ListItem>
                    </UnorderedList>

                <h3 id="keyboard_checker_settings">Keyboard checker mode settings</h3>
                <p></p>
                <UnorderedList>
                        <ListItem><strong>Lines connecting tab stops</strong>: by default, the 'Lines connecting tab stops' checkbox is selected.
                            Without this setting, only the numbered tab stop icons would be visible on the page.
                        </ListItem>
                        <ListItem><strong>Element outlines</strong>: by default, the bounding boxes do not display.
                            Select the 'Element outlines' checkbox to see light bounding boxes for each interactive element in the tab order.
                        </ListItem>
                        <ListItem><strong>Alert notifications</strong>: toggles on and off the panel notification that appears every time the keyboard checker mode is selected. 
                            This setting is equivalent to selecting the ‘Do not show this again’ checkbox in the notification panel. 
                        </ListItem>
                        <ListItem><strong>Keyboard tab stops</strong>: explanation panel can be displayed at any time by selecting the ‘More Info’ icon next to the ‘Keyboard tab stops’ heading above the list issues. 
                        </ListItem>    
                </UnorderedList>

                <h2 id="the_report">6. Checker reports</h2>
                <p>
                    Single scan reports are provided in both HTML web and Microsoft Excel XLS spreadsheet formats. 
                    Multi-scan reports are available only in the Excel XLS spreadsheet format. 
                    For how to generate reports, see <Link 
                    href="#t_single_scan_report"
                    inline={true} size="lg">Create a scan report</Link> and <Link 
                    href="#t_multi_scan_report"
                    inline={true} size="lg">Create a multi-scan report</Link>.
                </p>
                
                <h3 id="HTML_reports">HTML reports</h3>
                {/* <p><strong>HTML reports</strong></p> */}
                <p>
                    <img
                        src="assets/img/7_1_ReportHTML.png"
                        alt="an HTML page for 'IBM accessibility equal access toolkit: accessibility checker report'"
                    />
                <p>
                    This interactive report is in an HTML web format that includes:
                </p></p>
                <OrderedList>
                    <ListItem>Scan date and time</ListItem>
                    <ListItem>URL scanned</ListItem>
                    <ListItem>Percentage of elements with no detected violations or items to review</ListItem>
                    <ListItem>Summary of test results </ListItem>
                    <ListItem>Issue details organized by Requirements or by Rules</ListItem>
                    <ListItem>‘Learn more’ link with detailed help description for each issue</ListItem>
                </OrderedList>
                <p>
                    <strong>Note</strong>: The percentages reported are based on automated tests only. 
                    Be sure to follow all the <Link
                        target="_blank" inline={true} size="lg"
                        href="https://www.ibm.com/able/toolkit/verify"
                    >
                        steps in the Verify phase
                    </Link>{" "} in the IBM Equal Access Toolkit.
                </p>

                <h3 id="t_excel_report">Excel XLS spreadsheet report</h3>
                <p>
                    Both single scans and multiple scans generate a five sheet spreadsheet report.
                </p>
                <p>
                    <img
                        src="assets/img/7_1_ReportXLS_hidden.png"
                        alt="an Excel spreadsheet of an accessibility scan report"
                    />
                </p>
                <OrderedList>
                    <ListItem>
                            <strong>Overview</strong> includes the name of the tool with its version, the scan date,
                            ruleset, guidelines and platform used for the scan, and a summary of the overall results across all included scans.
                    </ListItem>
                    <ListItem>
                        <strong>Scan summary</strong> provides an overview of the set of scans within the report.
                    </ListItem>
                    <ListItem>
                        <strong>Issue Summary</strong> provides an overview of the issues found across all the scans.
                        Issues are summarized in a prioritized order, starting with Level 1 items,
                        as defined in the IBM Equal Access Toolkit, followed by Level 2 and Levels 3
                        and 4.  Levels 1-3 are necessary to complete the IBM accessibility requirements. Within each
                        level, the summary lists issues that are Violations, items that Need Review,
                        Recommendations, and Hidden. Totals and counts are provided for each type of issue.
                    </ListItem>
                    <ListItem>
                        <strong>Issues</strong> has the details of the individual issues. This includes the scan label
                        assigned to the scan, an ID for each issue, relevant accessibility requirements,
                        and toolkit levels.
                    </ListItem>
                    <ListItem>
                        <strong>Definition of fields</strong> defines the columns in the other sheets.
                    </ListItem>
                </OrderedList>
                <p>
                    <strong>Note</strong>: If the same page is scanned multiple times, 
                    there will be duplicate issues in the multi-scan report, which can be identified as having the <strong>same</strong> Issue ID. 
                    If a template or reused component has issues, these will also be repeated in the report, but will have <strong>different</strong> Issue IDs.
                </p>

                <h2 id="a11y_considerations">7. Accessibility features</h2>
                <p>
                    Highlighted below are several accessibility features for improving the experience for people with disabilities using the Checker functionality, 
                    including with a keyboard or with a screen reader.
                </p>
                <p>
                    The Checker is responsive to users’ preferred font size and colors.
                </p>
                <p>
                    The Checker is fully keyboard accessible, tab order is as follows:
                </p>
                <OrderedList>
                    <ListItem>‘Scan’ button</ListItem>
                    <ListItem>‘Reports’ dropdown menu</ListItem>
                    <ListItem>‘Focus view’, <img
                                    src={leftRight}
                                    alt="left right arrow keys"
                                />{" "} toggles the switcher
                    </ListItem>
                    <ListItem>Issue filter checkboxes, <img
                                    src={enter}
                                    alt="enter key"
                                />{" "}  selects checkbox
                    </ListItem>
                    <ListItem>Keyboard Checker Mode, <img
                                    src={enter}
                                    alt="enter key"
                                />{" "}  toggles the mode
                    </ListItem>
                    <ListItem>Counts for the Violations, Needs review, Recommendations, and Hidden issues</ListItem>
                    <ListItem>Total issues found, <img
                                    src={enter}
                                    alt="enter key"
                                />{" "}  displays the Scan summary replacing the detail help information.
                    </ListItem>
                    <ListItem>Group issues by Element role, Requirement, or by Rule, <img
                                    src={enter}
                                    alt="enter key"
                                    />{" "} opens/closes the menu dropdown
                    </ListItem>
                    <ListItem>Filter, <img src={enter} alt="enter key"/> opens/closes the menu dropdown</ListItem>
                    <ListItem>Export scan, <img src={enter} alt="enter key"/> downloads reports</ListItem>
                    <ListItem>Issues, <img src={space} alt="space bar"/> selects all issues</ListItem>
                    <ListItem>Issue groupings, <img
                                src={leftRight}
                                alt="left right arrow keys"
                            />{" "} expand/collapse group
                    </ListItem>
                    <ListItem>'Learn more' link or the next issue</ListItem>
                    <ListItem>Individual issue, <img
                                src={upDown}
                                alt="up down arrow keys"
                            />{" "} navigate list of issues
                    </ListItem>
                </OrderedList>    
                <p>
                    Use the heading hierarchy and landmarks to navigate:
                </p>
                <UnorderedList>
                    <ListItem><strong>Issue count</strong> region by issue type and the total number of issues found</ListItem>
                    <ListItem><strong>Issue list</strong> region with issues grouped by element roles/requirements/rules</ListItem>
                    <ListItem><strong>Main</strong> landmark also contains issue help and overview of stored scans</ListItem>
                    <ListItem><strong>Scan Summary</strong> aside or the complementary landmark contains the Scan summary report</ListItem>
                    <ListItem><strong>Issue Help</strong> aside or the complementary landmark contains the issue help when an issue is selected</ListItem>
                </UnorderedList>
                    
                <h2 id="feedback">8. Feedback</h2>
                <p>
                    Visit the open-source <Link inline={true} size="lg" href="https://github.com/IBMa/equal-access/issues">IBMa/equal-access</Link> GitHub repository to:
                </p>
                <UnorderedList>
                        <ListItem>Request a new feature</ListItem>
                        <ListItem>Report a bug with the Checker</ListItem>
                        <ListItem>Report a bug with a rule, help information, or the accuracy of the violation reported</ListItem>
                        <ListItem>Find information on existing bugs, <Link 
                            inline={true} size="md" href="https://github.com/IBMa/equal-access/releases">Release Notes</Link>, and <Link
                            inline={true} size="md" href="https://github.com/IBMa/equal-access/blob/master/README.md">ReadMe’s</Link></ListItem>
                    </UnorderedList>

                <h2 id="troubleshooting">9. Troubleshooting</h2>
                <p>
                    If the Checker appears unresponsive:
                </p>
                <OrderedList>
                    <ListItem>Close the browser DevTools</ListItem>
                    <ListItem>Clear browser cookies</ListItem>
                    <ListItem>Refresh the page</ListItem>
                    <ListItem>Reopen the browser DevTools</ListItem>
                    <ListItem>Press the 'Scan' button</ListItem>
                </OrderedList>
                <p>
                    <strong>Note</strong>: On rare occasions, the Checker does not appear in DevTools for some sites due to a bug in the DevTools. 
                    The workaround is to go to a site where the Checker will launch, and then launch the Checker in DevTools. 
                    Then, in the same browser tab, load the site that did not launch.
                </p>

                <h3 id="helpful_hints">Helpful hints</h3> 
                {/* <p><strong>Helpful hints</strong></p> */}
                <p>
                    For Chrome on MacOS, move between the keyboard tab stop visualization on the webpage and DevTools with the following keyboard shortcuts:
                </p>    
                <UnorderedList>
                    <ListItem>
                        When in a webpage, <strong>Option+Command+Up</strong> four times to get to DevTools (More or less depending on which toolbars and panels are open)
                    </ListItem>
                    <ListItem>
                        When in DevTools,  <strong>Option_Command_Down</strong> approximately five times to get to the webpage (More or less depending on the DevTools layout)
                    </ListItem>
                </UnorderedList>
                
                <h3 id="known_issues">Known issues</h3> 
                {/* <p><strong>Known issues</strong></p> */}
                <UnorderedList>
                    <ListItem>
                        The Checker is unable to check the content of an iframe element unless both have the same origin. Work around: open the iframe URL in a new window or tab and then scan the content.
                    </ListItem>
                    <ListItem>
                        In rare situations, the mouse pointer is unable to select underlying items on the web page when Keyboard Checker Mode tab is on.
                    </ListItem>
                    <ListItem>
                        For certain websites on Firefox, the keyboard tab stops visualization may stay visible after turning it off and either partially work, or not work at all.
                    </ListItem>
                    <ListItem>
                        See 'Open' issues in the open-source <Link inline={true} href="https://github.com/IBMa/equal-access/issues">IBMa/equal-access</Link> GitHub repository.
                    </ListItem>
                    <ListItem>
                        For carousel elements, each item may be a tab stop. While only some of the carousel items are visible, the visualization will show stacked tab stop indicators for all carousel items (see image below):
                    </ListItem>
                </UnorderedList>
                <p>
                    <img
                        src="assets/img/Carousel.png"
                        alt="keyboard tab stop indicators stacked on Amazon's carousel banner"
                    />
                </p>
                
            </main>
            {/* </Theme> */}
        </DocPage>
        
        );
    }
}

export default UsingACApp;
