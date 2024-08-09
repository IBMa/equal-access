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

package com.ibm.able.engine;
import java.util.Map;

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
        public Bounds bounds = new Bounds();
        public String category;
        public String message;
        public String[] messageArgs;
        public Map<String, String> path;
        public String reasonId;
        public String ruleId;
        public int ruleTime;
        public String snippet;
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
