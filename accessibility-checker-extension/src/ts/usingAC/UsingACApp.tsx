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
//import "./AC_styles.css";
//const purple_bee = "/assets/Bee_Logo@64px.png";

export default class UsingACApp extends React.Component {
  render() {
    //const manifest = chrome.runtime.getManifest();
    return (
      <main>
        <div className="header">
          <h1>
            <img
              src="assets/img/be.svg"
              style={{ width: "50px", height: "60px" }}
              alt="Bee equal logo"
            />
            IBM Equal Access Accessibility Checker{" "}
          </h1>
          <h2 className="h2head">user guide</h2>
        </div>

        <div>
          <p>
            The IBM Equal Access Accessibility Checker is a browser extension
            that allows users to evaluate a web-based component or solution for
            accessibility issues against the latest WCAG 2.1 standards with
            explanations and suitable fixes right within the tool.{" "}
          </p>
          <p>
            This checker is part of an open suite of accessibility automation
            tools. For teams seeking integrated accessibility testing, IBM
            offers{" "}
            <a href="https://github.com/IBMa/equal-access/blob/master/README.md">
              plug-ins and modules for NodeJS and Karma
            </a>{" "}
            that perform cross-platform accessibility testing in the build and
            development process. These tools use the same test engine as the
            Accessibility Checker.
          </p>
          <p>
            Learn how to design, build and test for accessibility with the{" "}
            <a href="https://ibm.com/able/toolkit">IBM Equal Access Toolkit</a>.
          </p>
        </div>

        <div>
          <ul className="toc">
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
                3. Categories of issue
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
                    5.1 Rule set deployment
                  </a>
                </li>
                <li>
                  <a href="#ruleset" title="rule set">
                    5.2 Rule set
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
                  <a href="#a11y_assess" title="Accessibility Assessment">
                    6.2 Accessibility Assessment
                  </a>
                </li>
                <li>
                  <a
                    href="#t_select_hidden_settings"
                    title="Select hidden content Settings"
                  >
                    6.3 Hidden content scanning
                  </a>
                </li>
              </ul>
            </li>

            <li>
              <a href="#the_report" title="accessibility checker report">
                7. Accessibility Checker Report{" "}
              </a>
              <ul className="toc">
                <li>
                  <a href="#t_view_report" title="Reviewing report">
                    7.1 Review the report
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div>
            <h2 id="prereq" className="h2section">
              1. Prerequisites
            </h2>
            Supported browsers:
            <ul>
              <li>Google Chrome Version 81.x or later</li>
              <li>Mozilla Firefox Version 68.x or later</li>
            </ul>
            <h2 id="install">2. Installation</h2>
            Follow the steps below to install the browser extension on Google
            Chrome:
            <ol>
              <li>Open the Chrome browser.</li>
              <li>
                Go to the
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
            Follow the steps below to install the browser extension on Mozilla
            Firefox:
            <ol>
              <li>Open the Firefox browser.</li>
              <li>
                Go to the
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
          <div id="categories">
            <h2>3. Categories of issue</h2>
            The tool reports three kinds of accessibility issues:
          </div>
          <div>
            <ul>
              <li>
                <img
                  src="assets/img/Violation16.svg"
                  style={{ maxHeight: "50px" }}
                  alt=" "
                />
                <strong>Violation</strong>- accessibility failures that need to
                be corrected.
              </li>
              <li>
                <img
                  src="assets/img/NeedsReview16.svg"
                  style={{ maxHeight: "50px" }}
                  alt=" "
                />
                <strong> Needs review</strong> - issues that may not be a
                violation. These need manual review to identify whether there is
                an accessibility problem.
              </li>
              <li>
                <img
                  src="assets/img/Recommendation16.svg"
                  style={{ maxHeight: "50px" }}
                  alt=" "
                />
                <strong>Recommendation</strong> - opportunities to apply best
                practices to further improve accessibility.
              </li>
            </ul>
            <p>
              As with any automated test tool for accessibility, these tests
              don’t catch all issues. Complete your accessibility assessment
              with a quick unit test for accessibility or follow the full
              accessibility test process.
            </p>
          </div>
          <div id="view">
            <h2>4. Ways to view the issues</h2>
            There are three ways to view and explore the issues identified by
            the tool. All views show the same set of issues:
            <ul>
              <li>
                <strong>Checklist</strong> - issues are organized by the
                relevant checkpoints of the IBM Checklist, which corresponds to
                the WCAG 2.1 standards. Each issue is mapped to exactly one
                checkpoint. This view makes it easy to see how to classify and
                report issues found by the tool.
              </li>
              <li>
                <strong>Element roles </strong>- issues are organized in the
                hierarchical structure defined by the WAI-ARIA roles of the DOM
                elements. This view shows both implicit and explicit roles. It
                does not show element names. This view is ideal for exploring
                the issues within a specific element and its children.
              </li>
              <li>
                <strong>Rules</strong> - issues are organized by the rules in
                the rule set, with violations listed first, followed by items
                that need review, and then recommendations. This view is the
                best way to see all the violations listed together.
              </li>
            </ul>
          </div>
          <div id="t_select_settings">
            <h2>5. Options</h2>
            By default, the IBM Equal Access Accessibility Checker uses a set of
            rules that correspond to the most recent WCAG standards, and these
            rules are updated regularly. If you need to test against a different
            standard or a specific rule set version, use the options to select
            the archived rule set by date of deployment and standard used.
          </div>
          <div>
            Follow the steps below to open the Accessibility Checker options
            page:
            <ol>
              <li>
                In the browser tool bar, select the IBM Equal Access
                Accessibility Checker icon, shown as a purple bee{" "}
                <img
                  src="assets/img/BE_for_Accessibility_darker.svg"
                  style={{ width: "18px", height: "20px" }}
                  alt="Accessibility checker application icon"
                />
                . This will usually be located in the upper right of the browser
                window. An overlay will appear.
              </li>
              <li>
                Select <strong>'Options'</strong> in the overlay. The options
                will open in a new browser tab.
              </li>
            </ol>
            <img
              src="assets/img/options.png"
              alt="Options screenshot"
              className="responsive"
            />
          </div>
          <div id="rule_deploy">
            <h3>5.1 Rule set deployment</h3>
            From the <strong>‘Rule set deployment’</strong> dropdown choose one
            of the following:
            <ul>
              <li>
                Latest - use the latest version of the selected rule set. This
                is the default option.
              </li>
              <li>
                &lt;date&gt; Deployment - use the rule set version from a
                specific date. Use this option if you need to rerun a test
                exactly as it ran on a previous date.
              </li>
              <li>
                Preview - this option extends the Latest rule set to include a
                preview of new rules that may be added in future. These rules
                are experimental and liable to change. This option is not
                recommended if testing results must be replicated in the future.
              </li>
            </ul>
            Select the <strong>'Save'</strong> button to keep the changes or the{" "}
            <strong>'Reset'</strong> button to discard changes.
          </div>
          <div id="ruleset">
            <h3>5.2 Rule set</h3>
            From the <strong>‘Select rule set’</strong> dropdown choose one of
            the following:
            <ul>
              <li>
                IBM Accessibility April 2020 - Rules for Web Content Accessibility
                Guidelines (WCAG ) 2.1 level A and level AA. This is the current
                W3C recommendation and extends Web Content Accessibility
                Guidelines 2.0. Content that conforms to WCAG 2.1 also conforms
                to WCAG 2.0. This is the default option.
              </li>
              <li>
                IBM Accessibility Experimental - Rules for WCAG 2.1 level A and level AA plus
                additional IBM checklist supplemental requirements.
              </li>
            </ul>
          </div>

          <div id="usage">
            <h2>6. Usage</h2>

            <p>
              The IBM Equal Access Accessibility Checker offers two views, the
              Accessibility Checker view is a code scanner for developers
              looking to find and fix errors quickly as they are building a
              component, while the Accessibility Assessment view provides
              explanation and suggested solutions for each issue reported.
            </p>
            <div>
              <div>
                <div id="a11y_check">
                  <h3>6.1 Accessibility Checker</h3>
                </div>

                <ol>
                  <li>
                    Open the Developer Tools:
                    <ul>
                      <li>
                        In Chrome: From the browser ‘View’ menu, select
                        ‘Developer’ and then select ‘Developer tools’, or{" "}
                      </li>
                      <li>
                        in Firefox: From the browser ‘Tools‘ menu, select ‘Web
                        Developer’ and then select ‘Toggle Tools’, or
                      </li>
                      <li>
                        press <strong>Command+Option+I</strong> on MacOS® or
                        <strong>Control+Shift+I</strong> on Microsoft Windows®,
                        or
                      </li>
                      <li>
                        right click on a page element and select ‘Inspect’
                        (Chrome) or ‘Inspect Element’ (Firefox).
                      </li>
                    </ul>
                  </li>
                  <li>
                    Open the ‘Elements’ panel (Chrome) or ‘Inspector’ panel
                    (Firefox).
                  </li>
                  <li>
                    Select <strong>'Accessibility Checker'</strong> from the
                    tabs in the right-hand pane:{" "}
                    <img
                      src="assets/img/a11yCheck.png"
                      alt="Accessibility Checker screenshot"
                      className="responsive"
                    />
                  </li>
                  <li>
                    Click the <strong>'Scan'</strong> button to scan the web
                    page.
                  </li>
                  <li>
                    The scan result displays the total number of issues found
                    with individual counts for violations, items that need
                    review, and recommendations. By default, the issues are
                    shown in the ‘Element roles’ view (see previous definition),
                    while ‘Checklist’ and ‘Rules’ tabs are also available. All
                    views show the same set of issues.
                  </li>
                  <li>
                    Select the expand icon next to an element role, checkpoint
                    or rule in the table to display the corresponding issues
                    found.
                  </li>
                  <li>
                    Select the link for an issue to view more detailed help
                    information that describes the issue and how to fix it. The
                    help includes links to more detailed explanations, and
                    summarizes why this issue is important, and who is affected
                    by it.
                  </li>
                  <li>
                    Element roles tab:
                    <img
                      src="assets/img/checkResults.png"
                      alt="Accessibility Checker results screenshot"
                      className="responsive"
                    />
                    <ul>
                      <li>
                        Select an element in the document object model (DOM), or
                        use the ‘Inspect element’ command on the web page to:
                        <ul>
                          <li>
                            Highlight the code that contains the issue in the
                            document object model (DOM) in the browser's
                            Elements panel and its location in the web page.
                          </li>
                          <li>
                            Update the summary counts to show how many issues of
                            each type are within the selected element and its
                            children.
                          </li>
                          <li>
                            Open and highlight all issues in the element, if any
                            (purple highlight)
                          </li>
                          <li>
                            Open and highlight all issues in the element's
                            child, if any (light purple highlight).
                          </li>
                        </ul>
                      </li>
                      <li>
                        Select an instance of an issue to:
                        <ul>
                          <li>
                            Highlight the element that contains the issue in the
                            document object model (DOM ) under the browser's
                            Elements panel and its location in the web page.
                          </li>
                          <li>
                            Update the summary counts to show how many issues of
                            each type are within the highlighted element and its
                            children.
                          </li>
                          <li>
                            Open and highlight the issue, and all other issues
                            in the same element, if any (purple highlight).
                          </li>
                          <li>
                            Open and highlight issues in the element's child, if
                            any (light purple  highlight).
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Checklist tab:
                    <ul>
                      <li>
                        Select the <strong>'Checklist'</strong> tab to view the
                        scan results by the IBM accessibility checklist
                        checkpoints.
                      </li>
                      <li>
                        Select an element or an instance of an issue to
                        highlight the same set of issues and child issues as in
                        the 'Element roles’ tab. In this view, the issues will
                        be shown within the relevant checkpoints.
                      </li>
                    </ul>
                  </li>

                  <li>
                    Rules tab:
                    <ul>
                      <li>
                        Select the <strong>'Rules'</strong> tab to view the scan
                        results by the Accessibility Checker rules.
                      </li>
                      <li>
                        Select an element or an instance of an issue to
                        highlight the same set of issues and child issues as in
                        the 'Element roles’ tab. In this view, the issues will
                        be shown within the relevant rules.
                      </li>
                    </ul>
                  </li>

                  <li>
                    Switch between tabs to see the same set of highlighted
                    issues in different views.
                  </li>
                  <li>
                    Use the <strong>‘Reset’</strong> button to return the view
                    to the way it was just after scanning, with no issues
                    highlighted or opened.
                  </li>
                  <li>
                    Use the ‘Report’ button to download a standalone html report
                    that includes the same three views and all the help
                    information provided in the checker.
                  </li>
                  <li>
                    Optionally, you can update the code in the browser's
                    Elements panel and run 'Scan' again to confirm your code
                    changes fix the issue.
                  </li>
                </ol>
              </div>
              <div>
                <div id="a11y_assess">
                  <h3>6.2 Accessibility Assessment</h3>
                </div>

                <ol>
                  <li>
                    Open the Developer Tools:
                    <ul>
                      <li>
                        In Chrome: From the browser ‘View’ menu, select
                        ‘Developer’ and then select ‘Developer tools’, or{" "}
                      </li>
                      <li>
                        in Firefox: From the browser ‘Tools menu, select ‘Web
                        Developer’ and then select ‘Toggle Tools’, or
                      </li>
                      <li>
                        press <strong>Command+Option+I</strong> on MacOS® or
                        <strong>Control+Shift+I</strong> on Microsoft Windows®,
                        or
                      </li>
                      <li>
                        right click on a page element and select ‘Inspect’
                        (Chrome) or ‘Inspect Element’ (Firefox).
                      </li>
                    </ul>
                  </li>
                  <li>
                    Open the ‘Elements’ panel (Chrome) or ‘Inspector’ panel
                    (Firefox).
                  </li>
                  <li>
                    Select the <strong>'Accessibility Assessment'</strong>{" "}
                    panel:{" "}
                    <img
                      src="assets/img/a11yAssess.png"
                      alt="Accessibility Assessment screenshot"
                      className="responsive"
                    />
                  </li>
                  <li>
                    Click the <strong>'Scan'</strong> button to scan the web
                    page.
                  </li>
                  <li>
                    By default, the results display by the{" "}
                    <strong>'Checklist'</strong> checkpoints with a breakdown of
                    the total number of issues found by violation level.
                  </li>
                  <li>
                    The right panel displays an Accessibility Checker Report
                    summary:{" "}
                    <img
                      src="assets/img/assessReport.png"
                      alt="Accessibility Checker report screenshot"
                      className="responsive"
                    />
                  </li>
                  <li>
                    The scan result displays the total number of issues found
                    with individual counts for violations, items that need
                    review, and recommendations. By default, issues are shown in
                    the 'Checklist' view, while ‘Element roles’ and ‘Rules’ tabs
                    are also available. All views show the same set of issues.
                  </li>
                  <li>
                    Checklist tab:
                    <ul>
                      <li>
                        Select the expand icon next to a checkpoint in the table
                        to display a list of issues found within that
                        checkpoint.
                      </li>
                      <li>
                        oSelect an instance of an issue and the report summary
                        is replaced with help text that shows the error level,
                        why the content is failing, what is the requirement with
                        resource links, explains what to do to fix the issue,
                        who it affects, and why it is important:{" "}
                        <img
                          src="assets/img/helpPanel.png"
                          alt="Accessibility Assessment help panel screenshot"
                          className="responsive"
                        />
                      </li>
                    </ul>
                  </li>
                  <li>
                    Element roles tab:
                    <ul>
                      <li>
                        Select the <strong>'Element roles'</strong> tab to view
                        the scan results for each element in the web page.
                      </li>
                      <li>
                        Expand an element role to view the issues for that
                        element role.
                      </li>
                      <li>
                        Select an issue to:
                        <ul>
                          <li>Highlight the issue.</li>
                          <li>
                            View the help text for that issue in the summary
                            pane (on the left).
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Rule tab:
                    <ul>
                      <li>
                        Select the <strong>'Rules'</strong> tab to view the scan
                        results by the Accessibility Checker rule.
                      </li>
                      <li>Expand a rule to view the issues for that rule.</li>
                      <li>
                        Select an issue to:
                        <ul>
                          <li>Highlight the issue.</li>
                          <li>
                            View the help text for that issue in the summary
                            pane (on the left).
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Optionally, the user can select the browser's Element panel
                    to view the Accessibility Checker results in the code and
                    test fixes.
                  </li>
                </ol>
              </div>

              <div id="t_select_hidden_settings">
                <h3>6.3 Hidden content scanning</h3>
                <div>
                  {" "}
                  By default the tool skips content that is hidden (Web pages
                  that use the
                  <var>visibility:hidden</var> or <var>display:none</var>{" "}
                  elements), if this content gets displayed to the user at any
                  point, the user must test the web content by fully exercising
                  the user interface according to the usage scenarios in the
                  test plan. Ensure the tests trigger the display of hidden
                  content so that the Accessibility Checker can validate the
                  content that is displayed.
                </div>
              </div>
            </div>
          </div>
          <div id="the_report">
            <h3>7. Accessibility Checker report</h3>
          </div>
          <p>
            The Accessibility Checker provides a full report that you can
            download as HTML. To open the Accessibility Checker report:
          </p>

          <ol>
            <li>
              Follow the instructions in{" "}
              <a href="#a11y_checker" title="Accessibility Checker">
                4.1 Accessibility Checker
              </a>{" "}
              or{" "}
              <a href="#a11y_assess" title="Accessibility Assessment">
                4.2 Accessibility Assessment
              </a>{" "}
              sections to scan the web page.
            </li>
            <li>
              Select the <strong>'Report'</strong> icon to download the report:
              <img
                src="assets/img/fullReport.png"
                alt="Accessibility Checker report screenshot"
                className="responsive"
              />
            </li>
          </ol>
          <div id="t_view_report">
            <h3>7.1 Review the report</h3>
          </div>
          <p>
            The Accessibility Checker Report is an interactive report that you
            can save as an HTML file for future use. It includes the report scan
            date and time, URL, and a summary of test results followed by the
            issue details organized by checklist checkpoint, by Element roles
            and by rules. Each instance of an issue also includes a
            <strong>'Learn more'</strong> link that opens an overlay containing
            additional help text.
          </p>

          <p>
            The current accessibility status of the Web content displays as a
            percentage of elements with no detected violations.{" "}
            <b>Important Note:</b> This percentage is based on automated tests
            only. Be sure to perform additional reviews and manual tests to
            complete the accessibility assessments. Use the{" "}
            <a href="www.ibm.com/able/toolkit">IBM Equal Access Toolkit</a> as a
            guide.
          </p>

          <img
            src="assets/img/report.png"
            alt="Screen shot of the Accessibility Checker Report"
            className="responsive"
          />
        </div>
      </main>
    );
  }
}
