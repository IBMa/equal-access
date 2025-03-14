Feature: Cucumber Demo
    Demonstrate a basic usage of AAT

    Scenario: Check pages and fail when issues found
        Given I am at URL "http://www.altoromutual.com/"
        Then Page is accessible with label "DEMO1"
        When I click on ID "CatLink1"
        Then Page is accessible with label "DEMO1_Personal"

    Scenario: Check pages, but just record results when issues found
        Given I am at URL "http://www.altoromutual.com/"
        Then Scan page for accessibility with label "DEMO2"
        When I click on ID "CatLink1"
        Then Scan page for accessibility with label "DEMO2_Personal"

