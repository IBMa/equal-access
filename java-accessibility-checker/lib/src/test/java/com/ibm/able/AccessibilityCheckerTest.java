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
package com.ibm.able;

import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.openqa.selenium.chrome.ChromeDriver;

import com.google.common.io.Files;
import com.ibm.able.engine.ACReport;
import com.ibm.able.report.BaselineManager.eAssertResult;

public class AccessibilityCheckerTest {
    private static ChromeDriver driver;

    /**
     * Setup a Selenium Chrome environment before tests
     */
    @BeforeClass public static void setup() {
        String workingDir = System.getProperty("user.dir");
        String chromeDriverDir = workingDir+"/src/test/resources/chromedriver-mac-arm64/chromedriver";
        System.setProperty("webdriver.chrome.driver", chromeDriverDir);
        AccessibilityCheckerTest.driver = new ChromeDriver();
    }

    /**
     * Close Selenium Chrome environment after tests
     */
    @AfterClass public static void teardown() {
        AccessibilityCheckerTest.driver.close();
    }

    @Test public void getCompliance() {
        AccessibilityCheckerTest.driver.get("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");
        ACReport report = AccessibilityChecker.getCompliance(driver, "getComplianceTest");
        assertNotNull(report);
        assertTrue(report.results.length > 0);
    }

    @Test public void baselines() throws IOException {
        Paths.get("baselines", "getComplianceTest3.json").toFile().delete();
        AccessibilityCheckerTest.driver.get("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");
        ACReport report = AccessibilityChecker.getCompliance(driver, "getComplianceTest2");
        assertEquals(eAssertResult.FAIL, AccessibilityChecker.assertCompliance(report));
        new File("baselines").mkdirs();
        Files.copy(Paths.get("results", "getComplianceTest2.json").toFile(), Paths.get("baselines", "getComplianceTest3.json").toFile());
        
        report = AccessibilityChecker.getCompliance(driver, "getComplianceTest3");
        assertEquals(eAssertResult.PASS, AccessibilityChecker.assertCompliance(report));        
        Paths.get("baselines", "getComplianceTest3.json").toFile().delete();
    }
}
