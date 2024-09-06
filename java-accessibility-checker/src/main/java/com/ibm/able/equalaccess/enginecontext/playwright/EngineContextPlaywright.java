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
package com.ibm.able.equalaccess.enginecontext.playwright;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Arrays;

import com.google.gson.Gson;
import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.config.Config;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.ACError;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.engine.Rule;
import com.ibm.able.equalaccess.enginecontext.IEngineContext;
import com.ibm.able.equalaccess.engine.ACEReport;
import com.ibm.able.equalaccess.util.Fetch;
import com.microsoft.playwright.*;

public class EngineContextPlaywright implements IEngineContext { 
    private static Gson gson = new Gson();
    private Page driver = null;
    private String engineContent = null;

    public EngineContextPlaywright(Page driver) {
        this.driver = driver;
    }   

    @Override
    public void loadEngine() {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        String engineUrl = config.rulePack+"/ace.js";
        String engineLoadMode = config.engineMode;
        if ("DEFAULT".equals(engineLoadMode)) {
            engineLoadMode = "INJECT";
        }
        try {
            if ("INJECT".equals(engineLoadMode) && engineContent == null) {
                engineContent = Fetch.get(engineUrl, config.ignoreHTTPSErrors);
            }

            if (config.DEBUG) System.out.println("[INFO] aChecker.loadEngine detected Selenium");
            String scriptStr;
            if ("REMOTE".equals(engineLoadMode)) {
                scriptStr = """
(scriptUrl) => {
    try {
        var ace_backup_in_ibma;
        if ('undefined' !== typeof(ace)) {
            if (!ace || !ace.Checker)
                ace_backup_in_ibma = ace;
            ace = null;
        }
        if ('undefined' === typeof (ace) || ace === null) {
            return new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.setAttribute('aChecker', 'ACE');
                script.setAttribute('src', scriptUrl);
                script.addEventListener('load', function () {
                    globalThis.ace_ibma = ace;
                    if ('undefined' !== typeof(ace)) {
                        ace = ace_backup_in_ibma;
                    }
                    resolve();
                });
                script.addEventListener('error', function (evt) {
                    reject(new Error(`Unable to load engine into ${document.location.href}. This can happen if the page server sets a Content-Security-Policy that prevents ${scriptUrl} from loading.`))
                });
                let heads = document.getElementsByTagName('head');
                if (heads.length > 0) { heads[0].appendChild(script); }
                else if (document.body) { document.body.appendChild(script); }
                else { Promise.reject("Invalid document"); }
            })
        }
    } catch (e) {
        return Promise.reject(e);
    }
}
""";
                this.driver.evaluate(scriptStr, config.rulePack);
            } else if ("INJECT".equals(engineLoadMode)) {
                // Selenium
                scriptStr = """
(engineContent) => {
    try {
        var ace_backup_in_ibma;
        if ('undefined' !== typeof(ace)) {
            if (!ace || !ace.Checker)
                ace_backup_in_ibma = ace;
            ace = null;
        }
        if ('undefined' === typeof (ace) || ace === null) {
            return new Promise((resolve, reject) => {
                eval(engineContent);
                globalThis.ace_ibma = ace;
                if ('undefined' !== typeof(ace)) {
                    ace = ace_backup_in_ibma;
                }
                resolve();
            })
        }
    } catch (e) {
        return Promise.reject(e);
    }
}                           
""";
                this.driver.evaluate(scriptStr, engineContent);
            } else {
                scriptStr = "";
            }

            // this.driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(60));

        } catch (Error e) {
            System.err.println(e);
        } catch (IOException e) {
            System.err.println("aChecker: Unable to load engine from "+engineUrl+" due to IOException: "+e.toString());
            e.printStackTrace();
        }
    }

