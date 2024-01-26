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
import ViewOff16 from "../../assets/img/View--off.svg";
import ViewOn16 from "../../assets/img/View--on.svg";
import tabStop from "../../assets/tab_stop.svg";
import tabStopChainError from "../../assets/tabStopChainError.svg";
import tabStopError from "../../assets/tabStopError.svg";
import { DocPage } from "./components/DocPage";
import { Link, ListItem, OrderedList, UnorderedList, } from "@carbon/react";
import "./quickGuide.scss";

interface quickGuideACAppState { }

export class QuickGuideACApp extends React.Component<{}, quickGuideACAppState> {
    state: quickGuideACAppState = {};

    render() {
        // BrowserDetection.setDarkLight();
        
        let aside = (<>
            <div style={{ marginTop: "1.5rem" }} />
            <OrderedList style={{ marginLeft: "1.5rem" }}>
                <ListItem><Link href="#issues">Accessibility issues</Link></ListItem>
                <ListItem><Link href="#functionality">Functionality in the Checker</Link>
                    <OrderedList nested={true}>
                    <ListItem><Link href="#checker">Scanning</Link></ListItem>
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
            </OrderedList>
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
                        The IBM Equal Access Toolkit: Accessibility Checker ("<strong>the Checker</strong>") 
                        is a browser extension that tests web pages for accessibility issues 
                        with W3C Web Content Accessibility Guidelines (WCAG 2.2),
                        IBM Accessibility requirements, and other standards.
                        The Checker is <Link href="https://www.ibm.com/able/toolkit/tools/#develop" target="_blank" rel="noopener noreferred" inline={true}
                        size="lg">also available as a Node package</Link> for automated testing within a continuous integration pipeline. 
                        The Checker rules include explanations and help for suggested fixes.
                    </p>

                    <h2 id="issues">Accessibility issues</h2>
                    <p>
                        As with any automated test tool for accessibility, these tests don't catch all issues. 
                        Complete accessibility testing with 
                        {" "}
                        <Link href="https://www.ibm.com/able/toolkit/develop/overview/#unit-testing" target="_blank" rel="noopener noreferred" inline={true}
                        size="lg">developer unit testing</Link> and follow all the 
                        {" "}
                        <Link href="https://www.ibm.com/able/toolkit/verify/overview/" target="_blank" rel="noopener noreferred" inline={true}
                        size="lg">steps in the Verify phase</Link>.
                    </p>
                    <p>
                        <img
                            src="assets/img/1_RoleFilters.png" // was Quick_Intro.png
                            alt="Checker highlighting types of issues"
                        />
                    </p>
                    <p>The issues detected are divided into four types:</p>
                    <OrderedList>
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
                            <strong> Needs review</strong> - needs manual review to confirm that it's not a violation
                        </ListItem>
                        <ListItem>
                            <img
                                src={recommendation}
                                alt="recommendation icon"
                            />{" "}
                            <strong> Recommendation</strong> - opportunities to apply best practices
                        </ListItem>
                        <ListItem>
                            <svg width="16" height="17" viewBox="0 0 16 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <rect width="16" height="16" transform="translate(0 0.511719)" fill="black" fill-opacity="0.01" style="mix-blend-mode:multiply"/>
                                <path d="M2.62 11.7667L3.335 11.0567C2.55211 10.3538 1.93699 9.48406 1.535 8.51172C2.55 5.97672 5.35 4.01172 8 4.01172C8.68195 4.02072 9.35772 4.14236 10 4.37172L10.775 3.59172C9.89633 3.22038 8.95385 3.02339 8 3.01172C6.37026 3.07301 4.79419 3.6105 3.4666 4.55776C2.13901 5.50503 1.11808 6.82054 0.530001 8.34172C0.490285 8.45157 0.490285 8.57187 0.530001 8.68172C0.974124 9.86023 1.69021 10.9172 2.62 11.7667Z" fill="#FFFFFF"/>
                                <path d="M6 8.37672C6.03477 7.89758 6.24085 7.44696 6.58054 7.10726C6.92024 6.76756 7.37086 6.56149 7.85 6.52672L8.755 5.61672C8.24788 5.48319 7.71462 5.48493 7.20838 5.62175C6.70214 5.75857 6.24061 6.02571 5.8698 6.39652C5.49899 6.76733 5.23186 7.22886 5.09503 7.7351C4.95821 8.24134 4.95647 8.7746 5.09 9.28172L6 8.37672Z" fill="#FFFFFF"/>
                                <path d="M15.47 8.34172C14.8967 6.84832 13.899 5.55523 12.6 4.62172L15 2.21672L14.295 1.51172L1 14.8067L1.705 15.5117L4.255 12.9617C5.39194 13.6287 6.68202 13.9904 8 14.0117C9.62974 13.9504 11.2058 13.4129 12.5334 12.4657C13.861 11.5184 14.8819 10.2029 15.47 8.68172C15.5097 8.57187 15.5097 8.45157 15.47 8.34172ZM10 8.51172C9.9979 8.86177 9.90395 9.20514 9.72755 9.5075C9.55116 9.80987 9.29849 10.0606 8.99481 10.2347C8.69112 10.4089 8.34705 10.5002 7.997 10.4997C7.64694 10.4992 7.30316 10.4068 7 10.2317L9.72 7.51172C9.89975 7.81458 9.99634 8.15955 10 8.51172ZM8 13.0117C6.95103 12.9934 5.92195 12.7224 5 12.2217L6.27 10.9517C6.84767 11.3525 7.54777 11.5377 8.24807 11.475C8.94836 11.4122 9.60437 11.1054 10.1015 10.6083C10.5987 10.1111 10.9055 9.45508 10.9682 8.75478C11.031 8.05449 10.8458 7.35439 10.445 6.77672L11.88 5.34172C13.0273 6.12921 13.9245 7.22943 14.465 8.51172C13.45 11.0467 10.65 13.0117 8 13.0117Z" fill="#FFFFFF"/>
                            </svg>
                            <img
                                src={ViewOff16}
                                alt="hide icon" // added via import
                            /><img
                            src={ViewOn16}
                            alt="hide icon" // added via import
                            />{" "}
                            <strong> Hidden</strong> - issues to be ignored or have been resolved
                        </ListItem>
                    </OrderedList>
                    <p>There are three ways to organize and view the set of issues detected:</p>
                    <UnorderedList>
                        <ListItem>by Element roles (default)</ListItem>
                        <ListItem>by Requirements</ListItem>
                        <ListItem>by Rules</ListItem>
                    </UnorderedList>
                    <p>
                        For more in-depth guidance, view 
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html#issues")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                            >Accessibility issues</Link> in the User guide.
                    </p>

                    <h2 id="functionality">Functionality in the Checker</h2>
                    <p>Here’s a quick look at what all the key functionalities are in the Checker.</p>     
                    <p>
                        <img
                            src="assets/img/2_Functionality.png" // was Quick_Look.png
                            alt="IBM checker tool with numbers labeling each functionality"
                        />
                    </p>
                    <p>
                        See the 
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                        >User guide</Link> for more in-depth guidance on using 
                        the '<Link 
                            href={chrome.runtime.getURL("usingAC.html#view")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Checker view</Link>' to 
                        find and fix issues in the code, 
                        the '<Link 
                            href={chrome.runtime.getURL("usingAC.html#a11y_assess")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Assessment view</Link>' for  
                        an executive summary of the findings, and other functionality such as filtering, 
                        hiding issues, and the keyboard checker mode.
                    </p>
            
                    <h2 id="checker">1. Scan to find issues</h2>
                    <p>
                        Press the blue 'Scan' button to find issues quickly with a component or page.
                    </p>    
                    <p>
                        <img
                            src="assets/img/2_1_Scan.png"
                            alt="Checker scan button highlighted"
                        />
                    </p>    
                    <p>
                        For more in-depth guidance, view
                        {" "}
                        <Link 
                            href={chrome.runtime.getURL("usingAC.html#a11y_check")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                            >Scan to find issues</Link> in the User guide.
                    </p>

                    <h2 id="scan">2. Create a scan report</h2>
                    <p>
                        Generate a report from a single scan in both HTML web and Microsoft Excel XLS spreadsheet formats.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_2_ScanReport.png"
                            alt="open dropdown menu with focus on 'Download current scan'"
                        />
                    </p>
                    <p>
                        For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#t_single_scan_report")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                            >Create a scan report</Link> in the User guide.
                    </p>

                    <h2 id="multiscan">3. Create a multi-scan report</h2>
                    <p>
                        Combine up to 50 multiple scans into a single report in an Excel XLS spreadsheet.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_3_ScanMultiple.png" // was 3_MultiScan.png
                            alt="an open dropdown menu with focus on 'Start storing scans'"
                        />
                    </p>
                    <p>
                        For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#t_multi_scan_report")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                            >Create a multi-scan report</Link> in the User guide.
                    </p>

                    <h2 id="focus">4. Focus view</h2>
                    <p>
                        The focus view allows viewing all issues on the page or focusing on only the issues for a selected element or component in the code. 
                        Selecting a complex component, such as a 'table' or 'div', allows the user to focus on only those issues associated with that component and its children. 
                        The default view is 'All' elements on the page.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_4_Focus.png" // was 4_Focus.png
                            alt="content switcher with two items: div and All"
                        />
                    </p>
                    <OrderedList>
                        <ListItem>Select an element in the code, or 'Inspect' an element on the page</ListItem>
                        <ListItem>Select the element name in the Focus view (e.g. 'div') to switch viewing only its related issues</ListItem>
                        <ListItem>Select 'All' in the focus view to switch back and see all issues again</ListItem>
                    </OrderedList>
                    <p>
                    'Focus view' differs from 'Filter views' because it only applies to the selected element and its children, 
                    while 'Filter views' only applies to the type of issues.
                    </p>
                    <p>
                        For more in-depth guidance, 
                        view <Link 
                            href={chrome.runtime.getURL("usingAC.html#focus_view")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg"
                            >Focus view</Link> in the User guide.
                        </p>

                    <h2 id="filter">5. Filter views</h2>
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
                    <p><strong>Note</strong>: Checked or unchecked types in the Filter dropdown menu are reflected in the checkboxes in the tiles of the Scan summary and vice versa. 
                    Thus, the checkboxes in the Filter dropdown and the Scan summary behave the same and can be used interchangeably. 
                    Select or deselect checkboxes in the Filter dropdown or Scan summary to filter issues by type.
                    </p>
                    <p>
                    'Filter views' differs from 'Focus view' because it applies only to issue types, 
                    while 'Focus view' applies only to the selected element.                    
                    </p>
                    <p>
                        For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#filter_view")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Filter views</Link> in the User guide.
                    </p>

                    <h2 id="hide">6. Show/Hide issues</h2>
                    <p>
                        The Hide feature allows issues to be ignored or marked as resolved. 
                        When this feature is used, issues are not only hidden from view, they are also subtracted from the respective issue counts. 
                        Issues that are determined to be irrelevant or resolved can be hidden and removed from the counts towards achieving a goal of zero counts both in the issues list and in the Scan summary report.
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
                    <p>
                        For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#hide")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Show/Hide issues</Link> in the User guide.
                    </p>    

                    <h2 id="keyboard">7. Keyboard checker mode</h2>
                    <p>
                        This mode shows a visualization of the order of the keyboard tab stops detected on the page, 
                        and the elements with detectable keyboard access issues.
                    </p>
                    <p>
                        Select 'Keyboard checker mode' icon button to turn on/off keyboard visualization.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_7_KCM.png" // was 3.5Keyboard1.png
                            alt="highlighting 'keyboard checker mode' icon button, counts, and visualization"
                        />
                    </p>
                    <p><strong>Note</strong>: the keyboard checker mode does not track page changes. 
                    Turn the mode off and on again to update the visualization.
                    </p>
                    <p>
                    In this example, the Checker found 22 existing Keyboard tab stops, 2 missing, and lists only the 8 associated keyboard issues found with those elements. 
                    Select the icons or tab through the page to see the code highlighted, the element on the page highlighted, and the keyboard access issues highlighted:</p>
                    <UnorderedList>
                        <ListItem style={{marginBottom:".5rem"}}>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                src={tabStop}
                                alt="tab stop chain icon"
                                style={{verticalAlign:"middle"}}
                            /></div>{" "}
                            numbered tab stop with no detected issue. Clicking will show element in the code.
                        </ListItem>
                        <ListItem style={{marginBottom: ".5rem"}}>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                    src={tabStopChainError}
                                    alt="tab stop with issues chain icon"
                                    style={{verticalAlign:"middle", marginTop: "-7px"}}
                                /></div>{" "}
                            numbered tab stop with detected issue. Click to learn about the issue.
                        </ListItem>
                        <ListItem>
                            <div style={{textAlign: "center", display: "inline-block", width: "2.5rem"}}>
                                <img
                                    src={tabStopError}
                                    alt="tab stop not in chain with issues icon"
                                    style={{verticalAlign:"middle", marginTop: "-7px"}}
                                /></div>{" "}
                            tab stops that are not in the tab order. Click to learn more.
                        </ListItem>
                    </UnorderedList>
                    <p><strong>Note</strong>: only the keyboard related access issues are listed. 
                    Turn off 'Keyboard Checker Mode' to see the full list of issues detected.
                    </p>
                    <p>
                        For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#keyboard_checker_mode")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Keyboard checker mode</Link> in the User guide.
                    </p>    

                    <h2 id="settings">8. Settings</h2>
                    <p>
                        Select the Settings icon to change the 'Rule sets' and 'Keyboard checker mode' settings.
                    </p>
                    <p>
                        <img
                            src="assets/img/2_8_Settings.png" // was 3.5Keyboard2a.png"
                            alt="settings gear icon highlighted"
                        />
                    </p>
                    <p>
                        <img
                            src="assets/img/2_8_SettingsRulesets.png"
                            alt="Rule set options"
                        />
                    </p>
                    <p>
                        The rule sets are updated regularly, and each update has a date of deployment. 
                        Select one of the following:
                        </p>
                        <UnorderedList>
                            <ListItem><strong>Latest deployment</strong> is the default</ListItem>
                            <ListItem>Replicate an earlier test by choosing the <strong>deployment date</strong> of the original test</ListItem>
                            <ListItem><strong>Preview Rules</strong> to experiment with a possible future rule set</ListItem>
                        </UnorderedList>
                    <p>
                        <img
                            src="assets/img/2_8_SettingsSelectGuideline.png"
                            alt="settings gear icon highlighted"
                        />
                    </p>
                    <p>Rule sets for a specific accessibility guideline or version of the IBM Accessibility requirements are available to check against an established policy. 
                        Select one of the following:</p>
                        <UnorderedList>
                            <ListItem><strong>IBM Accessibility 7.2</strong>: includes checking against WCAG 2.1 plus additional IBM requirements</ListItem>
                            <ListItem><strong>WCAG 2.2 (A, AA)</strong>: this is the latest W3C specification. Content that conforms to WCAG 2.2 also conforms to WCAG 2.1 and 2.0</ListItem>                        
                        </UnorderedList>
                    <p>
                        For more in-depth guidance, 
                        view <Link href={chrome.runtime.getURL("usingAC.html#t_select_settings")} target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">Settings</Link> in the User guide.
                    </p>

                    <h2 id="feedback">Feedback</h2>
                    <p>
                        Visit the <Link href="https://github.com/IBMa/equal-access" target="_blank" rel="noopener noreferred"
                            inline={true} size="lg">IBMa/equal-access</Link> GitHub repository to:
                    </p>
                    <UnorderedList>
                        <ListItem>Request a new feature</ListItem>
                        <ListItem>Report a bug with the Checker</ListItem>
                        <ListItem>Report a bug with a rule, help information, or the accuracy of the violation reported</ListItem>
                        <ListItem>Find information on existing bugs, Release Notes, and ReadMe’s</ListItem>
                    </UnorderedList>

                    <h2 id="troubleshooting">Troubleshooting</h2>
                    <p>
                        If the Checker appears unresponsive:
                    </p>
                    <UnorderedList>
                        <ListItem>Close the browser DevTools</ListItem>
                        <ListItem>Clear browser cookies</ListItem>
                        <ListItem>Refresh the page</ListItem>
                        <ListItem>Reopen the browser DevTools</ListItem>
                        <ListItem>Click the 'Scan' button</ListItem>
                    </UnorderedList>
                    <p>
                        See the <Link
                        href={chrome.runtime.getURL("usingAC.html#troubleshooting")}
                        target="_blank"
                        rel="noopener noreferred"
                        inline={true}
                        size="lg">User guide</Link> for more in-depth guidance, such as:
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
