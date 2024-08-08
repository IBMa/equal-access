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
package com.ibm.able.enginecontext;

import java.io.IOException;
import com.google.gson.Gson;
import com.ibm.able.config.ACConfigManager;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACEReport;
import com.ibm.able.engine.Guideline;
import com.ibm.able.util.Fetch;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public class EngineContextLocal implements IEngineContext {
    private static Gson gson = new Gson();
    private Context engine = null;
    private Scriptable engineScope = null;

    @Override
    public void loadEngine() throws IOException {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        String engineContent = Fetch.get(config.rulePack+"/ace.js");
        
        // Creates and enters a Context. The Context stores information
        // about the execution environment of a script.
        engine = Context.enter();

        // Initialize the standard objects (Object, Function, etc.)
        // This must be done before scripts can be executed. Returns
        // a scope object that we use in later calls.
        engineScope = engine.initStandardObjects();

        // Now evaluate the string we've colected.
        engine.evaluateString(engineScope, engineContent, "<cmd>", 1, null);
    }

    @Override
    public ACEReport getCompliance(String label) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getCompliance'");
    }

    @Override
    public String getUrl() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUrl'");
    }

    @Override
    public String getTitle() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getTitle'");
    }

    @Override
    public Guideline[] getGuidelines() {
        String scriptStr = "JSON.stringify(new ace.Checker().getGuidelines())";
        String jsonGuidelines = engine.evaluateString(engineScope, scriptStr, "<cmd>", 1, null).toString();
        return gson.fromJson(jsonGuidelines, Guideline[].class);
    } 
    
}
