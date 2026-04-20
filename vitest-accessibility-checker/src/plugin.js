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
 * NAME: plugin.js
 * DESCRIPTION: Vitest plugin for accessibility checking
 *              Provides HTTP endpoints for browser-to-Node.js communication
 *******************************************************************************/

const path = require('path');
const ACTasks = require('./lib/ACTasks');

/**
 * Vitest plugin for accessibility checking
 * @param {Object} options - Plugin configuration options
 * @returns {Object} Vitest plugin configuration
 */
function accessibilityCheckerPlugin(options = {}) {
    return {
        name: 'vitest-accessibility-checker',
        
        config(vitestConfig) {
            const setupFilePath = path.join(__dirname, 'setup.js');
            
            // Only add setup file, don't modify browser config
            return {
                test: {
                    setupFiles: [
                        ...(vitestConfig.test?.setupFiles || []),
                        setupFilePath
                    ]
                }
            };
        },

        configureServer(server) {
            // Handle task requests from browser
            server.middlewares.use((req, res, next) => {
                if (req.url === '/__accessibility-checker-task__' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', async () => {
                        try {
                            const { task, data } = JSON.parse(body);
                            const result = await ACTasks.handleTask(task, data);
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(result));
                        } catch (err) {
                            console.error('Error handling accessibility checker task:', err);
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ 
                                success: false, 
                                error: err.message 
                            }));
                        }
                    });
                    return;
                }
                
                next();
            });
        },

        async onTestFinished() {
            // Called after each test
        },

        async onFinished() {
            // Generate final reports
            await ACTasks.onRunComplete();
        }
    };
}

module.exports = {
    accessibilityCheckerPlugin
};


