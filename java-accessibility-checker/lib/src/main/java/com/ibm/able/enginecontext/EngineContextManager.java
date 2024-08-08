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

import org.openqa.selenium.WebDriver;

import com.ibm.able.util.Misc;

public class EngineContextManager {
    private EngineContextManager() {}
    
    public static IEngineContext getEngineContext(Object contentContext) {
        IEngineContext engineContext = null;
        if (contentContext == null) {
            engineContext = new EngineContextLocal();
        } else if (Misc.classIsAvailable("org.openqa.selenium.WebDriver") && contentContext instanceof org.openqa.selenium.WebDriver) {
            engineContext = new EngineContextSelenium((WebDriver) contentContext);
        }
        if (engineContext != null) {
            try {
                engineContext.loadEngine();
            } catch (IOException e) {
                System.err.println("aChecker: Unable to load engine due to IOException: "+e.toString());
                e.printStackTrace();
            }
        }
        return engineContext;
    }
}
