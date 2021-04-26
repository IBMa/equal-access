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

import beeLogoUrl from "../../assets/BE_for_Accessibility_darker.svg";
import violation from "../../assets/Violation16.svg";
import needsReview from "../../assets/NeedsReview16.svg";
import recommendation from "../../assets/Recommendation16.svg";

interface UsingACAppState {}

class UsingACApp extends React.Component<{}, UsingACAppState> {
  state: UsingACAppState = {};

  render() {
    const manifest = chrome.runtime.getManifest();

    return (
      <div className="bx--grid bx--grid--full-width">
        <div className="bx--row">
          <div className="bx--col-sm-4 bx--col-md-8 bx--col-lg-4 leftPanel">
            <div role="banner">
              <img src={beeLogoUrl} alt="purple bee icon" className="icon" />
              <h3>
                IBM <strong>Accessibility</strong>
                <br />
                Equal Access Toolkit:
                <br />
                Accessibility Checker
              </h3>
            </div>
            <div
              style={{ marginTop: "2.625rem", lineHeight: "32px" }}
              role="navigation"
            >
              <h1>User guide</h1>
              <ul className="toc" style={{ marginTop: "1rem" }}>
                <li>
                  <a href="#prereq" title="prerequisites">
                    1. Prerequisites
                  </a>
                </li>
                <li>
                  <a href="#install" title="installation">
                    2. Installation
                  </a>
                </li>

                <li>
                  <a href="#categories" title="categories">
                    3. Categories of accessibility issues
                  </a>
                </li>

                <li>
                  <a href="#view" title="ways to view issues">
                    4. Ways to view the issues
                  </a>
                </li>

                <li>
                  <a href="#t_select_settings" title="select an option">
                    5. Options
                  </a>
                  <ul className="toc">
                    <li>
                      <a href="#rule_deploy" title="rule set deployment">
                        5.1 Rule set deployment date
                      </a>
                    </li>
                    <li>
                      <a href="#ruleset" title="rule set">
                        5.2 Select accessibility guidelines
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#usage" title="Usage">
                    6. Usage
                  </a>
                  <ul className="toc">
                    <li>
                      <a href="#a11y_check" title="Accessibility Checker">
                        6.1 Accessibility Checker
                      </a>
                    </li>
                    <li>
                      <a href="#focus_view" title="Focus view">
                        6.2 Focus view
                      </a>
                    </li>
                    <li>
                      <a href="#a11y_assess" title="Accessibility Assessment">
                        6.3 Accessibility Assessment
                      </a>
                    </li>
                    <li>
                      <a
                        href="#t_single_scan_report"
                        title="Create scan report"
                      >
                        6.4 Creating a scan report
                      </a>
                    </li>
                    <li>
                      <a
                        href="#t_multi_scan_report"
                        title="Create multi-scan report"
                      >
                        6.5 Creating a multi-scan report
                      </a>
                    </li>
                    <li>
                      <a
                        href="#t_select_hidden_settings"
                        title="Select hidden content Settings"
                      >
                        6.6 Hidden content scanning
                      </a>
                    </li>
                    <li>
                      <a href="#scan_local_files" title="Scan local files">
                        6.7 Scanning local files
                      </a>
                    </li>
                    <li>
                      <a href="#a11y_considerations" title="Accessibility Considerations">
                        6.8 Accessibility Considerations
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#the_report" title="accessibility checker report">
                    7. Accessibility Checker reports{" "}
                  </a>
                  <ul className="toc">
                    <li>
                      <a href="#t_html_report" title="HTML report">
                        7.1 HTML report
                      </a>
                    </li>
                    <li>
                      <a href="#t_excel_report" title="Excel spreadsheet report">
                        7.2 MS Excel Spreadsheet report
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#feedback" title="feedback">
                    8. Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="bx--col-md-0 bx--col-lg-1 buffer"></div>
          <div
            className="bx--col-md-8 bx--col-lg-8 rightPanel"
            role="main"
            aria-label="User guide details"
          >
            <h1>IBM Accessibility Checker user guide</h1>
            <div className="versionDec">Version {manifest.version}</div>

            <p>
              The IBM Equal Access Accessibility Checker is a browser extension
              that allows users to evaluate a web-based component or solution
              for accessibility issues against W3C Web Content Accessibilty Guidelines 
              (WCAG) and IBM guidelines with explanations and suitable fixes within the tool.
            </p>
            <p>
              The extension showcases two views, the{" "}
              <strong>Accessibility Assessment</strong> panel is a comprehensive
              accessibility assessment tool to help you identify accessibility
              issues and understand how to fix them, while the{" "}
              <strong>Accessibility Checker</strong> tab in the Elements panel
              in Chrome or the Inspector panel in Firefox is a code scanner for
              developers looking to find and fix issues in code and on the page
              quickly. This checker is part of an open suite of accessibility
              automation tools. For teams seeking integrated accessibility
              testing, IBM offers{" "}
              <a href="https://github.com/IBMa/equal-access/blob/master/README.md">
                plug-ins and modules for NodeJS and Karma
              </a>{" "}
              that perform cross-platform accessibility testing in the build and
              development process. These tools use the same test engine as the
              Accessibility Checker.
            </p>
            <h2 id="prereq">1. Prerequisites</h2>
            <div className="pa">
              Supported browsers:
              <ul
                style={{ listStyleType: "circle", marginInlineStart: "1rem" }}
              >
                <li>Google Chrome version 81.x or later</li>
                <li>Mozilla Firefox version 68.x or later</li>
              </ul>
            </div>

            <h2 id="install">2. Installation</h2>
            <div className="pa">
              Follow the steps below to install the browser extension for Google
              Chrome:
              <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
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
                  Click the <strong>'Add To Chrome'</strong> button.
                </li>
              </ol>
            </div>
            <div className="pa">
              Follow the steps below to install the browser extension for
              Mozilla Firefox:
              <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>Open the Firefox browser.</li>
                <li>
                  Go to the{" "}
                  <a
                    target="_blank"
                    href="https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/"
                  >
                    IBM Equal Access Accessibility Checker
                  </a>{" "}
                  in Firefox Browser Add-on.
                </li>
                <li>
                  Click the <strong>'Add To Firefox'</strong> button.
                </li>
              </ol>
            </div>

            <h2 id="categories">3. Categories of accessibility issues</h2>
            <p>The tool reports three kinds of accessibility issues:</p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <img
                    src={violation}
                    alt="violation icon "
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  <strong> Violation</strong> - accessibility failures that need
                  to be corrected.
                </p>
              </li>
              <li>
                <p>
                  <img
                    src={needsReview}
                    alt="needs review icon "
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  <strong> Needs review</strong> - issues that may not be a
                  violation. These need a manual review to identify whether
                  there is an accessibility problem.
                </p>
              </li>
              <li>
                <p>
                  <img
                    src={recommendation}
                    alt="recommendation icon"
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  <strong> Recommendation</strong> - opportunities to apply best
                  practices to further improve accessibility.
                </p>
              </li>
            </ul>
            <p>
              As with any automated test tool for accessibility, these tests
              don’t catch all issues. Complete your accessibility assessment
              with a quick unit test for accessibility or follow the full
              accessibility test process.
            </p>

            <h2 id="view">4. Ways to view the issues</h2>
            <p>
              There are three ways to view and explore the issues identified by
              the tool. All views show the same set of issues:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>Requirements</strong> - issues are organized by the
                  IBM requirements, which corresponds to the WCAG 2.1 standards. 
                  Each issue is mapped to the most relevant requirement. This 
                  view makes it easy to see how to classify and
                  report issues found by the tool.
                </p>
              </li>
              <li>
                <p>
                  <strong>Element roles </strong>- issues are organized in the
                  hierarchical structure defined by the WAI-ARIA roles of the
                  DOM elements. This view shows both implicit and explicit
                  roles. It does not show element names. This view is ideal for
                  exploring the issues within a specific element and its
                  children.
                </p>
              </li>
              <li>
                <p>
                  <strong>Rules</strong> - issues are organized by the rules in
                  the rule set, with violations, items that need review, and
                  recommendations. This view is the best way to see all the
                  different kinds of issues at once.
                </p>
              </li>
            </ul>

            <h2 id="t_select_settings">5. Options</h2>
            <p>
              Use the options page to change the default rule set for a
              supported standard or a date of rule set deployment. By default,
              the IBM Equal Access Accessibility Checker uses the latest
              deployment with a set of rules that correspond to the most recent
              WCAG standards, plus some additional IBM supplemental requirements. Rule sets
              with rules that map to specific WCAG versions are also available
              to choose from as needed. These rule sets are updated regularly
              and each update has a date of deployment. If you need to replicate
              an earlier test, choose the deployment date of the original test.
            </p>
            <p>
              After changing options, close and reopen the developer tools for the change to take effect.
            </p>
            <p>
              Follow the steps below to open the Accessibility Checker options
              page:
            </p>
            <ol style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}>
              <li>
                <p>
                  In the browser tool bar, select the IBM Equal Access
                  Accessibility Checker icon, shown as a purple bee{" "}
                  <img
                    src={beeLogoUrl}
                    width="16px"
                    height="16px"
                    alt="Accessibility checker application icon"
                  />
                  . This will usually be located in the upper right of the
                  browser window. An overlay will appear.
                </p>
              </li>
              <li>
                <p>
                  Select <strong>'Options'</strong> in the overlay. The options
                  will open in a new browser tab.
                  <strong> Note:</strong> In the Firefox browser when the Enhanced
                  Tracking Protection option is set to Strict, this causes some
                  sites or content to break and may prevent the Options page
                  from opening. Change the browser privacy settings to Standard, to avoid the situation.
                </p>
              </li>
            </ol>
            <p>
              <img
                src="assets/img/5_Options.png"
                alt="Options page screenshot - a page where you can select a Rule set deployment and a Rule set for your checker to use."
                width="100%"
                height="100%"
              />
            </p>

            <h3 id="rule_deploy">5.1 Rule set deployment date</h3>
            <p>
              {" "}
              From the <strong>'Select a rule set deployment date'</strong> dropdown choose
              one of the following:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>Latest Deployment</strong> - use the latest version of the
                  selected rule set. This is the default option.
                </p>
              </li>
              <li>
                <p>
                  <strong>&lt;date&gt; Deployment</strong> - use a rule set
                  from a specific date for consistent testing throughout a project, 
                  or to replicate an earlier test.
                </p>
              </li>
              <li>
                <p>
                  <strong>Preview Rules</strong> - try an experimental preview of 
                  a possible future rule set.
                </p>
              </li>
            </ul>
            <p>
              Select the <strong>'Save'</strong> button to keep the changes or
              the <strong>'Reset'</strong> button to discard changes. 
              Close and reopen the developer tools for the change to take effect.
            </p>

            <h3 id="ruleset">5.2 Select accessibility guidelines</h3>
            <p>
              From the <strong>'Select accessibility guidelines'</strong> dropdown choose one of
              the following:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>IBM Accessibility</strong> - Rules for Web Content
                  Accessibility Guidelines WCAG 2.1, levels A and AA, plus
                  additional IBM requirements. This is the default option.
                </p>
              </li>

              <li>
                <p>
                  <strong>WCAG 2.1 (A,AA)</strong> - This is the current W3C recommendation. 
                  Content that conforms to WCAG 2.1 also conforms to WCAG 2.0.
                  These rules align with the European EN 301 549 standards.
                </p>
              </li>

              <li>
                <p>
                  <strong>WCAG 2.0 (A,AA)</strong> - These
                  rules align with the Revised US Sec 508 standards, but are not the latest 
                  W3C recommendation.
                </p>
              </li>

              <li>
                <p>
                  <strong>IBM Accessibility BETA</strong> - Extends IBM Accessibility 
                  with experimental rules.
                </p>
              </li>

            </ul>
            <p>
              After making a change, select the <strong>'Save'</strong> button, then
              close and reopen the developer tools for the change to take effect.
            </p>

            <h2 id="usage">6. Usage</h2>
            <p>
              The IBM Equal Access Accessibility Checker offers two views, the
              Accessibility Checker view is a code scanner for developers
              looking to find and fix errors quickly as they are building a
              component, while the Accessibility Assessment view provides
              explanation and suggested solutions for each issue reported.
              {" "}
              </p>
              <p>
              <strong>Note</strong>: On rare occasions the Accessibility Checker
              extension does not appear in the developer tools for some sites
              due to a bug in the developer tools. The workaround is to go to a
              site where you know the checker will launch, and launch the
              checker in the developer tools. Then, in the same browser tab,
              load the site that did not launch.
            </p>

            <h3 id="a11y_check">6.1 Accessibility Checker</h3>
            <div className="pa">
              <ol
                style={{
                  listStyleType: "decimal",
                  marginInlineStart: "2rem",
                  marginTop: " 0.75rem",
                }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>Open the Developer Tools:</p>
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        In Chrome: From the browser ‘View’ menu, select
                        ‘Developer’ and then select ‘Developer tools’, or{" "}
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        In Firefox: From the browser ‘Tools‘ menu, select ‘Web
                        Developer’ and then select ‘Toggle Tools’, or
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press <strong>Command+Option+I</strong> on MacOS® or{" "}
                        <strong>Control+Shift+I</strong> on Microsoft Windows®,
                        or
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Right-click on a page element and select ‘Inspect’
                        (Chrome) or ‘Inspect Element’ (Firefox).
                      </p>
                    </li>
                  </ul>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the ‘Elements’ panel (Chrome) or ‘Inspector’ panel
                    (Firefox).
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select <strong>'Accessibility Checker'</strong> from the
                    tabs in the right-hand pane:{" "}
                  </p>
                  <p>
                    <img
                      src="assets/img/Chrome_Checker.png"
                      alt="Accessibility Checker screenshot - a code scanner for developers"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Click the <strong>'Scan'</strong> button to scan the web
                    page.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The scan result displays the total number of issues found
                    with individual counts for violations, items that need
                    review, and recommendations in the issue count region. By
                    default, the issue list is shown in the 'Element roles' view
                    (see the previous definition), while 'Requirements' and 'Rules'
                    tabs are also available. All views show the same set of
                    issues.
                  </p>
                  <p>
                    <img
                      src="assets/img/6_1_AccessibilityChecker5.png"
                      alt="Accessibility Checker results"
                      width="100%"
                      height="100%"
                    />
                  </p>
               </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    To <strong>filter</strong> issues and focus only on
                    violations, items that need review or recommendations,
                    deselect the checkbox by the issue type in the issue count region below the{" "}
                    <strong>'Scan'</strong> button to exclude the issue type from the results. Select 
                    the checkbox by the issue type to include the issue type in the results.
                    In this screenshot, the 'Needs review' items have been filtered out. 
                  </p>
                  <p>
                    <img
                      src="assets/img/6_1_AccessibilityChecker6.png"
                      alt="Accessibility Checker results with 'Needs review' issues filtered out"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the expand icon (^) next to an element role, requirement,
                    or rule in the table to display the corresponding issues
                    found.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the 'learn more' link for an issue to view more detailed help
                    information that describes the issue and how to fix it. The
                    help includes links to more detailed explanation, and
                    summarizes why this issue is important, and who is affected
                    by it.
                  </p>
                </li>
                <li>
                  Element roles tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select an instance of an issue, or an element in the
                        document object model (DOM), or use the ‘Inspect
                        element’ command on the web page to:
                      </p>
                      <ul
                        style={{
                          listStyleType: "disc",
                          marginInlineStart: "2rem",
                        }}
                      >
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            Highlight the selected element, or the element
                            containing the selected issue, in the DOM under the
                            browser's Elements panel and highlight its location
                            on the web page.
                          </p>
                        </li>
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            See summary counts showing the number of issues of
                            each type within the selected element and its
                            children.
                          </p>
                        </li>
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            Open and highlight all issues in the element, if any
                            (purple highlight)
                          </p>
                        </li>
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            Open and highlight all issues in the element's
                            children, if any (light purple highlight).
                          </p>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Requirements tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the <strong>'Requirements'</strong> tab to view the
                        scan results by the{" "}
                        <a href="https://www.ibm.com/able/requirements/requirements/">
                          IBM accessibility requirements</a>.{" "}
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select an element or an instance of an issue to
                        highlight the same set of issues and child issues as in
                        the 'Element roles' tab. In this view, the issues will
                        be shown within the relevant requirements.
                      </p>
                    </li>
                  </ul>
                </li>
                <li>
                  Rules tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        {" "}
                        Select the <strong>'Rules'</strong> tab to view the scan
                        results by the Accessibility Checker rules.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select an element or an instance of an issue to
                        highlight the same set of issues and child issues as in
                        the 'Element roles' tab. In this view, the issues will
                        be shown within the relevant rules.
                      </p>
                    </li>
                  </ul>
                </li>

                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Switch between tabs to see the same set of highlighted
                    issues in different views.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Use the <strong>'Reports'</strong> menu button to download reports
                    and to store and manage scans to combine into reports. 
                    For details, see Sections{" "}
                    <a href="#t_single_scan_report" title="Create scan report">6.4 Creating a scan report</a>,{" "} 
                    <a href="#t_multi_scan_report" title="Create multi-scan report">6.5 Creating a multi-scan report</a>{" "}
                    and <a href="#the_report" title="accessibility checker report">7 Accessibility Checker reports</a>.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Optionally, you can update the code in the browser's
                    Elements panel and run <strong>'Scan'</strong> again to
                    confirm your code changes fix the issue.
                  </p>
                </li>
              </ol>
            </div>

            <h3 id="focus_view">6.2 Focus View</h3>
            <p>
            The <strong>'Focus view'</strong> switch allows you to switch between viewing all issues on the page, or only the issues for a selected element or component in the DOM. To focus on any individual element or component:
            </p>
            <div className="pa">
              <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the element or the component in the DOM, or
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Right-click on a page element and select 'Inspect' (Chrome) or ‘Inspect Element’ (Firefox).
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the element name in the <strong>‘Focus View’</strong> switch to view only the issues for that element and its children.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'All'</strong> option in the <strong>‘Focus View’</strong> switch to see all issues for the page again.
                  </p>
                </li>
              
              <p>By default, after the first scan of a page, all issues are shown, and the &lt;html&gt; element is selected, as shown in this screenshot:
              </p>
  

              <p>
                    <img
                      src="assets/img/6_2_FocusView1.png"
                      alt="Accessibility Checker screenshot - Focus view with all issues"
                      width="100%"
                      height="100%"
                    />
              </p>
              <p>In this screen shot, the search &lt;input&gt; element in the DOM has been selected, and the{" "} 
              <strong>'Focus View'</strong> switch has been set to show all the issues on the whole page:
              <br/>
              </p>
              <p>
                    <img
                      src="assets/img/6_2_FocusView2.png"
                      alt="Accessibility Checker screenshot. Focus view switch options are 'input' and 'All' (selected) and all issues on the page are shown"
                      width="100%"
                      height="100%"
                    />
              </p>
              <p>In this screen shot, the search &lt;input&gt; element in the DOM has been selected, and the{" "}
              <strong>‘Focus View’</strong> switch has been set to show only the issues for that search &lt;input&gt; element:
              </p>
              <p>
                    <img
                      src="assets/img/6_2_FocusView3.png"
                      alt="Accessibility Checker screenshot. Focus view switch options are 'input' (selected) and 'All' only the two issues within the search input element are shown"
                      width="100%"
                      height="100%"
                    />
              </p>

              </ol>
            </div>

            <h3 id="a11y_assess">6.3 Accessibility Assessment</h3>
            <div className="pa">
              <ol
                style={{
                  listStyleType: "decimal",
                  marginInlineStart: "2rem",
                  marginTop: " 0.75rem",
                }}
              >
                <li>
                  Open the Developer Tools:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        In Chrome: From the browser ‘View’ menu, select
                        ‘Developer’ and then select ‘Developer tools’, or{" "}
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        In Firefox: From the browser ‘Tools menu, select ‘Web
                        Developer’ and then select ‘Toggle Tools’, or
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press <strong>Command+Option+I</strong> on MacOS® or{" "}
                        <strong>Control+Shift+I</strong> on Microsoft Windows®,
                        or
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Right-click on a page element and select ‘Inspect’
                        (Chrome) or ‘Inspect Element’ (Firefox).
                      </p>
                    </li>
                  </ul>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'Accessibility Assessment'</strong>{" "}
                    panel:{" "}
                  </p>
                  <p>
                    <img
                      src="assets/img/6_3_AccessibilityAssessment2.png"
                      alt="Accessibility Assessment screenshot - A comprehensive accessibility assessment tool"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Click the <strong>'Scan'</strong> button to scan the web
                    page.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    By default, the results display by the{" "}
                    <strong>'Requirements'</strong> with a breakdown of
                    the total number of issues found by category.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The right panel displays an Accessibility Checker Report
                    summary, while the left panel shows the scan result with the
                    total number of issues found, with individual counts for
                    violations, items that need review, and recommendations:{" "}
                  </p>
                  <p>
                    <img
                      src="assets/img/6_3_AccessibilityAssessment5.png"
                      alt="Accessibility Assessment report screenshot - a sample report of Accessibility Assessment"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    By default, issues are shown in the 'Requirements' view, while
                    'Element roles' and 'Rules' tabs are also available. All
                    views show the same set of issues.
                  </p>
                </li>
                <li>
                  Requirements tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the expand icon next to a requirement in the table
                        to display a list of issues found within that
                        requirement.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select an instance of an issue and the report summary is
                        replaced with a detailed description that includes the
                        error level, why the content is failing, what the
                        requirement is, what resources to use, what to do to fix
                        the issue, who it affects, and why it is important:{" "}
                      </p>
                      <p>
                        <img
                          src="assets/img/6_3_AccessibilityAssessment7.png"
                          alt="Accessibility Assessment help panel screenshot - a sample help panel of Accessibility Assessment "
                          width="100%"
                          height="100%"
                        />
                      </p>
                    </li>
                  </ul>
                </li>
                <li>
                  Element roles tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the <strong>'Element roles'</strong> tab to view
                        the scan results organized by element roles on the web
                        page.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Expand an element role to view the issues for that
                        element role.
                      </p>
                    </li>
                    <li>
                      Select an issue to:
                      <ul
                        style={{
                          listStyleType: "disc",
                          marginInlineStart: "2rem",
                        }}
                      >
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            Highlight the issue.
                          </p>
                        </li>
                        <li>
                          <p style={{ marginTop: "0rem" }}>
                            View the detailed description for that issue in the
                            summary pane (on the left).
                          </p>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Rules tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the <strong>'Rules'</strong> tab to view the scan
                        results by the Accessibility Checker rule.
                      </p>
                      <li>
                        {" "}
                        <p style={{ marginTop: "0rem" }}>
                          Expand a rule to view the issues for that rule.
                        </p>
                      </li>
                      <li>
                        Select an issue to:
                        <ul
                          style={{
                            listStyleType: "disc",
                            marginInlineStart: "2rem",
                          }}
                        >
                          <li>
                            <p style={{ marginTop: "0rem" }}>
                              Highlight the issue.
                            </p>
                          </li>
                          <li>
                            <p style={{ marginTop: "0rem" }}>
                              View the detailed description for that issue in
                              the summary pane (on the left).
                            </p>
                          </li>
                        </ul>
                      </li>
                    </li>
                  </ul>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Optionally, you can select the browser's Element panel to
                    view the Accessibility Checker results alongside the code
                    and test fixes.
                  </p>
                </li>
              </ol>
            </div>

            <h3 id="t_single_scan_report">6.4 Creating a scan report</h3>
            <div className="pa">
            To generate a report for a single scan in the <strong>Accessibility Checker</strong> view:
            <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Follow the instructions in <a href="#a11y_check" title="Accessibility Checker">
                        6.1 Accessibility Checker</a> to scan the web page.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the <strong>'Reports'</strong> drop-down menu that follows the scan button.
                  </p>
                  <p>
              <img
                src="assets/img/6_4_CreatingSingleScanReport2.png"
                alt="Screen shot of the 'Reports' menu"
                width="100%"
                height="100%"
              />
            </p>

                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select <strong>'Download current scan'</strong>.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The report for the most recent scan will be downloaded in both HTML and MS Excel spreadsheet formats.
                </p>
                </li>
                </ol>
                <p>To generate a report for a single scan in the <strong>Accessibility Assessment</strong> view:
                </p>
                <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Follow the instructions in <a href="#a11y_assess" title="Accessibility Assessment">6.3 Accessibility Assessment</a> to scan the web page.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'Reports'</strong> button.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The report for the most recent scan will be downloaded in both HTML and MS Excel spreadsheet formats.
                  </p>
                </li>
              </ol>
            </div>

            <h3 id="t_multi_scan_report">6.5 Creating a multi-scan report</h3>
            <p>
              Follow these steps to combine several scans into a single report. 
              Up to 50 scans may be combined. Reports 
              with more than 50 scans may not open correctly in MS Excel due to 
              limitations of the libraries used to write the reports.
              </p>
             <div className="pa">
             <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the <strong>Accessibility Checker</strong> view (as described in <a href="#a11y_check" title="Accessibility Checker">
                        6.1 Accessibility Checker</a>).
                 </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the <strong>'Reports'</strong> drop-down menu.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'Start storing scans'</strong> menu item.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The status indicator below the scan button will show that you are now 
                    storing scans to build a report, and that no scans are stored.
                  </p>
                  <p>
                    <img
                      src="assets/img/6_5_CreatingMulti-scanReport4.png"
                      alt="Status: storing, no scans stored"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Scan the pages you want to include in the report.  This may include scans 
                    of the same page in different states. 
                    The status indicator will update to show how many scans are stored.
                  </p>
                  <p>
                    <img
                      src="assets/img/6_5_CreatingMulti-scanReport5.png"
                      alt="Status: storing, 1 scan stored"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    When storing scans, you may stop storing scans by selecting the <strong>'Stop storing scans'</strong>{" "} 
                    option in the <strong>'Reports'</strong> drop-down menu, and your stored scans will not be lost.  
                    You can start storing scans again at any time.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    To remove all stored scans, open the <strong>'Reports'</strong> drop-down menu and 
                    select <strong>'Clear stored scans'</strong>.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    When you have stored the scans for the report, open the <strong>'Reports'</strong> drop-down menu and select{" "} 
                    <strong>'View stored scans'</strong>. This opens the Scan manager view, showing a table listing all the stored scans. 
                  </p>
                  <p>
                        <img
                          src="assets/img/6_5_CreatingMulti-scanReport8.png"
                          alt="Accessibility Checker Stored Scans panel screenshot - a table listing the stored scans "
                          width="100%"
                          height="100%"
                        />
                  </p>
                </li>
              </ol>
              <p>Creating a report in the scan manager view:
              </p><ol 
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Review the scans listed and select the ones you want in the report. Select or unselect all 
                    the stored scans with the checkbox in the first column of the header row of the table.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Use the <strong>'View'</strong> link in the 'Details' column at the right of the table to see a screenshot of each scan.
                  </p>
                  <p>
                        <img
                          src="assets/img/6_5_CreatingMulti-scanReport10.png"
                          alt="Popup dialog with screenshot of scan, and details about the scan "
                          width="100%"
                          height="100%"
                        />
                      </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Unselect any scan you do not want in the report by unchecking its checkbox in the table. 
                  </p>
                  <p>
                        <img
                          src="assets/img/6_5_CreatingMulti-scanReport11.png"
                          alt="Accessibility Checker Stored Scans panel screenshot - one scan is unchecked "
                          width="100%"
                          height="100%"
                        />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    [Optional] To help differentiate the scans in the final report, enter meaningful scan labels 
                    in the 'Scan label’ column of the table.  These labels will appear in the final report.
                  </p>
                  <p>
                        <img
                          src="assets/img/6_5_CreatingMulti-scanReport12.png"
                          alt="Accessibility Checker Stored Scans panel screenshot - three scans are labelled 'Original scan', 'with form' and 'with link' "
                          width="100%"
                          height="100%"
                        />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Download the multi-scan report spreadsheet by selecting the <strong>'Download'</strong> button at the top of the table.
                    The spreadsheet will automatically download.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Remove the selected stored scans using the <strong>'Delete'</strong> button. 
                    This preserves memory for new scans to be stored.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Return to the main checker view by selecting <strong>'Back to list view'</strong>.
                  </p>
                </li>
              </ol>
            </div>

            <h3 id="t_select_hidden_settings">6.6 Hidden content scanning</h3>
            <p>
              By default, the tool skips hidden content (Web pages that use the{" "}
              <var>visibility:hidden</var> or <var>display:none</var> elements),
              if this content is displayed to the user at any point, you must
              test the web content by fully exercising the user interface
              according to the usage scenarios in your test plan. Ensure the
              tests trigger the display of hidden content so that the
              Accessibility Checker can validate the content that is displayed.
            </p>

            <h3 id="scan_local_files">6.7 Scan local files</h3>
            <p>
              The Accessibility Checker is able to scan local .html or .htm
              files launched in the Firefox browser by default. Follow the steps
              below to allow scanning of local .html or .htm files in the Chrome
              browser:
              </p>
            <div className="pa">
              <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the Chrome browser.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Open the <strong>'Window'</strong> menu.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'Extensions'</strong> menu option to see
                    all installed extensions.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the <strong>'Details'</strong> button of the IBM Equal
                    Access Accessibility Checker Extension.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Scroll down to <strong>'Allow access to file URLs'</strong>{" "}
                    and turn this option on.
                  </p>
                </li>
              </ol>
            </div>

            <h3 id="a11y_considerations">6.8 Accessibility Considerations</h3>
            <p>
              Highlighted below are several accessibility features for adaptability and to ensure ease of access to the Checker functionality, including with keyboard or with a screen reader: 
            </p>
            <div className="pa">
              <ol
                style={{ listStyleType: "decimal", marginInlineStart: "2rem" }}
              >
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    The Accessibility Checker tool is responsive to the user's preferred font size and colors.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Both the Accessibility Assessment view and the Accessibility Checker view are fully keyboard accessible, navigate as follows:
                  </p>
                </li>
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Use the <strong>'tab'</strong> key to navigate to any focusable element in the checker, starting
                        with the <strong>'Scan'</strong> button once the checker launches.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        After running the scan, press the <strong>'tab'</strong> key again, to navigate to the <strong>'Reports'</strong> drop-down menu button.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        In the Accessibility Checker view, press the <strong>'tab'</strong> key again to navigate to the 'Focus view’ toggle button. 
                        Use the arrow keys to select whether the issue list includes all issues (default) or just the issues for the currently focused element and its children. 
                        This function is not available in the Accessibility Assessment view. 
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press the <strong>'tab'</strong> key to navigate to the checkbox by each issue type and press the <strong>'enter'</strong> key to filter the list of issue by <strong>Violations</strong>, <strong>Needs review</strong> and/or by <strong>Recommendations</strong>.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press the <strong>'tab'</strong> key to navigate to the <strong>Issue List</strong> tabs and use the <strong>'right arrow'</strong> or the <strong>'left arrow'</strong> keys to navigate between the <strong>'Element Roles'</strong> view, the <strong>'Requirements'</strong> view and the <strong>'Rules'</strong> view.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press the <strong>'tab'</strong> key to navigate through the <strong>issue groupings</strong> associated with each requirement, element role or rule. Use the <strong>'enter'</strong> key to open or close an issue grouping. Within an open grouping, press the <strong>'tab'</strong> key to navigate to each issue, and press the <strong>'enter'</strong> key to select the current issue.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Press the <strong>'tab'</strong> key to move to the <strong>'Learn more'</strong> link or to move to the next issue.
                      </p>
                    </li>
                  </ul>  
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Use the <strong>headings</strong> hierarchy or the implemented <strong>landmarks</strong> to quickly navigate from one section to another. The list of implemented landmarks are as follows:
                  </p>
                </li>
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        The <strong>Accessibility Assessment</strong> or the <strong>Accessibility Checker</strong> main landmark contains the main functionality of the tool in each view and includes,
                      </p>
                      <ul
                          style={{
                            listStyleType: "disc",
                            marginInlineStart: "2rem",
                          }}
                        >
                          <li>
                            <p style={{ marginTop: "0rem" }}>
                              The <strong>Issue Count</strong> region: contains the issue count by issue type as well as the total number of issues found.
                            </p>
                          </li>
                          <li>
                            <p style={{ marginTop: "0rem" }}>
                              The <strong>Issue List</strong> region: contains the list of issues grouped by Element Roles, by Requirements or by Rules.
                            </p>
                          </li>
                          <li>
                          <p style={{ marginTop: "0rem" }}>
                            In the Accessibility Checker view, the main landmark also containes issue help and the overview of stored scans, when those are 
                            requested by the user.
                          </p>
                         </li>
                        </ul>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        The Accessibility Assessment view <strong>Scan Summary</strong> aside or the complementary landmark contains the scan summary, after the scan completes or shows the issue help when any issue is selected.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        The Accessibility Assessment view <strong>Issue Help</strong> aside or the complementary landmark contains the issue help when any issue is selected.
                      </p>
                    </li>
                  </ul>
              </ol>
            </div>

            <h2 id="the_report">7. Accessibility Checker reports</h2>
            <p>
            The Accessibility Checker can create reports for a single scan, or for multiple scans combined (multi-scan reports). 
            Single scan reports are provided in both HTML and MS Excel spreadsheet formats. 
            Multi-scan reports are available only in MS Excel spreadsheet format. 
            Sections <a href="#t_single_scan_report"
                        title="Create scan report">
                  6.4 Creating a scan report
                  </a>{" "}
                  and <a href="#t_multi_scan_report"
                        title="Create multi-scan report">
                    6.5 Creating a multi-scan report
                  </a>{" "}
                  describe how to generate reports.
            </p>
            <h3 id="t_html_report">7.1 HTML report</h3>
            <p>
              This is an interactive report saved as an HTML file for future use. It includes the report
              scan date and time, URL, and a summary of test results followed by
              the issue details organized by requirements, by element
              roles, and by rules. Each instance of an issue also includes a{" "}
              <strong>'Learn more'</strong> link that opens an overlay
              containing a more detailed description of the issue.
            </p>
            <p>
              The current accessibility status of the Web content displays as a
              percentage of elements with no detected violations or items to
              review.{" "}
            </p>
            <p>
              <strong>Important Note:</strong> This percentage is based on
              automated tests only. Be sure to perform additional reviews and
              manual tests to complete the accessibility assessments. Use the{" "}
              <a href="www.ibm.com/able/toolkit">IBM Equal Access Toolkit</a> as
              a guide.
            </p>
            <p>
              <img
                src="assets/img/7_1_Report.png"
                alt="Screen shot of an Accessibility Checker Report"
                width="100%"
                height="100%"
              />
            </p>
            <h3 id="t_excel_report">7.2 MS Excel Spreadsheet report</h3>
            <p>
              This is a 5 sheet spreadsheet report. It can describe a single scan, or multiple scans.
            </p>
            <ol
              style={{
                listStyleType: "decimal",
                marginInlineStart: "2rem",
                marginTop: " 0.75rem",
              }}
            >
              <li>
                <p style={{ marginTop: "0rem" }}>
                  <strong>Overview</strong> includes the name of the tool with its version, the scan date, 
                  ruleset, guidelines and platform used for the scan, and a summary of the overall results across all included scans.  
                </p>            
              </li>
              <li>
                <p style={{ marginTop: "0rem" }}>
                  <strong>Scan summary</strong> provides an overview of the set of scans within the report.
                </p>            
              </li>
              <li>
                <p style={{ marginTop: "0rem" }}>
                  <strong>Issue Summary</strong> provides an overview of the issues found across all the scans.  
                  Issues are summarized in a prioritized order, starting with Level 1 items, 
                  as defined in the IBM Equal Access Toolkit, followed by Level 2 and Levels 3 
                  and 4.  Levels 1-3 are necessary to complete the IBM requirements. Within each 
                  level, the summary lists issues that are Violations, items that Need Review, 
                  and Recommendations. Counts are provided for each type of issue.
                </p>            
              </li>
              <li>
                <p style={{ marginTop: "0rem" }}>
                  <strong>Issues</strong> has the details of the individual issues. This includes the scan label 
                  assigned to the scan, an ID for each issue, relevant accessibility requirements, 
                  and toolkit levels.
                </p>            
              </li>
              <li>
                <p style={{ marginTop: "0rem" }}>
                  <strong>Definition of fields</strong> defines the columns in the other sheets.
                </p>            
              </li>
            </ol>
            <p>
            In a multi-scan report where the same page is scanned several times, 
            issues may be repeated across scans of the same page.  These duplicate 
            issues can be identified by having the same Issue ID.  Where a site template 
            or reused component has issues, these will also be repeated in the report, 
            but may have different Issue IDs.
            </p>            
            <h2 id="feedback">8. Feedback</h2>
              <div className="pa">
                Visit the{" "}
                  <a href="https://github.com/IBMa/equal-access/issues">
                  Equal Access git repository</a> to:
                <ol
                style={{ listStyleType: "circle", marginInlineStart: "2rem" }}
                >
                  <li>
                    <p style={{ marginTop: "0rem" }}>
                      Report a problem with the checker tool.
                    </p>            
                  </li>
                  <li>
                    <p style={{ marginTop: "0rem" }}>
                      Report a problem with the checker rules or accuracy of the errors reported by the checker.
                    </p>            
                  </li>
                  <li>
                    <p style={{ marginTop: "0rem" }}>
                      Find information on any existing issues.
                    </p>            
                  </li>
                </ol>
              </div>
          </div>
          <div className="bx--col-md-0 bx--col-lg-3 buffer"></div>
        </div>
      </div>
    );
  }
}

export default UsingACApp;
