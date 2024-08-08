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

public class Config {
    Config() {}

    Config(Config other) {
        this.ruleArchive = other.ruleArchive;
        this.policies = other.policies.clone();
        this.failLevels = other.failLevels.clone();
        this.reportLevels = other.reportLevels.clone();
        this.outputFormat = other.outputFormat.clone();
        this.label = other.label.clone();
        this.outputFolder = other.outputFolder;
        this.outputFilenameTimestamp = other.outputFilenameTimestamp;
        this.baselineFolder = other.baselineFolder;
        this.cacheFolder = other.cacheFolder;
        this.extensions = other.extensions;
    }
    /**
     * (optional) Specify the rule archive
     *
     * Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
     * Default: "latest"
     * Values: "latest" | "preview" | "versioned" | archive id
     */
    public String ruleArchive = "latest";

    /**
     * (optional) Specify one or many policies to scan.
     *
     * Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
     * Default: ["IBM_Accessibility"]
     */
    public String[] policies = { "IBM_Accessibility" };

    /**
     * (optional) Specify one or many violation levels on which to fail the test
     *
     * i.e. If specified violation then the testcase will only fail if
     * a violation is found during the scan.
     * Default: ["violation", "review"]
     */
    public String[] failLevels = { "violation", "potentialviolation" };

    /**
     * (optional) Specify one or many violation levels which should be reported
     *
     * i.e. If specified violation then in the report it would only contain
     * results which are level of violation.
     * Default: ["violation", "review"]
     */
    public String[] reportLevels = { "violation", "potentialviolation" };

    /**
     * (optional) In which fornats should the results be output
     * Default: ["json"]
     */
    public String[] outputFormat = { "json" };

    /**
     * (optional) Specify any labels that you would like associated to your scan
     * Default: []
     */
    public String[] label = null;

    /**
     * (optional) Where the scan results should be saved.
     * Default: "results"
     */
    public String outputFolder = "results";

    /**
     * (optional) Should the timestamp be included in the filename of the reports?
     * Default: true
     */
    public boolean outputFilenameTimestamp = true;

    /**
     * (optional) Where the baseline results should be loaded from
     * Default: "baselines"
     */
    public String baselineFolder = "baselines";

    /**
     * (optional) Where the tool can read/write cached files (ace-node.js / archive.json)
     * Default: `${os.tmpdir()}/accessibility-checker/`
     */
    public String cacheFolder = System.getProperty("java.io.tmpdir")+"/accessibility-checker/";

    /**
     * (optional) For tools that scan files, which extensions should we include
     * Default: ["html", "htm", "svg"]
     */
    public String[] extensions = { "html", "htm", "svg" };

    /**
     * (optional) If the tool allows, should we capture screenshots
     */
    public Boolean captureScreenshots = false;
}
