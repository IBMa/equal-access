Feature: XLS Report
    Scenario: Generate a basic XLS report from side panel
        When manual step 
            """
            Given page "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/"
            When user opens Devtools
            When user opens Devtools panel "Elements"
            When user opens Devtools subpanel "Accessibility Checker"
            When user activates Button "Scan"
            When user activates Button "Export XLS"
            When user opens downloaded file "Accessibility_Report-Altoro Accessibility Testing Site.xlsx"
            """


