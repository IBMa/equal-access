@qa
Feature: Menu component

    Background:
        # Load the checker panel, verify scan button is present before scan
        Given "desktop" page "altoro" and panel "assessment"
        Then Button "Scan" is enabled
       
   
    #Verification of option avalible before scan for dropdown menu
    Scenario: Open and interact with the Menu
        When user activates Menu Button "Options"
        Then carbon elem "Start storing scans" is visible
        Then carbon elem "Export stored scans" is disabled
        Then carbon elem "View stored scans" is disabled
        Then carbon elem "Delete stored scans" is disabled
        