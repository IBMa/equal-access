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
 * NAME: setup.js
 * DESCRIPTION: Browser setup for accessibility checking
 *              Loads the ace engine and helper in the browser context
 *******************************************************************************/

import { beforeAll } from 'vitest';

// Global promise to track initialization
let initPromise = null;

/**
 * Initialize the accessibility checker
 */
async function initializeAccessibilityChecker() {
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            // Get config to find rulePack URL
            const configResponse = await fetch('/__accessibility-checker-task__', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'getConfig',
                    data: {}
                })
            });
            
            const config = await configResponse.json();
            const rulePack = config.rulePack || 'https://unpkg.com/accessibility-checker-engine@latest';
            const engineUrl = `${rulePack}/ace.js`;
            
            // Load the ace engine
            const engineResponse = await fetch(engineUrl);
            if (!engineResponse.ok) {
                throw new Error(`Failed to load accessibility-checker-engine: ${engineResponse.statusText}`);
            }
            
            const engineCode = await engineResponse.text();
            
            // Execute the engine code in the browser
            const script = document.createElement('script');
            script.textContent = engineCode;
            document.head.appendChild(script);
            
            // Verify ace is loaded
            if (!window.ace) {
                throw new Error('ace engine failed to initialize');
            }
            
            console.log('ace engine loaded successfully');
            
            // Load the ACBrowserHelper
            const helperUrl = new URL('./lib/ACBrowserHelper.js', import.meta.url).href;
            const helperResponse = await fetch(helperUrl);
            if (!helperResponse.ok) {
                throw new Error(`Failed to load ACBrowserHelper: ${helperResponse.statusText}`);
            }
            
            const helperCode = await helperResponse.text();
            const helperScript = document.createElement('script');
            helperScript.textContent = helperCode;
            document.head.appendChild(helperScript);
            
            // Verify ACBrowserHelper is loaded
            if (!window.ACBrowserHelper) {
                throw new Error('ACBrowserHelper failed to initialize');
            }
        } catch (err) {
            console.error('Error setting up accessibility checker:', err);
            initPromise = null; // Reset so it can be retried
            throw err;
        }
    })();

    return initPromise;
}

// Register beforeAll hook to initialize before any tests run
beforeAll(async () => {
    await initializeAccessibilityChecker();
}, 30000); // 30 second timeout for initialization


