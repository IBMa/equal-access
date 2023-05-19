Feature: Cucumber Demo
    Demonstrate a basic usage of AAT

#    Scenario: Check pages and fail when issues found
#        Given I am at URL "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/#"
#        Then Page is accessible with label "DEMO1"
#        When I click on ID "feedbackButton"
#        Then Page is accessible with label "DEMO1_Personal"

    Scenario: Check pages, but just record results when issues found
        Given I am at URL "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/#"
        Then Scan page for accessibility with label "DEMO2"
        When I click on ID "feedbackButton"
        Then Scan page for accessibility with label "DEMO2_Personal"

