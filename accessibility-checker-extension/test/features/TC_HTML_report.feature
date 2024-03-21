Feature: HTML Report
    Scenario: Generate a basic HTML report from side panel
        
        When manual step 
        
            Given page "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/"
            When user opens Devtools
            When user opens Devtools panel "Elements"
            When user opens Devtools subpanel "Accessibility Checker"
            When user activates Button "Scan"
            When user activates Button "Export XLS"
            When user opens downloaded file "Accessibility_Report-Altoro Accessibility Testing Site.xlsx"
            


Feature: HTML Report
    
    Scenario: HTML report 
        # Setup
        Given url "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/"
        Given user opens Devtools 
        Given user opens Devtools subpanel "Accessibility Checker"
        Given user activates Button "Scan"
        Given user activates Button "Export XLS"
        
        # Confirm that the html file has been generated and downloaded 
        Then user get prompted to save files
        Then user is able to open file 


        # Cleanup
        When ? 