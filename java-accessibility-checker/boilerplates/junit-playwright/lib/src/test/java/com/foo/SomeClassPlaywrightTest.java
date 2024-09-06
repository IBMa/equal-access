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

import com.ibm.able.equalaccess.AccessibilityChecker;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReport.Result;
import com.ibm.able.equalaccess.report.BaselineManager.eAssertResult;
import com.microsoft.playwright.*;

public class SomeClassPlaywrightTest {
    private static Page driver;

    /**
     * Setup a Playwright Chromium environment before tests
     */
    @BeforeClass public static void setup() {
        try {
            Playwright playwright = Playwright.create();
            Browser browser = playwright.chromium().launch();
            driver = browser.newPage();
        } catch (Throwable err) {
            System.err.println(err.toString());
            err.printStackTrace();
        }
    }

    /**
     * Close Playwright environment after tests
     */
    @AfterClass public static void teardown() {
        SomeClassPlaywrightTest.driver.close();
        AccessibilityChecker.close();
    }

    @Test public void getCompliance() {
        SomeClassPlaywrightTest.driver.navigate("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");

        ACReport report = AccessibilityChecker.getCompliance(driver, "getComplianceTest");
        eAssertResult resultCode = AccessibilityChecker.assertCompliance(report);
        // The page has compliance issues, so this assert should fail
        assertEquals("Scan resulted in "+resultCode.toString(), eAssertResult.PASS, resultCode);
    }
}
