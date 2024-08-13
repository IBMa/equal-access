/******************************************************************************
    Copyright:: 2024- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/
package com.foo;

import org.junit.Test;
import static org.junit.Assert.*;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReport.Result;
import com.ibm.able.equalaccess.report.BaselineManager.eAssertResult;

public class SomeClassTest {
    private static ChromeDriver driver;

    /**
     * Setup a Selenium Chrome environment before tests
     */
    @BeforeClass public static void setup() {
        String workingDir = System.getProperty("user.dir");
        String chromeDriverDir = System.getenv("chromedriverpath");
        ChromeOptions options = new ChromeOptions();  
        if (chromeDriverDir == null) {
            chromeDriverDir = workingDir+"/src/test/resources/chromedriver-mac-arm64/chromedriver";
        } else {
            options.setBinary(System.getenv("chromebinpath"));
        }
        System.setProperty("webdriver.chrome.driver", chromeDriverDir);
        options.addArguments("--headless=new");
        try {
            SomeClassTest.driver = new ChromeDriver(options);
        } catch (SessionNotCreatedException e) {
            System.out.println(e.getMessage());
            System.out.println(e.getAdditionalInformation());
            throw e;
        }
    }

    /**
     * Close Selenium Chrome environment after tests
     */
    @AfterClass public static void teardown() {
        SomeClassTest.driver.close();
        AccessibilityChecker.close();
    }

    @Test public void getCompliance() {
        SomeClassTest.driver.get("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");

        ACReport report = AccessibilityChecker.getCompliance(driver, "getComplianceTest");
        eAssertResult resultCode = AccessibilityChecker.assertCompliance(report);
        assertEquals(resultCode, eAssertResult.PASS);
    }
}