    @Override
    public ACEReport getCompliance(String label) {
        Config config = ACConfigManager.getConfig();
        try {
            List<String> resultList = new ArrayList<>(config.reportLevels.length + config.failLevels.length);
            Collections.addAll(resultList, config.reportLevels);
            Collections.addAll(resultList, config.failLevels);
            String scriptStr = """
([policies, reportLevels]) => {
    try {
        const valueToLevel = (reportValue) => {
            let reportLevel;
            if (reportValue[1] === "PASS") {
                reportLevel = "pass";
            }
            else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                reportLevel = "manual";
            }
            else if (reportValue[0] === "VIOLATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = "violation";
                }
                else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = "potentialviolation";
                }
            }
            else if (reportValue[0] === "RECOMMENDATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = "recommendation";
                }
                else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = "potentialrecommendation";
                }
            }
            return reportLevel;
        }
        const getCounts = (engineReport) => {
            let counts = {
                violation: 0,
                potentialviolation: 0,
                recommendation: 0,
                potentialrecommendation: 0,
                manual: 0,
                pass: 0
            }
            for (const issue of engineReport.results) {
                ++counts[issue.level];
            }
            return counts;
        }

        let checker = new window.ace_ibma.Checker();
        let customRulesets = [];
        customRulesets.forEach((rs) => checker.addRuleset(rs));
        return new Promise((resolve, reject) => {
            checker.check(document, policies).then(async function(report) {
                for (const result of report.results) {
                    delete result.node;
                    result.level = valueToLevel(result.value)
                }
                report.summary ||= {};
                report.summary.counts ||= getCounts(report);
                // Filter out pass results unless they asked for them in reports
                // We don't want to mess with baseline functions, but pass results can break the response object
                report.results = report.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");
                resolve(JSON.stringify(report));
            })
        });
    } catch (e) {
        return Promise.reject(e);
    }          
}  
            """;
            ACEReport report;
            String jsonReport = this.driver.evaluate(scriptStr, Arrays.asList(
                config.policies, 
                resultList.toArray() 
                /* TODO: ${JSON.stringify(ACEngineManager.customRulesets)}; */
            )).toString();
            if (!jsonReport.startsWith("{\"results\":[")) {
                throw new ACError(jsonReport);
            } else {
                report = gson.fromJson(jsonReport, ACEReport.class);
            }
    
            // TODO:
            // String getPolicies = "return new window.ace_ibma.Checker().rulesetIds;";
            // if (curPol != null && !checkPolicy) {
            //     checkPolicy = true;
            //     const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await browser.executeScript(getPolicies));
            //     areValidPolicy(valPolicies, curPol);
            // }
    
            // If there is something to report...
            if (report.results != null) {
                if (config.captureScreenshots) {
                    // TODO: Screenshot?
                    // String image = ((TakesScreenshot)this.driver).getScreenshotAs(OutputType.BASE64);
                    // report.screenshot = image;
                }
            }
            return report;
        } catch (Error err) {
            System.err.println(err);
            throw err;
        }
    }

    @Override
    public String getUrl() {
        return this.driver.url();
    }

    @Override
    public String getTitle() {
        return this.driver.title();
    }

    @Override
    public Guideline[] getGuidelines() {
        String scriptStr = String.format("""
() => {
    try {            
        let checker = new window.ace_ibma.Checker();
        let customRulesets = [];
        customRulesets.forEach((rs) => checker.addRuleset(rs));
        return Promise.resolve(JSON.stringify(checker.getGuidelines()));
    } catch (e) {
        return Promise.reject(e);
    }
}
""");
        String jsonGuidelines = this.driver.evaluate(scriptStr).toString();
        return gson.fromJson(jsonGuidelines, Guideline[].class);
    }

    @Override
    public Rule[] getRules() {
        String scriptStr = String.format("""
() => {
    try {            
        let checker = new window.ace_ibma.Checker();
        return Promise.resolve(JSON.stringify(checker.getRules()));
    } catch (e) {
        return Promise.reject(e);
    }            
}
""");
        String jsonGuidelines = this.driver.evaluate(scriptStr).toString();
        return gson.fromJson(jsonGuidelines, Rule[].class);
    }

    @Override
    public String getProfile() {
        return "Selenium";
    }

    @Override
    public String getHelp(String ruleId, String reasonId, String helpRoot) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getHelp'");
    }

    @Override
    public String encodeURIComponent(String s) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'encodeURIComponent'");
    }
}
