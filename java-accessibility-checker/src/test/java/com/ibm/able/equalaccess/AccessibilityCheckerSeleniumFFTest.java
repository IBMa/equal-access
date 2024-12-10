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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import com.google.gson.Gson;
import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReport.Result;

public class AccessibilityCheckerSeleniumFFTest {
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
    private static WebDriver driver;

    /**
     * Setup a Selenium Chrome environment before tests
     */
    @BeforeClass public static void setup() {
        // Make sure we're starting with a clean config
        File configFile = new File("achecker.json");
        configFile.delete();
        ACConfigManager.resetConfig();

        try {
            // ClientConfig timeoutConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(60));
            FirefoxOptions options = new FirefoxOptions();
            driver = new FirefoxDriver(options);
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
        AccessibilityCheckerSeleniumFFTest.driver.close();
        AccessibilityChecker.close();
    }

    private void listFiles(File f, java.util.List<File> retFiles) {
        if (f.isFile() && f.exists() && (f.getName().endsWith("html") || f.getName().endsWith("htm"))) {
            retFiles.add(f);
        } else if (f.isDirectory()) {
            for (File subF: f.listFiles((testFile, name) -> testFile.isDirectory() || name.endsWith(".htm") || name.endsWith(".html"))) {
                listFiles(subF, retFiles);
            }
        }

    }

    @Test public void getCompliance() {
        ACConfigManager.getConfig().label = new String[] { "IBMa-Java-TeSt" };
        AccessibilityCheckerSeleniumFFTest.driver.get("https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud/");
        ACReport report = AccessibilityChecker.getCompliance(driver, "SeleniumFF_getComplianceTest");
        assertNotNull(report);
        assertTrue(report.results.length > 0);
    }

    public void getComplianceTestsuite() throws IOException {
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

                // CSS test issues
                Paths.get(testRootDir.getAbsolutePath(), "style_color_misuse_ruleunit","D543.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "style_before_after_review_ruleunit","D100.html").toFile(),

                // Firefox
                Paths.get(testRootDir.getAbsolutePath(), "aria_role_redundant_ruleunit", "Fail.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "style_focus_visible_ruleunit", "CSS-used.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "object_text_exists_ruleunit", "act_fail_3.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_conflict_ruleunit", "aria-hidden.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "ValidRoleSpecified.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "ValidAttribute.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "ValidRoleSpecifiedValidAttribute.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "InvalidAttribute.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "InValidRoleInvalidAttribute.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "InValidRoleSpecified.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "ValidRoleSpecifiedInvalidAttribute.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "ValidRoleSpecifiedMultiple.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "InValidRoleSpecifiedMultiple.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "area_element_test.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_attribute_valid_ruleunit", "elementsWithSupportingAttributes.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_role_valid_ruleunit", "area_no_href.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_fail2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "textarea_pass2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "element_scrollable_tabbable_ruleunit", "act_fail1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "fieldset_label_valid_ruleunit", "FieldSet-hasarialabel.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "fieldset_label_valid_ruleunit", "FieldSet-nested.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "fieldset_label_valid_ruleunit", "test_mixed_1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "a_text_purpose_ruleunit", "A-nonTabable.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "a_text_purpose_ruleunit", "A-slot-text-error2.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "a_text_purpose_ruleunit", "A-slot-text-error1.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit", "link_in_text.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit", "block_element_inline.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "aria_landmark_name_unique_ruleunit", "example_0_fail.html").toFile(),

                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","link_inline_with_block.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","link_text.html").toFile(),
                Paths.get(testRootDir.getAbsolutePath(), "target_spacing_sufficient_ruleunit","element_inline2.html").toFile(),
                
                // Misc
                // path.join(testRootDir, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),                
            }));

            for (File testFile: testFiles) {
                if (skipList.contains(testFile)) continue;
                AccessibilityCheckerSeleniumFFTest.driver.get("file://"+testFile.getAbsolutePath());
                ACReport report = AccessibilityChecker.getCompliance(driver, "Selenium_"+testFile.getAbsolutePath().substring(testRootDir.getAbsolutePath().length()));
                String unitTestInfoStr = ((JavascriptExecutor)driver).executeScript("return JSON.stringify((typeof (window.UnitTest) !== 'undefined' && window.UnitTest))").toString();
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
                        // if (actualIssues.size() != 0 || expectedIssues.size () != 0) {
                        //     System.err.println("XXXX: "+testFile.toString());
                        // }
                        assertEquals(testFile.toString()+": Issue triggered was not expected", 0, actualIssues.size());
                        assertEquals(testFile.toString()+": Expected issue was not triggered ("+testFile.getAbsolutePath()+")\n---\n"+gson.toJson(report.results)+"\n---\n"+gson.toJson(expectedIssues)+"\n"+testFile.toString(), 0, expectedIssues.size());
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
