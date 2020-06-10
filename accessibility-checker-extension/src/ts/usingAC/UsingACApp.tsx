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

//import { Restart16, Save16 } from "@carbon/icons-react";

import beeLogoUrl from "../../assets/Bee_Logo.svg";
import violation from "../../assets/Violation16.svg";
import needsReview from "../../assets/NeedsReview16.svg";
import recommendation from "../../assets/Recommendation16.svg";

interface UsingACAppState {}

class UsingACApp extends React.Component<{}, UsingACAppState> {
  state: UsingACAppState = {};

  render() {
    return (
      <div className="bx--grid bx--grid--full-width">
        <div className="bx--row">
          <div className="bx--col-sm-4 bx--col-md-8 bx--col-lg-4 leftPanel">
            <img src={beeLogoUrl} alt="purple bee icon" className="icon" />
            <h2>
              IBM <strong>Accessibility</strong>
              <br />
              Equal Access Toolkit:
              <br />
              Accessibility Checker
            </h2>
            <h3>
              <strong>User guide</strong>
            </h3>
            <div style={{ marginTop: "2.625rem", lineHeight: "32px" }}>
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
            </div>
          </div>
          <div className="bx--col-md-0 bx--col-lg-1 buffer"></div>
          <div className="bx--col-md-8 bx--col-lg-8 rightPanel">
            <h2>About Equal Access Accessibility Checker</h2>

            <p>
              The IBM Equal Access Accessibility Checker is a browser extension
              that allows users to evaluate a web-based component or solution
              for accessibility issues against the latest WCAG 2.1 standards
              with explanations and suitable fixes within the tool.
            </p>
            <p>
              The extension showcases two views, the <strong>Assessment</strong> panel helps you identify accessibility issues and understand how to fix them, while the <strong> Accessibility Checker tab in the Elements panel in Chrome or the Inspector panel in Firefox</strong> helps you to locate your issues in the code and on the page. This checker is part of an open suite of accessibility automation tools. For teams seeking integrated accessibility testing, IBM offers{" "}
              <a href="https://github.com/IBMa/equal-access/blob/master/README.md">
                plug-ins and modules for NodeJS and Karma
              </a>{" "}
              that perform cross-platform accessibility testing in the build and
              development process. These tools use the same test engine as the
              Accessibility Checker.
            </p>
            <h3 id="prereq">1. Prerequisites</h3>
            <div className="pa">
              Supported browsers:
              <ul
                style={{ listStyleType: "circle", marginInlineStart: "1rem" }}
              >
                <li>Google Chrome version 81.x or later</li>
                <li>Mozilla Firefox version 68.x or later</li>
              </ul>
            </div>

            <h3 id="install">2. Installation</h3>
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
              Follow the steps below to install the browser extension for Mozilla
              Firefox:
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

            <h3 id="categories">3. Categories of accessibility issues</h3>
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
                  violation. These need a manual review to identify whether there
                  is an accessibility problem.
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

            <h3 id="view">4. Ways to view the issues</h3>
            <p>
              There are three ways to view and explore the issues identified by
              the tool. All views show the same set of issues:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>Checklist</strong> - issues are organized by the
                  relevant checkpoints of the IBM Checklist, which corresponds
                  to the WCAG 2.1 standards. Each issue is mapped to exactly one
                  checkpoint. This view makes it easy to see how to classify and
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

            <h3 id="t_select_settings">5. Options</h3>
            <p>
              By default, the IBM Equal Access Accessibility Checker uses a set
              of rules that correspond to the most recent WCAG standards, and
              these rules are updated regularly. If you need to test against a
              different standard or a specific ruleset version, use the options
              to select the archived rule set by date of deployment and standard
              used.
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
                </p>
              </li>
            </ol>
            <p>
              <img
                src="assets/img/options.png"
                alt="Options screenshot"
                width="100%"
                height="100%"
              />
            </p>

            <h4 id="rule_deploy">5.1 Rule set deployment</h4>
            <p>
              {" "}
              From the <strong>‘Rule set deployment’</strong> dropdown choose
              one of the following:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>Latest</strong> - use the latest version of the
                  selected rule set. This is the default option.
                </p>
              </li>
              <li>
                <p>
                  <strong>&lt;date&gt;</strong> Deployment - use the rule set
                  version from a specific date. Use this option if you need to
                  rerun a test exactly as it ran on a previous date.
                </p>
              </li>
              <li>
                <p>
                  <strong>Preview</strong> - this option extends the Latest rule
                  set to include a preview of new rules that may be added in
                  the future. These rules are experimental and liable to change.
                  This option is not recommended if testing results must be
                  replicated in the future.
                </p>
              </li>
            </ul>
            <p>
              Select the <strong>'Save'</strong> button to keep the changes or
              the <strong>'Reset'</strong> button to discard changes.
            </p>

            <h4 id="ruleset">5.2 Rule set</h4>
            <p>
              From the <strong>‘Select rule set’</strong> dropdown choose one of
              the following:
            </p>
            <ul style={{ marginInlineStart: "2rem" }}>
              <li>
                <p>
                  <strong>IBM Accessibility</strong> - Rules for Web Content
                  Accessibility Guidelines WCAG 2.1 level A and level AA, plus
                  additional IBM checklist supplemental requirements. This is
                  the default option.
                </p>
              </li>

              <li>
                <p>
                  <strong>IBM Accessibility Experimental</strong> - Rules for
                  WCAG 2.1 level A and level AA plus additional IBM checklist
                  supplemental requirements and experimental rules.
                </p>
              </li>

              <li>
                <p>
                  <strong>WCAG 2.0</strong> - Rules for Web Content
                  Accessibility Guidelines WCAG 2.0 level A and level AA.
                  These rules align with the Revised US Sec 508 standards.
                </p>
              </li>

              <li>
                <p>
                  <strong>WCAG 2.1</strong> - Rules for Web Content
                  Accessibility Guidelines WCAG 2.1 level A and level AA.
                  These rules align with the European EN 301 549 standards.
                </p>
              </li>
            </ul>

            <h3 id="usage">6. Usage</h3>
            <p>
              The IBM Equal Access Accessibility Checker offers two views, the
              Accessibility Checker view is a code scanner for developers
              looking to find and fix errors quickly as they are building a
              component, while the Accessibility Assessment view provides
              explanation and suggested solutions for each issue reported.
            </p>

            <h4 id="a11y_check">6.1 Accessibility Checker</h4>
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
                      src="assets/img/a11yCheck.png"
                      alt="Accessibility Checker screenshot"
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
                    review, and recommendations. By default, the issues are
                    shown in the ‘Element roles’ view (see the previous definition),
                    while ‘Checklist’ and ‘Rules’ tabs are also available. All
                    views show the same set of issues.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the expand icon next to an element role, checkpoint,
                    or rule in the table to display the corresponding issues
                    found.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Select the link for an issue to view more detailed help
                    information that describes the issue and how to fix it. The
                    help includes links to more detailed explanation, and
                    summarizes why this issue is important, and who is affected
                    by it.
                  </p>
                </li>
                <li>
                  Element roles tab:
                  <p>
                    <img
                      src="assets/img/checkResults.png"
                      alt="Accessibility Checker results screenshot"
                      width="100%"
                      height="100%"
                    />
                  </p>
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
                            containing the selected issue, in the browser's
                            Elements panel and highlight its location on the web
                            page.
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
                            child, if any (light purple highlight).
                          </p>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Checklist tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the <strong>'Checklist'</strong> tab to view the
                        scan results by the IBM accessibility checklist
                        checkpoints.
                      </p>
                    </li>
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select an element or an instance of an issue to
                        highlight the same set of issues and child issues as in
                        the 'Element roles’ tab. In this view, the issues will
                        be shown within the relevant checkpoints.
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
                        the 'Element roles’ tab. In this view, the issues will
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
                    Use the <strong>‘Reset’</strong> button to return the view
                    to the way it was just after scanning, with no issues
                    highlighted or opened.
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    Use the <strong>‘Report’</strong> button to download a
                    standalone HTML report that includes the same three views
                    and all the help information provided in the checker.
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

            <h4 id="a11y_assess">6.2 Accessibility Assessment</h4>
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
                      src="assets/img/a11yAssess.png"
                      alt="Accessibility Assessment screenshot"
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
                    <strong>'Checklist'</strong> checkpoints with a breakdown of
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
                      src="assets/img/assessReport.png"
                      alt="Accessibility Checker report screenshot"
                      width="100%"
                      height="100%"
                    />
                  </p>
                </li>
                <li>
                  <p style={{ marginTop: "0rem" }}>
                    By default, issues are shown in the 'Checklist' view, while
                    'Element roles' and 'Rules' tabs are also available. All
                    views show the same set of issues.
                  </p>
                </li>
                <li>
                  Checklist tab:
                  <ul
                    style={{
                      listStyleType: "circle",
                      marginInlineStart: "2rem",
                    }}
                  >
                    <li>
                      <p style={{ marginTop: "0rem" }}>
                        Select the expand icon next to a checkpoint in the table
                        to display a list of issues found within that
                        checkpoint.
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
                          src="assets/img/helpPanel.png"
                          alt="Accessibility Assessment help panel screenshot"
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

            <h4 id="t_select_hidden_settings">6.3 Hidden content scanning</h4>
            <p>
              By default, the tool skips hidden content (Web pages that
              use the <var>visibility:hidden</var> or <var>display:none</var>{" "}
              elements), if this content is displayed to the user at any point,
              you must test the web content by fully exercising the user
              interface according to the usage scenarios in your test plan.
              Ensure the tests trigger the display of hidden content so that the
              Accessibility Checker can validate the content that is displayed.
            </p>

            <h3 id="the_report">7. Accessibility Checker report</h3>
            <p>
              The Accessibility Checker provides a full report that you can
              download as HTML. To open the Accessibility Checker report:
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
                  Follow the instructions in{" "}
                  <a href="#a11y_check" title="Accessibility Checker">
                    6.1 Accessibility Checker
                  </a>{" "}
                  or{" "}
                  <a href="#a11y_assess" title="Accessibility Assessment">
                    6.2 Accessibility Assessment
                  </a>{" "}
                  sections to scan the web page.
                </p>
              </li>
              <li>
                <p style={{ marginTop: "0rem" }}>
                  Select the <strong>'Report'</strong> icon to download the
                  report:
                </p>
                <p>
                  <img
                    src="assets/img/fullReport.png"
                    alt="Accessibility Checker report screenshot"
                    width="100%"
                    height="100%"
                  />
                </p>
              </li>
            </ol>

            <h4 id="t_view_report">7.1 Review the report</h4>
            <p>
              The Accessibility Checker Report is an interactive report that you
              can save as an HTML file for future use. It includes the report
              scan date and time, URL, and a summary of test results followed by
              the issue details organized by checklist checkpoints, by element
              roles, and by rules. Each instance of an issue also includes a{" "}
              <strong>'Learn more'</strong> link that opens an overlay
              containing a more detailed description of the issue.
            </p>
            <p>
              The current accessibility status of the Web content displays as a
              percentage of elements with no detected violations or items to review.{" "}
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
                src="assets/img/report.png"
                alt="Screen shot of the Accessibility Checker Report"
                width="100%"
                height="100%"
              />
            </p>
          </div>
          <div className="bx--col-md-0 bx--col-lg-3 buffer"></div>
        </div>
      </div>
    );
  }
}

export default UsingACApp;
