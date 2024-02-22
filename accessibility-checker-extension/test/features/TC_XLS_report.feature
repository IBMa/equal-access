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
                Total issues, Issues with violations, Issues that Need review, Issues with Recommendations, and Hidden Issues
            When user opens "Scan summary" sheet and finds 10 columns with a row for each scan. For each column the user finds  
                Page title, Page url, Scan label, Base scan, Number of Violations, Number of Needs review, Number of Recommendations, Number of Hidden Issues, 
                % elements without violations, % elements with violations or items to review
            When user opens "Issue summary" sheet


            """


