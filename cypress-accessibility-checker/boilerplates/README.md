# cypress-accessibility-checker boilerplates

In this folder is a boilerplate project that represent a form of "Hello World" for using the `cypress-accessibility-checker`. The project shows how to setup Cypress in order to run the accessibility-checker and runs a basic test.

A basic http-server is included in this project as an example application which the test file will target the scans against.  This should be replaced with commands to start your application and the URLs should be updated to reflect the actual application URL.

1. `cd cypress/`
1. `npm install`
1. Run Cypress headless:  `npm run cypress:run`
1. Run Cypress interactive:
    - Start the http-server: `npm run test:start-http`
    - Run Cypress interactive: `npm run cypress:open`
