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
package com.ibm.able.selenium;

import java.io.IOException;
import java.time.Duration;
import java.util.Date;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.google.gson.Gson;
import com.ibm.able.IEngineContext;
import com.ibm.able.config.ACConfigManager;
import com.ibm.able.config.Config;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACError;
import com.ibm.able.engine.ACReport;
import com.ibm.able.util.Fetch;

public class EngineContextSelenium implements IEngineContext { 
    private WebDriver driver = null;
    private String engineContent = null;

    public EngineContextSelenium(WebDriver driver) {
        this.driver = driver;
    }   

    public void loadEngine() throws IOException {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        String engineLoadMode = config.engineMode;
        if ("DEFAULT".equals(engineLoadMode)) {
            engineLoadMode = "INJECT";
        }
        if ("INJECT".equals(engineLoadMode) && engineContent == null) {
            engineContent = Fetch.get(config.rulePack+"/ace.js");
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
                Gson gson = new Gson();
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

            Object result = ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr);
            if (result != null) {
                System.err.println(result);
            }
        } catch (Error e) {
            System.err.println(e);
        }
    }

    public ACReport getCompliance(String label) {
        Config config = ACConfigManager.getConfig();
        Gson gson = new Gson();
        try {
            Date startScan = new Date();
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
            this.driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(60));
    
            String jsonReport = ((JavascriptExecutor)this.driver).executeAsyncScript(scriptStr).toString();
            if (!jsonReport.startsWith("{\"results\":[")) {
                throw new ACError(jsonReport);
            } else {
                return gson.fromJson(jsonReport, ACReport.class);
            }
            // TODO:
            // String getPolicies = "return new window.ace_ibma.Checker().rulesetIds;";
            // if (curPol != null && !checkPolicy) {
            //     checkPolicy = true;
            //     const valPolicies = ACEngineManager.customRulesets.map(rs => rs.id).concat(await browser.executeScript(getPolicies));
            //     areValidPolicy(valPolicies, curPol);
            // }
    
            // // If there is something to report...
            // let finalReport : IBaselineReport;
            // if (report.results) {
            //     // Add URL to the result object
            //     const url = await browser.getCurrentUrl();
            //     const title = await browser.getTitle();
            //     let origReport : IEngineReport = JSON.parse(JSON.stringify(report));
            //     if (Config.captureScreenshots && browser.takeScreenshot) {
            //         const image = await browser.takeScreenshot();
            //         origReport.screenshot = image;
            //     }
            //     finalReport = ReporterManager.addEngineReport("Selenium", startScan, url, title, label, origReport);
            // }
            // return {
            //     "report": finalReport,
            //     "webdriver": parsed
            // }
        } catch (Error err) {
            System.err.println(err);
            throw err;
        }
    }

}
