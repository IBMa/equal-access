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

package com.ibm.able.config;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.regex.Pattern;

import org.junit.Test;

public class ACConfigManagerTest {
    @Test public void getConfigWithNoConfigFile() {
        Config config = ACConfigManager.getConfig();

        // Main properties
        assertEquals("latest", config.ruleArchive);
        assertArrayEquals(new String[] { "IBM_Accessibility" }, config.policies);
        assertArrayEquals(new String[] { "violation", "potentialviolation" }, config.failLevels);
        assertArrayEquals(new String[] { "violation", "potentialviolation" }, config.reportLevels);
        assertArrayEquals(new String[] { "json" }, config.outputFormat);
        assertArrayEquals(null, config.label);
        assertEquals("results", config.outputFolder);
        assertEquals(true, config.outputFilenameTimestamp);
        assertEquals("baselines", config.baselineFolder);
        assertEquals(System.getProperty("java.io.tmpdir")+"/accessibility-checker/", config.cacheFolder);
        assertArrayEquals(new String[]  { "html", "htm", "svg" }, config.extensions);

        // Internal properties
        assertTrue(config instanceof ConfigInternal);
        ConfigInternal configInternal = (ConfigInternal) config;

        assertEquals(false, configInternal.DEBUG);
        assertEquals("latest", configInternal.ruleArchiveSet[0].id);
        assertEquals("Latest Deployment (latest)", configInternal.ruleArchiveLabel);
        assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.ruleServer);
        assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.rulePack.split("@")[0]);
        assertEquals("/archives/", configInternal.ruleArchivePath.substring(0, "/archives/".length()));
        assertEquals(3, configInternal.ruleArchiveVersion.split("\\.").length);
        assertEquals(false, configInternal.captureScreenshots);
        assertEquals(true, configInternal.headless);
        assertEquals(1, configInternal.maxTabs);
        assertArrayEquals(new String[] {
            "achecker.json", 
            "aceconfig.json", 
            Paths.get(".config", "achecker.json").toString(),
            Paths.get(".config", "aceconfig.json").toString()
        }, configInternal.configFiles);
        assertEquals("java-accessibility-checker-v3.1.70", configInternal.toolID);
        assertEquals("java-accessibility-checker", configInternal.toolName);
        assertEquals("3.1.70", configInternal.toolVersion);
        Pattern uuidPattern = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
        assertTrue(uuidPattern.matcher(configInternal.scanID).matches());
        assertEquals(false, configInternal.ignoreHTTPSErrors);
        assertEquals(true, configInternal.perfMetrics);
        assertEquals("DEFAULT", configInternal.engineMode);
    }

    @Test public void getConfigWithConfigFile() throws IOException {
        ACConfigManager.resetConfig();
        File configFile = new File("achecker.json");
        try {
            configFile.delete();
            FileWriter myWriter = new FileWriter("achecker.json");
            myWriter.write(""" 
{
    "ruleArchive": "17June2024",
    "policies": [ "IBM_Accessibility"],
    "failLevels": [ "violation" ],
    "reportLevels": [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual"
    ],
    "outputFormat": [ "json", "xlsx" ],
    "label": [
        "Java",
        "Demo"
    ],
    "outputFolder": ".aat/results",
    "baselineFolder": ".aat/baselines"
}                
""");
            myWriter.close();

            Config config = ACConfigManager.getConfig();

            // Main properties
            assertEquals("17June2024", config.ruleArchive);
            assertArrayEquals(new String[] { "IBM_Accessibility" }, config.policies);
            assertArrayEquals(new String[] { "violation" }, config.failLevels);
            assertArrayEquals(new String[] { "violation", "potentialviolation", "recommendation", "potentialrecommendation", "manual" }, config.reportLevels);
            assertArrayEquals(new String[] { "json", "xlsx" }, config.outputFormat);
            assertArrayEquals(new String[] { "Java", "Demo" }, config.label);
            assertEquals(".aat/results", config.outputFolder);
            assertEquals(true, config.outputFilenameTimestamp);
            assertEquals(".aat/baselines", config.baselineFolder);
            assertEquals(System.getProperty("java.io.tmpdir")+"/accessibility-checker/", config.cacheFolder);
            assertArrayEquals(new String[]  { "html", "htm", "svg" }, config.extensions);

            // Internal properties
            assertTrue(config instanceof ConfigInternal);
            ConfigInternal configInternal = (ConfigInternal) config;

            assertEquals(false, configInternal.DEBUG);
            assertEquals("latest", configInternal.ruleArchiveSet[0].id);
            assertEquals("17 June 2024 Deployment (IBM 7.2, 7.3) (17June2024)", configInternal.ruleArchiveLabel);
            assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.ruleServer);
            assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.rulePack.split("@")[0]);
            assertEquals("/archives/", configInternal.ruleArchivePath.substring(0, "/archives/".length()));
            assertEquals(3, configInternal.ruleArchiveVersion.split("\\.").length);
            assertEquals(false, configInternal.captureScreenshots);
            assertEquals(true, configInternal.headless);
            assertEquals(1, configInternal.maxTabs);
            assertArrayEquals(new String[] {
                "achecker.json", 
                "aceconfig.json", 
                Paths.get(".config", "achecker.json").toString(),
                Paths.get(".config", "aceconfig.json").toString()
            }, configInternal.configFiles);
            assertEquals("java-accessibility-checker-v3.1.70", configInternal.toolID);
            assertEquals("java-accessibility-checker", configInternal.toolName);
            assertEquals("3.1.70", configInternal.toolVersion);
            Pattern uuidPattern = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
            assertTrue(uuidPattern.matcher(configInternal.scanID).matches());
            assertEquals(false, configInternal.ignoreHTTPSErrors);
            assertEquals(true, configInternal.perfMetrics);
            assertEquals("DEFAULT", configInternal.engineMode);
        } finally {
            configFile.delete();
        }
    }

    @Test public void getConfigWithConfigFileVersioned() throws IOException {
        ACConfigManager.resetConfig();
        File configFile = new File("achecker.json");
        try {
            configFile.delete();
            FileWriter myWriter = new FileWriter("achecker.json");
            myWriter.write(""" 
{
    "ruleArchive": "versioned",
    "policies": [ "IBM_Accessibility"],
    "failLevels": [ "violation" ],
    "reportLevels": [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual"
    ],
    "outputFormat": [ "json", "xlsx" ],
    "label": [
        "Java",
        "Demo"
    ],
    "outputFolder": ".aat/results",
    "baselineFolder": ".aat/baselines"
}                
""");
            myWriter.close();

            Config config = ACConfigManager.getConfig();

            // Main properties
            assertEquals("versioned", config.ruleArchive);
            assertArrayEquals(new String[] { "IBM_Accessibility" }, config.policies);
            assertArrayEquals(new String[] { "violation" }, config.failLevels);
            assertArrayEquals(new String[] { "violation", "potentialviolation", "recommendation", "potentialrecommendation", "manual" }, config.reportLevels);
            assertArrayEquals(new String[] { "json", "xlsx" }, config.outputFormat);
            assertArrayEquals(new String[] { "Java", "Demo" }, config.label);
            assertEquals(".aat/results", config.outputFolder);
            assertEquals(true, config.outputFilenameTimestamp);
            assertEquals(".aat/baselines", config.baselineFolder);
            assertEquals(System.getProperty("java.io.tmpdir")+"/accessibility-checker/", config.cacheFolder);
            assertArrayEquals(new String[]  { "html", "htm", "svg" }, config.extensions);

            // Internal properties
            assertTrue(config instanceof ConfigInternal);
            ConfigInternal configInternal = (ConfigInternal) config;

            assertEquals(false, configInternal.DEBUG);
            assertEquals("latest", configInternal.ruleArchiveSet[0].id);
            assertEquals("19 April 2024 Deployment (IBM 7.2) (19April2024)", configInternal.ruleArchiveLabel);
            assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.ruleServer);
            assertEquals("https://cdn.jsdelivr.net/npm/accessibility-checker-engine", configInternal.rulePack.split("@")[0]);
            assertEquals("/archives/", configInternal.ruleArchivePath.substring(0, "/archives/".length()));
            assertEquals(3, configInternal.ruleArchiveVersion.split("\\.").length);
            assertEquals(false, configInternal.captureScreenshots);
            assertEquals(true, configInternal.headless);
            assertEquals(1, configInternal.maxTabs);
            assertArrayEquals(new String[] {
                "achecker.json", 
                "aceconfig.json", 
                Paths.get(".config", "achecker.json").toString(),
                Paths.get(".config", "aceconfig.json").toString()
            }, configInternal.configFiles);
            assertEquals("java-accessibility-checker-v3.1.70", configInternal.toolID);
            assertEquals("java-accessibility-checker", configInternal.toolName);
            assertEquals("3.1.70", configInternal.toolVersion);
            Pattern uuidPattern = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
            assertTrue(uuidPattern.matcher(configInternal.scanID).matches());
            assertEquals(false, configInternal.ignoreHTTPSErrors);
            assertEquals(true, configInternal.perfMetrics);
            assertEquals("DEFAULT", configInternal.engineMode);
        } finally {
            configFile.delete();
        }
    }

    @Test public void compareVersions() throws IOException {
        assertTrue(ACConfigManager.compareVersions("1.0.0", "1.0.0") == 0);
        assertTrue(ACConfigManager.compareVersions("1.0.1", "1.0.0") > 0);
        assertTrue(ACConfigManager.compareVersions("1.1.0", "1.0.0") > 0);
        assertTrue(ACConfigManager.compareVersions("2.0.0", "1.0.0") > 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0", "1.0.1") < 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0", "1.1.0") < 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0", "2.0.0") < 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0", "1.0.0-rc.0") > 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0-rc.1", "1.0.0-rc.0") > 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0-rc.0", "1.0.0") < 0);
        assertTrue(ACConfigManager.compareVersions("1.0.0-rc.0", "1.0.0-rc.1") < 0);
    }
}