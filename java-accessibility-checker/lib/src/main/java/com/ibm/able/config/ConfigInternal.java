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

import java.nio.file.Paths;

public class ConfigInternal extends Config {
    ConfigInternal() {
        super();
    }

    ConfigInternal(Config config) {
        super(config);
    }

    /**
     * Run in debug mode
     */
    public boolean DEBUG = "true".equals(System.getenv("DEBUG"));

    /**
     * Spot to store parsed archive file
     */
    public Archive[] ruleArchiveSet = null;

    /**
     * Label to expose to reports
     */
    public String ruleArchiveLabel = null;

    /**
     * (optional) Rule server to pull the rules from and to use for help
     * Default: "https://able.ibm.com/rules"
     */
    public String ruleServer = "https://cdn.jsdelivr.net/npm/accessibility-checker-engine";

    /**
     * Path to the rule pack
     */
    public String rulePack = null;

    /**
     * Path within the archive
     */
    public String ruleArchivePath = null;

    /**
     * Version number of the selected archive
     */
    public String ruleArchiveVersion = null;

    /**
     * (optional) If the tool allows, should we run headless
     */
    public boolean headless = true;

    /**
     * (optional) If the tool allows, set the maximum number of tabs to open
     */
    public int maxTabs = 1;

    /**
     * Configuration filenames to try loading
     */
    public String[] configFiles = {
        "achecker.json", 
        "aceconfig.json", 
        Paths.get(".config", "achecker.json").toString(),
        Paths.get(".config", "aceconfig.json").toString()
    };

    public String toolID = null;
    public String toolName = null;
    public String toolVersion = null;

    public String scanID = null;

    public boolean ignoreHTTPSErrors = false;

    public boolean perfMetrics = true;

    /**
     * "DEFAULT" | "REMOTE" | "INJECT"
     */
    public String engineMode = "DEFAULT";
}
