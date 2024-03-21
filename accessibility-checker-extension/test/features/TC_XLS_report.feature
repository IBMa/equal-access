Feature: XLS Report
    Scenario: Generate a basic XLS report from side panel for current scan
        When manual step 
            """
            Given page "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/"
            When user opens Devtools
            When user opens Devtools panel "Elements"
            When user opens Devtools subpanel "Accessibility Checker"
            When user activates Button "Scan"
            When user activates Button "Export XLS"
            When user opens downloaded file "Accessibility_Report-Altoro Accessibility Testing Site.xlsx"
            When user examines the "Overview" sheet and finds two sections: "Accessibility Scan Report" and "Summary"
            When user examines the "Accessibility Scan Report" section and finds:
                Tool name, Version number, Rule Set used, Guidelines used, Report date, Platform, Number of scans, Number of Pages scanned
            When user examines the "Summary" section and finds 5 columns with the counts of 
                Total issues, Issues with violations, Issues that Need review, Issues with Recommendations, and Hidden Issues.
                Note: these counts should match the counts in the Checker extension.
            When user opens "Scan summary" sheet and finds 10 columns with a row for each scan. For each column the user finds  
                Page title, Page url, Scan label, Base scan, 
                Number of Violations, Number of Needs review, Number of Recommendations, Number of Hidden Issues,
                Note: these counts should match the counts in the Checker extension.
                % elements without violations, % elements with violations or items to review
            When user opens "Issue summary" sheet and finds 3 columns where column 1 provides descriptive text, column 2 provides issue counts and 
                column 3 provides hidden issue counts.
                The row "Issues found:" contains in column 2 the count of all issues found minus any hidden issues. Column 3 contains count of all hidden issues.
                There are rows for each Level of issues.
                The row "Level 1 - the most essential issues to addresss" contains in column 2 the count of Level 1 issues minus any Level 1 hidden issues in this category and the count of Level 1 hidden issues in this category.
                For each level there are three sections: Violation, Needs review and Recommendation.
                    The row "Violation" contains in column 2 the count of all Level 1 violation issues found minus any hidden Level 1 violation issues. Column 3 contains count of all Level 1 violation hidden issues.
                        Beneath the row "Violation" there are 0 to n issue rows that enumerate the Level 1 violation issues.
                        Each row contain the issue message, column 2 contains the count of Level 1 violation issues for this issue minus any hidden Level 1 violation issues for this issue. Column 3 contains count of all Level 1 violation hidden issues for this issue.
                    The row "Needs review" contains in column 2 the count of all Level 1 Needs review issues found minus any hidden Level 1 Needs review issues. Column 3 contains count of all Level 1 Needs review hidden issues.
                        Beneath the row "Needs review" there are 0 to n issue rows that enumerate the Level 1 Needs review issues.
                        Each row contain the issue message, column 2 contains the count of Level 1 Needs review issues for this issue minus any hidden Level 1 Needs review issues for this issue. Column 3 contains count of all Level 1 Needs review hidden issues for this issue.
                    The row "Recommendation" contains in column 2 the count of all Level 1 Recommendation issues found minus any hidden Level 1 Recommendation issues. Column 3 contains count of all Level 1 Recommendation hidden issues.
                        Beneath the row "Recommendation" there are 0 to n issue rows that enumerate the Level 1 Recommendation issues.
                        Each row contain the issue message, column 2 contains the count of Level 1 Recommendation issues for this issue minus any hidden Level 1 Recommendation issues for this issue. Column 3 contains count of all Level 1 Recommendation hidden issues for this issue.
                The row "Level 2 - the next most important issues" contains in column 2 the count of Level 2 issues minus any Level 2 hidden issues in this category and the count of Level 2 hidden issues in this category.
                For each level there are three sections: Violation, Needs review and Recommendation.
                    The row "Violation" contains in column 2 the count of all Level 2 violation issues found minus any hidden Level 2 violation issues. Column 3 contains count of all Level 2 violation hidden issues.
                        Beneath the row "Violation" there are 0 to n issue rows that enumerate the Level 2 violation issues.
                        Each row contain the issue message, column 2 contains the count of Level 2 violation issues for this issue minus any hidden Level 2 violation issues for this issue. Column 3 contains count of all Level 2 violation hidden issues for this issue.
                    The row "Needs review" contains in column 2 the count of all Level 2 Needs review issues found minus any hidden Level 2 Needs review issues. Column 3 contains count of all Level 2 Needs review hidden issues.
                        Beneath the row "Needs review" there are 0 to n issue rows that enumerate the Level 2 Needs review issues.
                        Each row contain the issue message, column 2 contains the count of Level 2 Needs review issues for this issue minus any hidden Level 2 Needs review issues for this issue. Column 3 contains count of all Level 2 Needs review hidden issues for this issue.
                    The row "Recommendation" contains in column 2 the count of all Level 2 Recommendation issues found minus any hidden Level 2 Recommendation issues. Column 3 contains count of all Level 2 Recommendation hidden issues.
                        Beneath the row "Recommendation" there are 0 to n issue rows that enumerate the Level 2 Recommendation issues.
                        Each row contain the issue message, column 2 contains the count of Level 2 Recommendation issues for this issue minus any hidden Level 2 Recommendation issues for this issue. Column 3 contains count of all Level 2 Recommendation hidden issues for this issue.
                The row "Level 3 - the next most important issues" contains in column 2 the count of Level 3 issues minus any Level 3 hidden issues in this category and the count of Level 3 hidden issues in this category.
                For each level there are three sections: Violation, Needs review and Recommendation.
                    The row "Violation" contains in column 2 the count of all Level 3 violation issues found minus any hidden Level 3 violation issues. Column 3 contains count of all Level 3 violation hidden issues.
                        Beneath the row "Violation" there are 0 to n issue rows that enumerate the Level 3 violation issues.
                        Each row contain the issue message, column 2 contains the count of Level 3 violation issues for this issue minus any hidden Level 3 violation issues for this issue. Column 3 contains count of all Level 3 violation hidden issues for this issue.
                    The row "Needs review" contains in column 2 the count of all Level 3 Needs review issues found minus any hidden Level 3 Needs review issues. Column 3 contains count of all Level 3 Needs review hidden issues.
                        Beneath the row "Needs review" there are 0 to n issue rows that enumerate the Level 3 Needs review issues.
                        Each row contain the issue message, column 2 contains the count of Level 3 Needs review issues for this issue minus any hidden Level 3 Needs review issues for this issue. Column 3 contains count of all Level 3 Needs review hidden issues for this issue.
                    The row "Recommendation" contains in column 2 the count of all Level 3 Recommendation issues found minus any hidden Level 3 Recommendation issues. Column 3 contains count of all Level 3 Recommendation hidden issues.
                        Beneath the row "Recommendation" there are 0 to n issue rows that enumerate the Level 3 Recommendation issues.
                        Each row contain the issue message, column 2 contains the count of Level 3 Recommendation issues for this issue minus any hidden Level 3 Recommendation issues for this issue. Column 3 contains count of all Level 3 Recommendation hidden issues for this issue.
                The row "Level 4 - the next most important issues" contains in column 2 the count of Level 4 issues minus any Level 4 hidden issues in this category and the count of Level 4 hidden issues in this category.
                For each level there are three sections: Violation, Needs review and Recommendation.
                    The row "Violation" contains in column 2 the count of all Level 4 violation issues found minus any hidden Level 4 violation issues. Column 3 contains count of all Level 4 violation hidden issues.
                        Beneath the row "Violation" there are 0 to n issue rows that enumerate the Level 4 violation issues.
                        Each row contain the issue message, column 2 contains the count of Level 4 violation issues for this issue minus any hidden Level 4 violation issues for this issue. Column 3 contains count of all Level 4 violation hidden issues for this issue.
                    The row "Needs review" contains in column 2 the count of all Level 4 Needs review issues found minus any hidden Level 4 Needs review issues. Column 3 contains count of all Level 4 Needs review hidden issues.
                        Beneath the row "Needs review" there are 0 to n issue rows that enumerate the Level 4 Needs review issues.
                        Each row contain the issue message, column 2 contains the count of Level 4 Needs review issues for this issue minus any hidden Level 4 Needs review issues for this issue. Column 3 contains count of all Level 4 Needs review hidden issues for this issue.
                    The row "Recommendation" contains in column 2 the count of all Level 4 Recommendation issues found minus any hidden Level 4 Recommendation issues. Column 3 contains count of all Level 4 Recommendation hidden issues.
                        Beneath the row "Recommendation" there are 0 to n issue rows that enumerate the Level 4 Recommendation issues.
                        Each row contain the issue message, column 2 contains the count of Level 4 Recommendation issues for this issue minus any hidden Level 4 Recommendation issues for this issue. Column 3 contains count of all Level 4 Recommendation hidden issues for this issue.
            When user opens "Issue summary" sheet and finds 14 columns containing all stored data.
                Each issue gets its own row and contains the following columns:
                "Page title" 
                "Page URL" 
                "Scan label"
                "Issue ID"
                "Issue type"
                "Toolkit level"
                "Checkpoint"
                "WCAG level"
                "Rule"
                "Issue"
                "Element"
                "Code"
                "Xpath"
                "Help"
            When user opens "Definition of fields" sheet and finds a header row followed by two sections of definitions.
                The row "Definition of fields" is the sheet header.
                The row "Scan summary and Issue summary" is the header a section of definitions.
                The next row supplies the headers for two columns: column 1 header - "Field", column 2 header - "Definition"
                The next 9 rows contain the field and definition of the following:
                "Page" - "Identifies the page or html file that was scanned"
                "Scan label" - "Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing."
                "Base scan" - "Scan label for a previous scan against which this scan was compared. Only new issues are reported when a base scan is used."
                "Violations" - "Accessibility failures that need to be corrected."
                "Needs review" - "Issues that may not be a violation. These need a manual review to identify whether there is an accessibility problem."
                "Recommendation" - "Opportunities to apply best practices to further improve accessibility."
                "Hidden" - "Issues the user has selected to be hidden from view and subtracted from the issue counts."
                "% elements without violations" - "Percentage of elements on the page that had no violations found."
                "% elements with violations or items to review" - "Percentage of elements on the page that had no violations found and no items to review."
                The row "Issues" is the header a section of definitions.
                The next row supplies the headers for two columns: column 1 header - "Field", column 2 header - "Definition"
                The next 13 rows contain the field and definition of the following:
                "Page" - "Identifies the page or html file that was scanned"
                "Scan label" - "Identifies the page or html file that was scanned."
                "Issue ID" - "Label for the scan. Default values can be edited in the Accessibility Checker before saving this report, or programmatically assigned in automated testing."
                "Issue Type" - "Violation, needs review, or recommendation"
                "Toolkit level" - "1, 2, 3 or 4. Priority level defined by the IBM Equal Access Toolkit. See https://www.ibm.com/able/toolkit/plan/overview#pace-of-completion for details"
                "Checkpoint" - "Web Content Accessibility Guidelines (WCAG) checkpoints this issue falls into."
                "WCAG level" - "A, AA or AAA. WCAG level for this issue."
                "Rule" - "Name of the accessibility test rule that detected this issue."
                "Issue" - "Message describing the issue."
                "Element" - "Type of HTML element where the issue is found."
                "Code" - "Actual HTML element where the issue is found."
                "Xpath" - "Xpath of the HTML element where the issue is found."
                "Help" - "Link to a more detailed description of the issue and suggested solutions."
                

            """


