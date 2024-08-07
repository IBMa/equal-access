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

public class ACReport {
    public static class Bounds {
        int top;
        int left;
        int height;
        int width;
    }

    public static class Result {
        public Object[] apiArgs;
        public Bounds bounds;
        public String category;
        public String message;
        public String[] messageArgs;
        public Map<String, String> path;
        public String reasonId;
        public String ruleId;
        public int ruleTime;
        public String snippet;
        public String[] value;
    }
    
    public int numExecuted;
    public int ruleTime;
    public int totalTime;
    public Map<String, Map<String, String>> nls;
    public Result[] results;
}
