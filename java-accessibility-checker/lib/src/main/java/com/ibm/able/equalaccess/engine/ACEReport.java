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

package com.ibm.able.equalaccess.engine;
import java.util.Map;

import com.google.gson.annotations.SerializedName;

public class ACEReport {

    public static class Result implements Cloneable {
        public Result() {}
        public Result(Result o) {
            apiArgs = o.apiArgs;
            bounds = (Bounds) o.bounds.clone();
            category = o.category;
            message = o.message;
            messageArgs = o.messageArgs.clone();
            path = o.path;
            reasonId = o.reasonId;
            ruleId = o.ruleId;
            ruleTime = o.ruleTime;
            snippet = o.snippet;
            value = o.value.clone();            
        }
        public Object[] apiArgs = new Object[]{};
        /** Bounds of the result as would be found in the viewport */
        public Bounds bounds = new Bounds();
        /** Category of the result (e.g., accessibility) */
        public String category;
        /** Result message describing what was found */
        public String message;
        /** Parameter parts used to construct the message */
        @SerializedName(value = "messageArgs", alternate = "msgArgs")
        public String[] messageArgs;
        /** Mapping of "dom", "aria", etc to identify the location of the result */
        public Map<String, String> path;
        /** Identifier of the rule that triggered the result */
        public String ruleId;
        /** Identifier indicating the specific reason this issue triggered within the rule */
        public String reasonId;
        /** How long this rule took to run */
        public int ruleTime;
        /** HTML snippet that this result triggered on */
        public String snippet;
        /** Combination of the level of the result (e.g., ["VIOLATION", "FAIL"]) */
        public String[] value;

        @Override
        public Object clone() { 
            // Shallow copy
            Result ret = null;
            try {
                ret = (Result)super.clone();
            } catch (CloneNotSupportedException ex) {
                System.err.println(ex);
                throw new RuntimeException();
            }
            ret.bounds = (Bounds) bounds.clone();
            return ret;
        }
    }
    
    public int numExecuted;
    public int ruleTime;
    public int totalTime;
    public Map<String, Map<String, String>> nls;
    public Result[] results;
    public String screenshot=null;
}
