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
package com.ibm.able.equalaccess.enginecontext.selenium;

import java.io.IOException;
import java.time.Duration;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

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

public class EngineContextSelenium implements IEngineContext { 
    private static Gson gson = new Gson();
    private WebDriver driver = null;
    private String engineContent = null;

    public EngineContextSelenium(WebDriver driver) {
        this.driver = driver;
    }   

    @Override
    public void loadEngine() throws IOException {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        String engineLoadMode = config.engineMode;
        if ("DEFAULT".equals(engineLoadMode)) {
            engineLoadMode = "INJECT";
        }
        if ("INJECT".equals(engineLoadMode) && engineContent == null) {
            engineContent = Fetch.get(config.rulePack+"/ace.js", config.ignoreHTTPSErrors);
        }

        if (config.DEBUG) System.out.println("[INFO] aChecker.loadEngine detected Selenium");
        try {
            String scriptStr;
            if ("REMOTE".equals(engineLoadMode)) {
                scriptStr = String.format("""
let cb = arguments[arguments.length - 1];
try {
    var ace_backup_in_ibma;
        if ('undefined' !== typeof(ace)) {
            if (!ace || !ace.Checker) 
                ace_backup_in_ibma = ace;
            ace = null; 
        } 
        if ('undefined' === typeof (ace) || ace === null) {
        let script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('aChecker', 'ACE');
        script.setAttribute('src', '%s/ace.js');
        script.addEventListener('load', function() {
            globalThis.ace_ibma = ace;
            if ('undefined' !== typeof(ace)) {
                ace = ace_backup_in_ibma;
            } 
            cb();
        });
        let heads = document.getElementsByTagName('head');
        if (heads.length > 0) { heads[0].appendChild(script); }
        else { document.body.appendChild(script); }
    } else {
        cb();
    }
} catch (e) {
    cb(e);
}
""", config.rulePack);
            } else if ("INJECT".equals(engineLoadMode)) {
                // Selenium
                scriptStr = String.format("""
let cb = arguments[arguments.length - 1];
try {
    var ace_backup_in_ibma;
    if ('undefined' !== typeof(ace)) {
        if (!ace || !ace.Checker) 
            ace_backup_in_ibma = ace;
        ace = null; 
    } 
    if ('undefined' === typeof (ace) || ace === null) {
        eval(%s)
        globalThis.ace_ibma = ace;
        if ('undefined' !== typeof(ace)) {
            ace = ace_backup_in_ibma;
        } 
        cb();
        
    } else {
        cb();
    }
} catch (e) {
    cb(e);
}                            
""", gson.toJson(engineContent));
            } else {
                scriptStr = "";
            }

            this.driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(60));

            ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr);
        } catch (Error e) {
            System.err.println(e);
        }
    }

    @Override
    public ACEReport getCompliance(String label) {
        Config config = ACConfigManager.getConfig();
        try {
            String scriptStr = String.format("""
let cb = arguments[arguments.length - 1];
try {
    let policies = %s;

    let checker = new window.ace_ibma.Checker();
    let customRulesets = [];
    customRulesets.forEach((rs) => checker.addRuleset(rs));
    setTimeout(function() {
        checker.check(document, policies).then(function(report) {
            for (const result of report.results) {
                delete result.node;
            }
            cb(JSON.stringify(report));
        })
    },0)
} catch (e) {
    cb(e);
}            
            """, gson.toJson(config.policies) /* TODO: ${JSON.stringify(ACEngineManager.customRulesets)}; */);
            ACEReport report;
            try {
                this.driver.manage().timeouts().scriptTimeout(Duration.ofMinutes(60));
                String jsonReport = ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr).toString();
                if (!jsonReport.startsWith("{\"results\":[")) {
                    throw new ACError(jsonReport);
                } else {
                    report = gson.fromJson(jsonReport, ACEReport.class);
                }
            } catch (TimeoutException err) {
                System.err.println("TIMEOUT?!");
                throw err;
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
                    String image = ((TakesScreenshot)this.driver).getScreenshotAs(OutputType.BASE64);
                    report.screenshot = image;
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
        return this.driver.getCurrentUrl();
    }

    @Override
    public String getTitle() {
        return this.driver.getTitle();
    }

    @Override
    public Guideline[] getGuidelines() {
        String scriptStr = String.format("""
let cb = arguments[arguments.length - 1];
try {            
    let checker = new window.ace_ibma.Checker();
    let customRulesets = [];
    customRulesets.forEach((rs) => checker.addRuleset(rs));
    cb(JSON.stringify(checker.getGuidelines()));
} catch (e) {
    cb(e);
}            
""");
        String jsonGuidelines = ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr).toString();
        return gson.fromJson(jsonGuidelines, Guideline[].class);
    }

    @Override
    public Rule[] getRules() {
        String scriptStr = String.format("""
let cb = arguments[arguments.length - 1];
try {            
    let checker = new window.ace_ibma.Checker();
    cb(JSON.stringify(checker.getRules()));
} catch (e) {
    cb(e);
}            
""");
        String jsonGuidelines = ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr).toString();
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
