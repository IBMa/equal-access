/******************************************************************************
     Copyright:: 2026- IBM, Inc

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

/*******************************************************************************
 * NAME: provider.js
 * DESCRIPTION: Vitest browser provider for accessibility checker commands
 *******************************************************************************/

const ACTasks = require('./lib/ACTasks');

module.exports = {
  name: 'accessibility-checker',
  
  async setup() {
    // Initialize on setup
  },
  
  commands: {
    accessibilityChecker: async (ctx, task, data) => {
      return await ACTasks.handleTask(task, data);
    }
  }
};


