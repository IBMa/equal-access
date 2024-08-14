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

import com.ibm.able.equalaccess.engine.ACEReport;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.engine.Rule;

public interface IEngineContext {
    public void loadEngine() throws IOException;

    public ACEReport getCompliance(String label);
    public String getUrl();
    public String getTitle();
    public Guideline[] getGuidelines();
    public Rule[] getRules();
    public String getHelp(String ruleId, String reasonId, String helpRoot);
    public String encodeURIComponent(String s);
    /**
     * The profile to use in metrics for this engine context
     * @return profile string (e.g., Selenium)
     */
    public String getProfile();
}
