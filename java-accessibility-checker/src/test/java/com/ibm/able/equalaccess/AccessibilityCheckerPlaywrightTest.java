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
package com.ibm.able.equalaccess;

import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Arrays;
import java.util.Map;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;

import com.google.common.io.Files;
import com.google.gson.Gson;
import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReport.Result;
import com.ibm.able.equalaccess.report.BaselineManager.eAssertResult;
import com.microsoft.playwright.*;

public class AccessibilityCheckerPlaywrightTest {
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
    private static Page driver;

    /**
     * Setup a Selenium Chrome environment before tests
     */
    @BeforeClass public static void setup() {
        try {
            Playwright playwright = Playwright.create();
            Browser browser = playwright.chromium().launch();
            AccessibilityCheckerPlaywrightTest.driver = browser.newPage();
        } catch (Throwable err) {
            System.err.println(err.toString());
            err.printStackTrace();
        }
    }

    /**
     * Close Selenium Chrome environment after tests
     */
    @AfterClass public static void teardown() {
        AccessibilityCheckerPlaywrightTest.driver.close();
        AccessibilityChecker.close();
    }

    @Test public void getCompliance() {
        ACConfigManager.getConfig().label = new String[] { "IBMa-Java-TeSt" };
        AccessibilityCheckerPlaywrightTest.driver.navigate("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");
        ACReport report = AccessibilityChecker.getCompliance(driver, "Playwright_getComplianceTest");
        assertNotNull(report);
        assertTrue(report.results.length > 0);
    }

    @Test public void baselines() throws IOException {
        Paths.get("baselines", "Playwright_getComplianceTest3.json").toFile().delete();
        AccessibilityCheckerPlaywrightTest.driver.navigate("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");
        ACReport report = AccessibilityChecker.getCompliance(driver, "Playwright_getComplianceTest2");
        assertEquals(eAssertResult.FAIL, AccessibilityChecker.assertCompliance(report));
        new File("baselines").mkdirs();
        Files.copy(Paths.get("results", "Playwright_getComplianceTest2.json").toFile(), Paths.get("baselines", "Playwright_getComplianceTest3.json").toFile());
        
        report = AccessibilityChecker.getCompliance(driver, "Playwright_getComplianceTest3");
        assertEquals(eAssertResult.PASS, AccessibilityChecker.assertCompliance(report));        
        Paths.get("baselines", "Playwright_getComplianceTest3.json").toFile().delete();
    }

    // @Test public void getComplianceLong() {
    //     AccessibilityCheckerTest.driver.navigate("https://openliberty.io/docs/latest/reference/javadoc/liberty-jakartaee8-javadoc.html?path=liberty-javaee8-javadoc/index-all.html");
    //     ACReport report = AccessibilityChecker.getCompliance(driver, "Playwright_getComplianceLong");
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
            File testRootDir = Paths.get(System.getProperty("user.dir"), "..","accessibility-checker-engine","test","v2","checker","accessibility","rules").toFile();
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

                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-pass-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-pass-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-fail-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-fail-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-fail-3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-4.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-5.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-6.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-7.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_refresh_delay_ruleunit", "act-inapplicable-8.html").toFile(),

                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-pass-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-pass-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-fail-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-fail-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-fail-3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-4.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-5.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-6.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-7.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(),  "meta_redirect_optional_ruleunit", "act-inapplicable-8.html").toFile(),
                
                // CSS test issues
                Paths.get(testRootDir.getAbsolutePath(), "style_color_misuse_ruleunit","D543.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "style_before_after_review_ruleunit","D100.html").toFile(),

                // Misc
                // path.join(testRootDir, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),
                Paths.get(testRootDir.getAbsolutePath(), "aria_search_label_unique_ruleunit", "search_hidden.html").toFile(),

                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","link_text.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","element_inline2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","link_inline_with_block.html").toFile(),

                //deprecated
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_fail1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_fail2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable4.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable5.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_inapplicable6.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_pass1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_pass2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "element_invisible.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "element_scrollable_unfocusable1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "element_scrollable_unfocusable2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "element_too_small1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "element_too_small2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "scrollable_element_tabbable.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "textarea_pass.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "textarea_pass2.html").toFile()
            
            }));

            for (File testFile: testFiles) {
                if (skipList.contains(testFile)) continue;
                AccessibilityCheckerPlaywrightTest.driver.navigate("file://"+testFile.getAbsolutePath());
                ACReport report = AccessibilityChecker.getCompliance(driver, "Playwright_"+testFile.getAbsolutePath().substring(testRootDir.getAbsolutePath().length()));
                String unitTestInfoStr = AccessibilityCheckerPlaywrightTest.driver.evaluate("() => JSON.stringify((typeof (window.UnitTest) !== 'undefined' && window.UnitTest))").toString();
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
                        assertEquals(testFile.toString()+": Issue triggered was not expected", 0, actualIssues.size());
                        assertEquals(testFile.toString()+": Expected issue was not triggered ("+testFile.getAbsolutePath()+")\n---\n"+gson.toJson(report.results)+"\n---\n"+gson.toJson(expectedIssues), 0, expectedIssues.size());
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
