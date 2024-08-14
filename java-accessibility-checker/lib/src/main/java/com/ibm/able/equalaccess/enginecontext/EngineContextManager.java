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
import java.lang.reflect.InvocationTargetException;

import com.ibm.able.equalaccess.engine.ACError;
import com.ibm.able.equalaccess.util.Misc;

public class EngineContextManager {
    private EngineContextManager() {}

    public static String encodeURIComponent(String s) {
        return new EngineContextLocal().encodeURIComponent(s);
    }
    
    public static IEngineContext getEngineContext(Object contentContext) {
        IEngineContext engineContext = null;
        if (contentContext == null) {
            engineContext = new EngineContextLocal();
        }
        if (engineContext == null 
            && Misc.classIsAvailable("org.openqa.selenium.WebDriver"))
        {
            if (!Misc.classIsAvailable("com.ibm.able.equalaccess.enginecontext.selenium.EngineContextSelenium")) {
                System.err.println("Attempted scan with WebDriver, but com.ibm.able.equalaccess.enginecontext.selenium.EngineContextSelenium could not be loaded");
                throw new ACError("Attempted scan with WebDriver, but com.ibm.able.equalaccess.enginecontext.selenium.EngineContextSelenium could not be loaded");
            }
            try {
                Class<?> webdriverClass = Class.forName("org.openqa.selenium.WebDriver");
                if (webdriverClass.isAssignableFrom(contentContext.getClass())) {
                    // We have a webdriver, use EngineContextSelenium to instantiate it
                    Class<?> ecClass = Class.forName("com.ibm.able.equalaccess.enginecontext.selenium.EngineContextSelenium");
                    engineContext = (IEngineContext) ecClass.getConstructor(webdriverClass).newInstance(contentContext);
                }
            } catch (ClassNotFoundException e) {
            } catch (NoSuchMethodException e) {
            } catch (SecurityException e) {
            } catch (InstantiationException e) {
            } catch (IllegalAccessException e) {
            } catch (IllegalArgumentException e) {
            } catch (InvocationTargetException e) {
            }
        }
        if (engineContext != null) {
            try {
                engineContext.loadEngine();
            } catch (IOException e) {
                System.err.println("aChecker: Unable to load engine due to IOException: "+e.toString());
                e.printStackTrace();
            }
        } else {
            System.err.println("Unable to load engine context for "+contentContext.getClass().getName());
            throw new ACError("Unable to load engine context for "+contentContext.getClass().getName());
        }
        return engineContext;
    }
}
