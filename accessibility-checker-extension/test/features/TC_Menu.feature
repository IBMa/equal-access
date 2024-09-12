@qa
Feature: Menu component

    Scenario: Open and interact with the Menu
        Given "desktop" page "altoro" and panel "assessment"
        When user activates Menu Button ".bx--menu-button"
        Then elem ".bx--menu" is visible
        When user selects Menu Item ".bx--menu-option:nth-child(1)"
        Then elem ".bx--menu-option:nth-child(1)" text is "First Option"
        Then page is accessible