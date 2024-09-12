
Feature: ScanButton
    Background:
        # Load the checker panel, verify scan button is present
        Given "desktop" page "altoro" and panel "assessment"
        Then Button "Scan" is enabled
       # Then Menue "Options" is enabled
    # When I open the "Options" Dropdown
        
    
        

    Scenario: Dropdown is enable 
        When user activates Button "Menu"
        Then elem ".reportTreeGrid #tableGridHeader .gridHeaderCell > span" is visible

         When(`user activates Menu {string}