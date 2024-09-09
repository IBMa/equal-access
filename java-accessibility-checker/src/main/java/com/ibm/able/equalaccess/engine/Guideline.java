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

public class Guideline {
    public static class Rule {
        public String id;
        public String level;
        public String toolkitLevel;
    }

    public static class Checkpoint {
        public String num;
        public String name;
        // public String scId;
        public String summary;
        public String wcagLevel;
        public Rule[] rules;
    }

    public String id;
    public String name;
    public String description;
    public String category;
    public Checkpoint[] checkpoints;
}
