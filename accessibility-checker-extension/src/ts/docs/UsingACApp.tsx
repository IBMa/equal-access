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
import ViewOff16 from "../../assets/img/View--off.svg";
// import ViewOn16 from "../../assets/img/View--on.svg"; not using this Show icon
import tabStop from "../../assets/tab_stop.svg";
import tabStopChainError from "../../assets/tabStopChainError.svg";
import tabStopError from "../../assets/tabStopError.svg";
import enter from "../../assets/enter.svg";
import esc from "../../assets/esc.svg";
import leftRight from "../../assets/left_right.svg";
import shift from "../../assets/shift.svg";
import space from "../../assets/space.svg";
import tab from "../../assets/tab.svg";
import upDown from "../../assets/up_down.svg";
import { DocPage } from "./components/DocPage";
import "./usingAC.scss";
import { Link, ListItem, OrderedList, UnorderedList } from "@carbon/react";

interface UsingACAppState { }

class UsingACApp extends React.Component<{}, UsingACAppState> {
    state: UsingACAppState = {};

    render() {
        let aside = (<>
            <div style={{ marginTop: "1.5rem" }} />
            <UnorderedList>
                <ListItem><Link href="#install">How to install</Link></ListItem>
                <ListItem><Link href="#issues">Accessibility issues</Link></ListItem>
                <ListItem><Link href="#view">The Checker view</Link>
                    <OrderedList nested={true}>
                        <ListItem><Link href="#a11y_check">Scanning</Link></ListItem>
                        <ListItem><Link href="#local">Scan local files</Link></ListItem>
                        <ListItem><Link href="#sync">Synchronize views</Link></ListItem>
                        <ListItem><Link href="#t_single_scan_report">Create a scan report</Link></ListItem>
                        <ListItem><Link href="#t_multi_scan_report">Create a multi-scan report</Link></ListItem>
                        <ListItem><Link href="#focus_view">Focus view</Link></ListItem>
                        <ListItem><Link href="#filter_views">Focus view</Link></ListItem>
                        <ListItem><Link href="#hide_issues">Show/Hide issues</Link></ListItem>
                        <ListItem><Link href="#keyboard_checker_mode">Keyboard checker mode</Link></ListItem>
                    </OrderedList>
                </ListItem>
                <ListItem><Link href="#a11y_assess">The Assessment view</Link></ListItem>
                <ListItem><Link href="#t_select_settings">Settings</Link></ListItem>
                <ListItem><Link href="#the_report">Checker reports</Link></ListItem>
                <ListItem><Link href="#a11y_considerations">Accessibility features</Link></ListItem>
                <ListItem><Link href="#feedback">Feedback</Link></ListItem>
                <ListItem><Link href="#troubleshooting">Troubleshooting</Link></ListItem>
            </UnorderedList>
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
                    The IBM Equal Access Toolkit: Accessibility Checker ("the Checker") is a browser extension that tests web pages for accessibility issues with W3C Web Content Accessibility Guidelines (WCAG) and IBM requirements. There is a <Link inline={true} size="lg" href={chrome.runtime.getURL("usingAC.html#view")} target="_blank" rel="noopener noreferred">Checker view</Link> to find and fix issues in the code and an <Link inline={true} size="lg" href={chrome.runtime.getURL("usingAC.html#a11y_assess")} target="_blank" rel="noopener noreferred">Assessment view</Link> for an executive overview of the page. For teams seeking integrated accessibility testing, IBM offers plug-ins and modules for NodeJS and Karma that perform cross-platform testing in the build and development process. These tools use the same test engine as the Accessibility Checker.
                </p>
                <p>
                    <strong>Note:</strong> On rare occasions the Accessibility Checker extension does not appear in the developer tools for some sites due to a bug in the developer tools. The workaround is to go to a site where you know the checker will launch, and launch the checker in the developer tools. Then, in the same browser tab, load the site that did not launch.
                </p>
                <h2 id="install">How to install</h2>
                <p>
                    <strong>Supported browsers:</strong>
                </p>
                <UnorderedList>
                    <ListItem>Google Chrome version 81.x or later</ListItem>
                    <ListItem>Mozilla Firefox version 68.x or later</ListItem>
                </UnorderedList>
                <p>
                    <strong>For Chrome:</strong>
                </p>
                <OrderedList>
                    <ListItem>Open the Chrome browser.</ListItem>
                    <ListItem>
                        Go to the{" "}
                        <Link
                            target="_blank"
                            href="https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp"
                        >
                            IBM Equal Access Accessibility Checker
                        </Link>{" "}
                        in the Chrome Web Store.
                    </ListItem>
                    <ListItem>
                        Click 'Add To Chrome' button.
                    </ListItem>
                </OrderedList>
                <p>
                    <strong>For Firefox:</strong>
                </p>
                <OrderedList>
                    <ListItem>Open the Firefox browser</ListItem>
                    <ListItem>
                        Go to the{" "}
                        <Link
                            target="_blank"
                            href="https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/"
                        >
                            IBM Equal Access Accessibility Checker
                        </Link>{" "}
                        in Firefox Browser Add-on
                    </ListItem>
                    <ListItem>
                        Click 'Add To Firefox' button
                    </ListItem>
                </OrderedList>
                <h2 id="issues">Accessibility issues</h2>
                <p>As with any automated test tool for accessibility, these tests don’t catch all issues. Complete your accessibility testing with {" "}
                    <Link
                        target="_blank"
                        href="https://www.ibm.com/able/toolkit/develop/considerations/unit-testing/"
                    >
                        developer unit testing
                    </Link>{" "}  and follow all the <Link
                        target="_blank"
                        href="https://www.ibm.com/able/toolkit/verify"
                    >
                        steps in the Verify phase
                    </Link>{" "}.
                </p>
                <p>
                    <img
                        src="assets/img/2_A11yIssues.png"
                        alt="IBM checker tool highlighting issues filter and tab list for element roles, requirements, and rules"
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
                        <strong> Recommendation</strong> - opportunities to apply best practices
                    </ListItem>
                    <ListItem>
                            <img
                                src={ViewOff16}
                                alt="ViewOff icon"
                            />{" "}
                            <strong> Hidden</strong> - issues to be ignored or have been resolved
                        </ListItem>
                </UnorderedList>
                <p>
                    There are three ways to view the same set of issues:
                </p>
                <p>
                    <strong>Element roles</strong> – issues are organized by the ARIA roles of the DOM elements. This view shows both implicit and explicit roles, and not the element names. Use this view to explore issues within a specific element and its children.
                </p>
                <p>
                    <strong>Requirements</strong> – issues are mapped to the most relevant IBM requirement, which corresponds to the WCAG standards. Use this view to classify and report issues.
                </p>
                <p>
                    <strong>Rules</strong> - issues organized by rules in the rule set. Use this view to see the different types of issues at once.
                </p>

                <h2 id="view">The Checker view</h2>
                <p>The Accessibility Checker tab in the Elements panel in Chrome or the Inspector panel in Firefox is a code scanner for developers looking to find and fix issues in code and on the page quickly.</p>
                <p>To use the Checker view, do one of the following:</p>
                <UnorderedList>
                    <ListItem><strong>For Chrome:</strong>
                        <OrderedList>
                            <ListItem>From the browser ‘View’ menu, select ‘Developer’</ListItem>
                            <ListItem>Select ‘Developer tools’</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem><strong>For Firefox: </strong>
                        <OrderedList>
                            <ListItem>From the browser ‘Tools‘ menu, select ‘Web Developer’</ListItem>
                            <ListItem>Select ‘Toggle Tools’</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</ListItem>
                    <ListItem>Right-click web page, select ‘<strong>Inspect</strong>’ (Chrome) or ‘<strong>Inspect Element</strong>’ (Firefox)</ListItem>
                </UnorderedList>
                <h2 id="a11y_check">3.1 Accessibility Checker</h2>
                <p>
                    The Accessibility Checker view is a code scanner for developers looking to find and fix errors quickly as they are building a component.
                </p>
                <p>
                    <img
                        src="assets/img/3.1Checker1.png"
                        alt="Developer tools with 'elements tab', 'accessibility checker tab', and scan button highlighted and numbered 1 to 3"
                    />
                </p>
                <OrderedList>
                    <ListItem>Open ‘Elements’ panel (Chrome) or ‘Inspector’ panel (Firefox)</ListItem>
                    <ListItem>Select 'Accessibility Checker' from the tabs in the right-hand panel</ListItem>
                    <ListItem>Click the ‘Scan’ button to scan web page</ListItem>
                </OrderedList>
                <p>
                    <img

                        src="assets/img/3.1Checker2.png"
                        alt="IBM checker tool highlighting issues filter and tab list for element roles requirements and rules"
                    />
                </p>
                <p>
                    The scan results show the total number of issues divided by types. The same set of issues can also be viewed by element roles, requirements, and rules.
                </p>
                <p>
                    <img
                        src="assets/img/3.1Checker3.png"
                        alt="IBM Checker tool highlighting list for element roles, requirements, and rules, an expand icon, and a 'learn more' link text"
                    />
                </p>
                <p>View issues by element roles, requirements, or rules and select the expand icon next to an element role/requirement/rule to see the related issues. Click on the ‘learn more’ link to view detailed information and how to fix it. </p>
                <p>
                    <img
                        src="assets/img/3.1Checker4.png"
                        alt="browser highlighting search bar on page, an element in the DOM,and related issues in the checker tool"
                    />
                </p>
                <p>Select an element in the Checker, in the DOM, or use the ‘Inspect element’ command on the web page for the Checker to:</p>
                <UnorderedList>
                    <ListItem>Show number of issues of each type within selected element and its children</ListItem>
                    <ListItem>Open and highlight all issues in element, if any (dark purple highlight)</ListItem>
                    <ListItem>Open and highlight all issues in element’s children, if any (light purple highlight)</ListItem>
                    <ListItem>Show the same set of highlighted issues in the different tabs</ListItem>
                </UnorderedList>
                <p><strong>Hidden content scanning</strong></p>
                <p>
                    By default, the Checker skips hidden content (Web pages that use the visibility:hidden or display:none elements). If this content is revealed to users at any point, you must include the content in your test plan. Ensure the tests trigger the display of hidden content for the Checker to test.
                </p>
                <p><strong>Scan local files</strong></p>
                <p>
                    The Checker is able to scan local .html or .htm files launched in the Firefox browser by default. Follow the steps below to allow scanning of local .html or .htm files in the Chrome browser:
                </p>
                <OrderedList>
                    <ListItem>Open Chrome browser</ListItem>
                    <ListItem>Open the 'Window' menu</ListItem>
                    <ListItem>Select 'Extensions' menu option to see all installed extensions</ListItem>
                    <ListItem>Click 'Details' button of the IBM Accessibility Checker extension</ListItem>
                    <ListItem>Scroll down and turn on 'Allow access to file URLs'</ListItem>
                </OrderedList>

                <h2 id="t_single_scan_report">4. Create a scan report</h2>
                <p>
                    To generate a report for a single scan in the Checker view:
                </p>
                <p>
                    <img

                        src="assets/img/2_2_ScanReport.png" // was 3.2Report.png
                        alt="an open dropdown menu with focus on 'download current scan'."
                    />
                </p>
                <p>Open the ‘Reports’ dropdown menu and select ‘Download current scan.’ See <Link inline={true} size="lg" href="#the_report" title="Accessibility Checker">Accessibility Checker reports </Link> for more details.</p>
                <h2 id="t_multi_scan_report">3.3 Create a multi-scan report</h2>
                <p>
                    To combine up to 50 multiple scans into a single report:
                </p>
                <p>
                    <img

                        src="assets/img/3.3Multi1.png"
                        alt="an open dropdown menu with focus on 'start storing scans'"
                    />
                </p>
                <p>1. Open the ‘Reports’ dropdown menu and select ‘Start storing scans.'</p>
                <p>
                    <img

                        src="assets/img/3.3Multi2.png"
                        alt="status bar that says 'status:storing, 3 scans stored'"
                    />
                </p>
                <p>2. Scan desired pages, and the number of stored scans will show below scan button.</p>
                <p>
                    <img
                        src="assets/img/3.3Multi3.png"
                        alt="an open dropdown menu with focus on 'download stored scans"
                    />
                </p>
                <p>3. Open the ‘Reports’ dropdown menu and select ‘Download stored scans.’</p>
                <p>
                    <img
                        src="assets/img/3.3Multi4.png"
                        alt="a table showing a list of stored scans"
                    />
                </p>
                <p>You can open the ‘Reports’ dropdown menu and select ‘View stored scans’ to:</p>
                <UnorderedList>
                    <ListItem>Select or unselect scans you want in the report with the checkboxes</ListItem>
                    <ListItem>Select all scans with the checkbox in the first column of the header row</ListItem>
                    <ListItem>Edit scan labels to differentiate the scans</ListItem>
                    <ListItem>Select ‘Download’ in the header row to download the multi-scan report</ListItem>
                    <ListItem>Select ‘Back to list view’ to return to main Checker view</ListItem>
                </UnorderedList>

                <h2 id="focus_view">6. Focus view</h2>
                <p>
                    The focus view allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM.
                </p>
                <p>
                    <img

                        src="assets/img/3.4Focus.png"
                        alt="content switcher with two items: html and alt"
                    />
                </p>
                <OrderedList>
                    <ListItem>Select an element in the DOM, or use the ‘Inspect element’ command on page.</ListItem>
                    <ListItem>Select element name in focus view (e.g., &lt;html&gt;) to view related issues</ListItem>
                    <ListItem>Select ‘All’ in the focus view to see all issues again</ListItem>
                </OrderedList>

                <h2 id="hide">6. Show/Hide issues</h2>
                    <p>
                        The Hide feature allows issues to be ignored or marked as resolved. 
                        When this feature is used, issues are not only hidden from view, they are also subtracted from the respective issue counts. 
                        Issues that are determined to be irrelevant or resolved can be hidden and removed from the counts 
                        towards achieving a goal of zero counts both in the issues list and in the Scan summary report.
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
                    <p><strong>Note</strong>: a 'Hidden' icon is displayed next to 'Type' icon in the list of individual issues in each row, 
                        the count of hidden issues is updated, 
                        and the count of hidden issues is listed in the Scan summary. 
                        Issue counts will also be reduced for the Violations, Needs review, and Recommendations 
                        accounting for those types of issues that are now hidden.</p>
                    <p>When the 'Hidden' filter is not selected (unchecked) in the dropdown menu, then those hidden issues are filtered (not shown) from the list of issues displayed.  
                        Unlike using the Filter views feature (which only affects whether an issue is shown), 
                        Hide removes the issues from the counts and Scan summary report so they can be ignored or saved for later.</p>
                    <p><strong>Note</strong>: when the 'Hidden' filter is selected (checked), the hidden issues reappear so they can be selected individually or as a group. 
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
                        <p>Another common scenario is to un-hide issues that were previously hidden (ignored for later) so that they can now be worked on and be included in the reports. 
                        Follow these simple steps:</p>
                    <OrderedList>
                        <ListItem>Check the 'Hidden' filter only (uncheck the other filter options)</ListItem>
                        <ListItem>Determine if those previously hidden issues now need to be worked on and be included in the reports</ListItem>
                        <ListItem>Confirm that those ready to be worked on (unhidden)reviewed are checked</ListItem>
                        <ListItem>Press the 'Show' button to unhide the checked issues</ListItem>
                    </OrderedList>

                <h2 id="keyboard_checker_mode">9. Keyboard checker mode</h2>
                <p>
                    This mode shows a visualization of the keyboard tab order detected on the page, 
                    and elements with detectable keyboard access issues. Use this for manual keyboard accessibility testing.
                </p>
                <p>
                    Select the 'Keyboard checker mode' icon to turn on/off keyboard visualization.
                </p>
                <p>
                    <img

                        src="assets/img/2_7_KCM.png" // was 3.5Keyboard1.png
                        alt="Keyboard checker mode' icon button"
                    />
                </p>
                
                <p><strong>Note:</strong> the keyboard checker mode does not track page changes. Turn the mode off and on again to update the visualization.
                </p>
                <p>
                    <img

                        src="assets/img/3.5Keyboard2.png"
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
                <p><strong>Manual keyboard testing</strong></p>
                <p>Automated tools can’t find all keyboard access issues. Using the visualization, test for basic keyboard navigation:</p>
                <OrderedList>
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
                </OrderedList>
                <p>* It may be acceptable to skip interactive elements if the UI provides another keyboard accessible way to perform the same function</p>
                <p>** It may be acceptable if the first tab stop of the page is “skip to main content” link that is not visible until it has keyboard focus</p>
                <p><strong>Keys to use for testing</strong></p>
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
                            alt="left and right arrow keys"
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
                    Additional keystrokes are defined for particular widgets within the <Link inline={true} size="lg" href="https://www.w3.org/TR/wai-aria-practices/">W3C WAI-ARIA Authoring Practices Design Patterns</Link>.
                </p>
                <h2 id="a11y_assess">The Assessment view</h2>
                <p>
                    The Assessment view provides a simplified overall summary, with explanations for each issue. It has less functionality than the Checker view.
                </p>
                <p>
                    To use the Assessment view, do one of the following:
                </p>
                <UnorderedList>
                    <ListItem><strong>For Chrome:</strong>
                        <OrderedList>
                            <ListItem>From the browser ‘View’ menu, select ‘Developer’</ListItem>
                            <ListItem>Select ‘Developer tools’</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem><strong>For Firefox:</strong>
                        <OrderedList>
                            <ListItem>From the browser ‘Tools‘ menu, select ‘Web Developer’</ListItem>
                            <ListItem>Select ‘Toggle Tools’</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem><strong>Command+Option+I</strong> on MacOS® or <strong>Control+Shift+I</strong> on Microsoft Windows®</ListItem>
                    <ListItem>Right-click web page, select ‘<strong>Inspect</strong>’ (Chrome) or ‘<strong>Inspect Element</strong>’ (Firefox)</ListItem>
                </UnorderedList>
                <OrderedList>
                    <ListItem>Select the 'Accessibility Assessment' panel</ListItem>
                    <ListItem>Click the ‘Scan’ button to scan web page</ListItem>
                </OrderedList>
                <p>
                    <img

                        src="assets/img/4_A11yAssess.png"
                        alt="IBM Checker tool's accessibility assessment view"
                    />
                </p>
                    <p>The left panel shows scan results with total number of issues divided by category, and the right panel shows the report summary.</p>
                <p>
                    <img

                        src="assets/img/4_A11yAssess2.png"
                        alt="IBM Checker tool's accessibility assessment view highlighting an issue and showing issue details"
                    />
                </p>
                <p>View the issues by element roles, requirements, or rules and select the expand icon next to a requirement/element role/rule to see the related issues, and select an issue to see the detailed description in the right panel. </p>
                
                <h2 id="t_select_settings">Settings</h2>
                <p>
                    By default, the IBM Accessibility Checker uses the latest deployment with a set of rules that correspond to the most recent WCAG standards, plus additional IBM requirements. Use the options page to change the default rule set for a supported standard or a date of rule set deployment.
                </p>

                <p>
                    To open the options page:
                </p>
                <OrderedList>
                    <ListItem>
                        In the browser tool bar, select the IBM Equal Access
                        Accessibility Checker icon as shown {" "}
                        <img
                            src={BrowserDetection.isDarkMode()?beeLogoDark:beeLogoLight}
                            width="16px"
                            height="16px"
                            alt="Accessibility checker application icon"
                        />
                        . This will usually be located in the upper right of the
                        browser window.
                    </ListItem>
                    <ListItem>
                        In the overlay that appears, select 'Settings’ and the settings will open in a new browser tab.
                        <strong> Note:</strong> In Firefox, the Settings page may fail to open if the Enhanced Tracking Protection option is set to Strict. To avoid this, change the browser privacy settings to Standard.
                    </ListItem>
                </OrderedList>
                <p>
                    <img
                        src="assets/img/5_Options.png"
                        alt="IBM checker's options page with a 'rule sets' heading and 2 dropdown menus: 'select a rule set deployment date' and 'select accessibility guidelines'"
                        width="100%"
                        height="100%"
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
                    Options from the 'Select a rule set deployment date' dropdown:
                </p>
                <UnorderedList>
                    <ListItem>
                        <strong>Latest Deployment</strong> - the latest rule set of the
                        selected accessibility guideline (default option)
                    </ListItem>
                    <ListItem>
                        <strong>&lt;date&gt; Deployment</strong> - the rule set from a specific date
                    </ListItem>
                    <ListItem>
                        <strong>Preview Rules</strong> - try an experimental preview of a possible future rule set
                    </ListItem>
                </UnorderedList>
                <p>
                    Options from the 'Select accessibility guidelines' dropdown:
                </p>
                <UnorderedList>
                    <ListItem>
                        <strong>IBM Accessibility 7.2</strong> - rules for WCAG 2.1 plus additional IBM requirements (default option)
                    </ListItem>
                    <ListItem>
                        <strong>WCAG 2.2 (A, AA)</strong> - rules for the latest W3C specification. Content that conforms to WCAG 2.2 also conforms to 2.1 and 2.0
                    </ListItem>
                    <ListItem>
                        <strong>WCAG 2.1 (A, AA)</strong> - referenced by EN 301 549 and other policies, but not the latest W3C specification
                    </ListItem>
                    <ListItem>
                        <strong>WCAG 2.0 (A, AA)</strong> - referenced by US Section 508
                    </ListItem>
                </UnorderedList>
                <p>Click the 'Save' button to keep the changes.</p>
                <p>Click the 'Reset to defaults' button to restore the default settings.</p>
                <p>Close the Settings.</p>
                <p><strong>Note</strong>: screenshots in this guide were taken with the 'Latest deployment' and 'WCAG 2.2' options selected.</p>

                <h3 id="rule_deploy">Keyboard checker settings</h3>
                <p>
                    By default, the keyboard visualization options has the 'Lines connecting tab stops'  checkbox selected. Select the 'Element outlines' checkbox to see bounding boxes for each interactive element in the tab order.
                </p>
                <p>
                    The 'Alert notifications' toggles on and off the pop-up notification that appears every time you turn on the keyboard checker mode.
                </p>

                <h2 id="the_report">Checker reports</h2>
                <p>
                    Single scan reports are provided in both HTML and MS Excel spreadsheet formats. Multi-scan reports are available only in MS Excel spreadsheet format. For how to generate reports, see 3.2 Create a scan report and 3.3 Create a multi-scan report.
                </p>
                <p><strong>
                    HTML reports
                </strong>
                </p>
                <p>
                    This interactive report is an HTML file that includes:
                </p>
                <p>
                    <img
                        src="assets/img/7_1_Report.png"
                        alt="an HTML page for 'IBM accessibility equal access toolkit: accessibility checker report'"
                    />
                </p>
                <OrderedList>
                    <ListItem>The scan date and time</ListItem>
                    <ListItem>The scanned URL</ListItem>
                    <ListItem>Percentage of elements with no detected violations or items to review</ListItem>
                    <ListItem>A summary of test results </ListItem>
                    <ListItem>Issue details organized by requirements, element roles, and rules</ListItem>
                    <ListItem>‘Learn more’ link with detailed description for each issue</ListItem>
                </OrderedList>
                <p><strong>
                    Important Note:
                </strong>
                    This percentage is based on automated tests only. Be sure to perform additional reviews and manual tests to complete the accessibility assessments. Use the IBM Equal Access Toolkit as a guide.
                </p>
                <h3 id="t_excel_report">MS Excel Spreadsheet report</h3>
                <p>
                    Both single scans or multiple scans can generate a five sheet spreadsheet report.
                </p>
                <p>
                    <img
                        src="assets/img/7.1Report.png"
                        alt="an excel spreadsheet of an accessibility scan report"
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
                        and 4.  Levels 1-3 are necessary to complete the IBM requirements. Within each
                        level, the summary lists issues that are Violations, items that Need Review,
                        and Recommendations. Counts are provided for each type of issue.
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
                    <strong>Important note:</strong> If the same page is scanned multiple times in a multi-scan report, there may be duplicate issues, which can be identified by having the same Issue ID. If a template or reused component has issues, these will also be repeated in the report, but may have different Issue IDs.
                </p>

                <h2 id="a11y_considerations">Accessibility features</h2>
                <p>
                    Highlighted below are several accessibility features for adaptability and to ensure ease of access to the Checker functionality, including with keyboard or with a screen reader:
                </p>

                <OrderedList>
                    <ListItem>The Checker is responsive to users’ preferred font size and colors.</ListItem>
                    <ListItem>
                        The tool is fully keyboard accessible, tab order is as follows:
                        <OrderedList>
                            <ListItem>‘Scan’ button </ListItem>
                            <ListItem>‘Reports’ dropdown menu</ListItem>
                            <ListItem>
                                ‘Focus view’ switcher,
                                    <img
                                        src={leftRight}
                                        alt="left right arrow keys"
                                    />{" "} toggles
                            </ListItem>
                            <ListItem>
                                Issue filter checkboxes,
                                    <img
                                        src={enter}
                                        alt="enter key"
                                    />{" "}  selects checkbox
                                </ListItem>
                            <ListItem>
                                Issue view tab list, <img
                                    src={leftRight}
                                    alt="left right arrow keys"
                                />{" "} navigates between tabs
                            </ListItem>
                            <ListItem>Issue groupings associated with each requirement (element role or rule)</ListItem>
                            <UnorderedList>
                                <ListItem>
                                        <img
                                            src={enter}
                                            alt="enter key"
                                        />{" "}
                                        opens/closes issue grouping
                                </ListItem>
                                <ListItem>
                                        within open grouping,
                                        <img
                                            src={tab}
                                            alt="tab key"
                                        />{" "}
                                        to navigate to each issue
                                </ListItem>
                                <ListItem>
                                        <img
                                            src={enter}
                                            alt="enter key"
                                        />{" "}
                                        selects issue
                                </ListItem>
                            </UnorderedList>
                            <ListItem>‘Learn more’ link or the next issue</ListItem>
                        </OrderedList>
                    </ListItem>
                    <ListItem>Use the heading hierarchy or implemented landmarks to navigate:</ListItem>
                        <UnorderedList>
                            <ListItem>The Assessment or Checker view’s main landmark includes:
                                    <UnorderedList>
                                        <ListItem><strong>Issue count</strong> region (by issue type and the total number of issues found)</ListItem>
                                        <ListItem><strong>Issue list</strong> region (issues grouped by element roles/requirements/rules)</ListItem>
                                        <ListItem>In the Checker view, the main landmark also contains issue help and the overview of stored scans, when those are requested by the user</ListItem>
                                    </UnorderedList>
                            </ListItem>
                            <ListItem>The Assessment view <strong>Scan Summary</strong> aside or the complementary landmark contains the scan summary, after the scan completes or shows the issue help when any issue is selected.</ListItem>
                            <ListItem>The Assessment view <strong>Issue Help</strong> aside or the complementary landmark contains the issue help when any issue is selected.</ListItem>
                        </UnorderedList>
                </OrderedList>

                <h2 id="feedback">Feedback</h2>
                <p>
                    Visit the{" "}
                    <Link inline={true} size="lg" href="https://github.com/IBMa/equal-access/issues">
                        Equal Access git repository</Link> to:
                </p>
                <UnorderedList>
                    <ListItem>
                        report a problem with the tool
                    </ListItem>
                    <ListItem>
                        report a problem with the checker rules or accuracy of the errors reported by the tool
                    </ListItem>
                    <ListItem>
                        find information on any existing issues
                    </ListItem>
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
                <p><strong>
                    Helpful hints
                </strong>
                </p>
                <UnorderedList>
                    <ListItem>
                        For Chrome, you can move between the keyboard tab stop visualization on the webpage, and your dev tools with the following keyboard shortcut:
                    </ListItem>
                    <OrderedList>
                        <ListItem>
                            If you are in a webpage <strong>Option+Command+Up</strong> four times to get to dev tools DOM (more or less depending on which bars you have open)
                        </ListItem>
                        <ListItem>
                            If you are in dev tools  <strong>Option_Command_Down</strong> approximately five times to get to webpage (More or less depending on how you have Chrome set up)
                        </ListItem>
                    </OrderedList>
                </UnorderedList>
                <UnorderedList>
                    <p><strong>
                        Known issues
                    </strong>
                    </p>
                </UnorderedList>
                <UnorderedList>
                    <ListItem>
                        The Checker is unable to check the content of an iframe element unless both have the same origin. You will have to open the iframe URL in a new window or tab and then scan the content.
                    </ListItem>
                    <ListItem>
                        In rare situations, you cannot use the mouse pointer to select underlying items on the web page when keyboard tab stops is on.
                    </ListItem>
                    <ListItem>
                        For certain websites on Firefox the keyboard tab stops visualization may stay visible after turning it off and either partially work, or not work at all.
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
