# Java Accessibility Checker Boilerplates

This directory contains boilerplate projects that demonstrate how to integrate IBM's Java Accessibility Checker with different testing frameworks. These boilerplates provide a starting point for developers who want to include automated accessibility testing in their Java applications.

## Available Boilerplates

### JUnit with Selenium WebDriver

The [junit-selenium](junit-selenium/) boilerplate demonstrates how to use Java Accessibility Checker with JUnit and Selenium WebDriver. This combination is ideal for testing web applications across different browsers.

Key features:
- Uses JUnit for test organization and assertions
- Uses Selenium WebDriver for browser automation
- Demonstrates how to set up ChromeDriver for testing
- Shows how to perform accessibility scans on web pages
- Includes examples of asserting compliance and handling results

### JUnit with Playwright

The [junit-playwright](junit-playwright/) boilerplate demonstrates how to use Java Accessibility Checker with JUnit and Microsoft Playwright. This combination provides a modern approach to browser automation with better cross-browser support.

Key features:
- Uses JUnit for test organization and assertions
- Uses Microsoft Playwright for browser automation
- Shows how to set up Playwright for testing
- Demonstrates how to perform accessibility scans on web pages
- Includes examples of asserting compliance and handling results

## Common Features

Both boilerplates demonstrate:

1. **Setting up the testing environment**: Configuring the browser automation tool (Selenium or Playwright)
2. **Performing accessibility scans**: Using `AccessibilityChecker.getCompliance()` to scan web pages
3. **Asserting compliance**: Using `AccessibilityChecker.assertCompliance()` to check for accessibility issues
4. **Handling results**: Processing the scan results and making assertions
5. **Proper cleanup**: Closing browser instances and releasing resources

## Getting Started

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Gradle build tool
- For Selenium: Chrome browser and appropriate ChromeDriver
- For Playwright: No additional browser installation required (automatically managed)

### Running the Tests

1. Navigate to the desired boilerplate directory:
   ```bash
   cd junit-selenium
   # or
   cd junit-playwright
   ```

2. Run the tests using Gradle:
   ```bash
   ./gradlew test
   ```

## Customizing for Your Project

To adapt these boilerplates for your own project:

1. Update the package names and class names to match your project structure
2. Replace the example URL with your application's URL
3. Modify the test assertions based on your expected accessibility compliance
4. Add additional test cases for different pages or states of your application

## Learn More

- [Java Accessibility Checker Documentation](https://github.com/IBMa/equal-access/tree/master/java-accessibility-checker)
- [JUnit Documentation](https://junit.org/junit4/)
- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/en/)
- [Microsoft Playwright Documentation](https://playwright.dev/java/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)