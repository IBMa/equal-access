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
package com.ibm.able.equalaccess.enginecontext;

import java.io.IOException;
import com.google.gson.Gson;
import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.ACEReport;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.engine.Rule;
import com.ibm.able.equalaccess.util.Fetch;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public class EngineContextLocal implements IEngineContext {
    private static Gson gson = new Gson();
    private Context engine = null;
    private Scriptable engineScope = null;

    @Override
    public void loadEngine() {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        String engineUrl = config.rulePack+"/ace.js";
        try {
            String engineContent = Fetch.get(engineUrl, config.ignoreHTTPSErrors)+";var ace_checker = new ace.Checker();";
            
            // Creates and enters a Context. The Context stores information
            // about the execution environment of a script.
            engine = Context.enter();

            // Initialize the standard objects (Object, Function, etc.)
            // This must be done before scripts can be executed. Returns
            // a scope object that we use in later calls.
            engineScope = engine.initStandardObjects();

            // Now evaluate the string we've colected.
            engine.evaluateString(engineScope, engineContent, "<cmd>", 1, null);
        } catch (IOException e) {
            System.err.println("aChecker: Unable to load engine fromm "+engineUrl+" due to IOException: "+e.toString());
            e.printStackTrace();
        }
    }

    @Override
    public ACEReport getCompliance(String label) {
        // Can't getCompliance with no content model
        throw new UnsupportedOperationException("Cannot 'getCompliance' with EngineContextLocal");
    }

    @Override
    public String getUrl() {
        // Can't getUrl with no content model
        throw new UnsupportedOperationException("Cannot 'getUrl' with EngineContextLocal");
    }

    @Override
    public String getTitle() {
        // Can't getTitle with no content model
        throw new UnsupportedOperationException("Cannot 'getTitle' with EngineContextLocal");
    }

    @Override
    public Guideline[] getGuidelines() {
        String scriptStr = "JSON.stringify(ace_checker.getGuidelines())";
        String jsonGuidelines = engine.evaluateString(engineScope, scriptStr, "<cmd>", 1, null).toString();
        return gson.fromJson(jsonGuidelines, Guideline[].class);
    }

    @Override
    public Rule[] getRules() {
        String scriptStr = "JSON.stringify(Object.keys(ace_checker.engine.ruleMap).map(key => ace_checker.engine.ruleMap[key]))";
        String jsonGuidelines = engine.evaluateString(engineScope, scriptStr, "<cmd>", 1, null).toString();
        return gson.fromJson(jsonGuidelines, Rule[].class);
    } 
    
    public String encodeURIComponent(String s) {
        if (engine == null) {
            // Creates and enters a Context. The Context stores information
            // about the execution environment of a script.
            engine = Context.enter();

            // Initialize the standard objects (Object, Function, etc.)
            // This must be done before scripts can be executed. Returns
            // a scope object that we use in later calls.
            engineScope = engine.initStandardObjects();
        }
        String scriptStr = String.format("encodeURIComponent(`%s`)", s.replace("\"", "\\\""));
        return engine.evaluateString(engineScope, scriptStr, "<cmd>", 1, null).toString();
    }

    @Override
    public String getProfile() {
        return "Local";
    }

    @Override
    public String getHelp(String ruleId, String reasonId, String helpRoot) {
        String scriptStr = String.format("ace_checker.engine.getHelp(`%s`,`%s`,`%s`)", ruleId, reasonId, helpRoot);
        return engine.evaluateString(engineScope, scriptStr, "<cmd>", 1, null).toString();
    }
}
