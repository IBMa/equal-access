@e2e
Feature: HTML Report
    Background:
        # Load the checker panel, scan the page, and then download the reports
        Given "desktop" page "altoro" and panel "assessment"
        Given browser download folder "TC_HTML_report"
        Then Button "Scan" is enabled
        When user activates Button "Scan"
        Then elem ".reportTreeGrid #tableGridHeader .gridHeaderCell > span" is visible
        Then elem "#totalIssuesCount" text ends with "issues found"
        When user activates Button "Export XLS"
        When wait 2000
        Then downloaded file "Accessibility_Report-Altoro Accessibility Testing Site.html" exists

    Scenario: HTML report exists
        Then downloaded file "Accessibility_Report-Altoro Accessibility Testing Site.html" exists
