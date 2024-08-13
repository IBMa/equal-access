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
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Arrays;
import java.util.Map;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import com.google.common.io.Files;
import com.google.gson.Gson;
import com.ibm.able.config.ACConfigManager;
import com.ibm.able.engine.ACReport;
import com.ibm.able.engine.ACReport.Result;
import com.ibm.able.report.BaselineManager.eAssertResult;

public class AccessibilityCheckerTest {
    public static class UnitTestInfoResult {
        public String ruleId;
        public String reasonId;
        public String category;
        public String message;
        public String[] messageArgs;
        public String[] value;
        public Map<String, String> path;

        public boolean matches(Result result) {
            return ruleId.equals(result.ruleId)
                && reasonId.equals(result.reasonId)
                && category.equals(result.category)
                && message.equals(result.message)
                && value[1].equals(result.value[1])
                && path.get("dom").equals(result.path.get("dom"))
                && path.get("aria").equals(result.path.get("aria"));
        }
    }
    public static class UnitTestInfo {
        public String[] ruleIds;
        public UnitTestInfoResult[] results;
    }
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
        // options.setImplicitWaitTimeout
        // options.addArguments("--headless", "--disable-gpu", "--window-size=1920,1200","--ignore-certificate-errors");
        try {
            AccessibilityCheckerTest.driver = new ChromeDriver(options);
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
        AccessibilityCheckerTest.driver.close();
        AccessibilityChecker.close();
    }

    @Test public void getCompliance() {
        ACConfigManager.getConfig().label = new String[] { "IBMa-Java-TeSt" };
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

    // @Test public void getComplianceLong() {
    //     AccessibilityCheckerTest.driver.get("https://openliberty.io/docs/latest/reference/javadoc/liberty-jakartaee8-javadoc.html?path=liberty-javaee8-javadoc/index-all.html");
    //     ACReport report = AccessibilityChecker.getCompliance(driver, "getComplianceLong");
    //     assertNotNull(report);
    //     assertTrue(report.results.length > 0);
    // }

    private void listFiles(File f, java.util.List<File> retFiles) {
        if (f.isFile() && f.exists() && (f.getName().endsWith("html") || f.getName().endsWith("htm"))) {
            retFiles.add(f);
        } else if (f.isDirectory()) {
            for (File subF: f.listFiles((testFile, name) -> testFile.isDirectory() || name.endsWith(".htm") || name.endsWith(".html"))) {
                listFiles(subF, retFiles);
            }
        }

    }
    @Test public void getComplianceTestsuite() throws IOException {
        ACConfigManager.resetConfig();
        File configFile = new File("achecker.json");
        try {
            configFile.delete();
            FileWriter myWriter = new FileWriter("achecker.json");
            myWriter.write(""" 
{
    "customRuleServer": true,
    "rulePack": "https://localhost:9445/rules/archives/preview/js",
    "ruleArchive": "preview",
    "ignoreHTTPSErrors": true,
    "policies": [ "IBM_Accessibility", "IBM_Accessibility_next"],
    "failLevels": [ "violation", "potentialviolation" ],
    "reportLevels": [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual",
        "pass"
    ],
    "outputFormat": [ "json" ],
    "label": [
        "IBMa-Java-TeSt"
    ]
}                
""");
            myWriter.close();
            ACConfigManager.getConfig();

            Gson gson = new Gson();
            File testRootDir = Paths.get(System.getProperty("user.dir"), "..","..","accessibility-checker-engine","test","v2","checker","accessibility","rules").toFile();
            ArrayList<File> testFiles = new ArrayList<>();
            listFiles(testRootDir, testFiles);


            // Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
            Set<File> skipList = new HashSet<>(Arrays.asList(new File[] {
                //not in karma conf file
                Paths.get(testRootDir.getAbsolutePath(), "a_text_purpose_ruleunit", "A-hasTextEmbedded.html").toFile(),
                // path.join(testRootDir, "a_text_purpose_ruleunit", "A-nonTabable.html"),

                // Meta refresh
                Paths.get(testRootDir.getAbsolutePath(), "meta_refresh_delay_ruleunit", "Meta-invalidRefresh.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "meta_refresh_delay_ruleunit", "Meta-validRefresh.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "meta_redirect_optional_ruleunit", "Meta-RefreshZero.html").toFile(),

                // CSS test issues
                Paths.get(testRootDir.getAbsolutePath(), "style_color_misuse_ruleunit","D543.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "style_before_after_review_ruleunit","D100.html").toFile(),

                // Misc
                // path.join(testRootDir, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),
            }));

            for (File testFile: testFiles) {
                if (skipList.contains(testFile)) continue;
                AccessibilityCheckerTest.driver.get("file://"+testFile.getAbsolutePath());
                ACReport report = AccessibilityChecker.getCompliance(driver, testFile.getAbsolutePath().substring(testRootDir.getAbsolutePath().length()));
                String unitTestInfoStr = AccessibilityCheckerTest.driver.executeScript("return JSON.stringify((typeof (window.UnitTest) !== 'undefined' && window.UnitTest))").toString();
                if (!"false".equals(unitTestInfoStr)) {
                    UnitTestInfo expectedInfo = gson.fromJson(unitTestInfoStr, UnitTestInfo.class);
                    List<String> coveredRuleIds = Arrays.asList(expectedInfo.ruleIds);
                    if (expectedInfo != null && expectedInfo.ruleIds != null && expectedInfo.ruleIds.length > 0) {
                        System.out.println(testFile.getCanonicalPath());
                        System.out.flush();
                        List<Result> actualIssues = new LinkedList<>(Arrays.stream(report.results).filter(actualIssue -> coveredRuleIds.contains(actualIssue.ruleId)).toList());
                        List<UnitTestInfoResult> expectedIssues = new LinkedList<>(Arrays.asList(expectedInfo.results));
                        for (int idxActual=0; idxActual<actualIssues.size(); ++idxActual) {
                            boolean found = false;
                            for (int idxExpected=0; !found && idxExpected<expectedIssues.size(); ++idxExpected) {
                                if (expectedIssues.get(idxExpected).matches(actualIssues.get(idxActual))) {
                                    actualIssues.remove(idxActual--);
                                    expectedIssues.remove(idxExpected--);
                                    found = true;
                                }
                            }
                        }
                        assertEquals("Issue triggered was not expected", 0, actualIssues.size());
                        assertEquals("Expected issue was not triggered ("+testFile.getAbsolutePath()+")\n---\n"+gson.toJson(report.results)+"\n---\n"+gson.toJson(expectedIssues), 0, expectedIssues.size());
                    }
                }
            }
            System.out.println();
        } finally {
            configFile.delete();
            ACConfigManager.resetConfig();
        }
    }

}
