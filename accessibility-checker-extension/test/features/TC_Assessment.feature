@e2e
Feature: Accessibility Assessment Panel
    
    Scenario: default view is accessible
        Given "desktop" page "altoro" and panel "assessment"
        Then elem ".reportTreeGridEmptyText" text is "This page has not been scanned."
        Then page is accessible

    Scenario: altoro scan is accessible
        Given "desktop" page "altoro" and panel "assessment"
        Then elem ".reportTreeGridEmptyText" text is "This page has not been scanned."
        When user activates Button "Scan"
        Then elem ".reportTreeGrid #tableGridHeader .gridHeaderCell > span" is visible
        Then elem "#totalIssuesCount" text ends with "issues found"