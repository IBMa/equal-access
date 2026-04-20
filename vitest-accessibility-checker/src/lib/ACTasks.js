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
 * NAME: ACTasks.js
 * DESCRIPTION: Node.js tasks for handling config, reporting, and baselines
 *              These run outside the browser and handle all file I/O
 *******************************************************************************/

const { ACConfigManager } = require('./common/config/ACConfigManager');
const { ReporterManager } = require('./common/report/ReporterManager');
const { BaselineManager } = require('./common/report/BaselineManager');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { dirname, join, resolve: pathResolve } = require('path');

let config = null;
let initialized = false;

/**
 * Abstract API implementation for file system operations
 */
class VitestAbsAPI {
    writeFileSync(filePath, data) {
        const outFile = this.prepFileSync(filePath);
        writeFileSync(outFile, data);
    }
    
    prepFileSync(filePath) {
        const outDir = pathResolve(config.outputFolder);
        const outFile = join(outDir, filePath);
        if (!existsSync(dirname(outFile))) {
            mkdirSync(dirname(outFile), { recursive: true });
        }
        return outFile;
    }
    
    log(...output) {
        if (config && config.DEBUG) {
            console.debug(...output);
        }
    }
    
    info(...output) {
        if (config && config.DEBUG) {
            console.info(...output);
        }
    }
    
    error(...output) {
        if (config && config.DEBUG) {
            console.error(...output);
        }
    }
    
    loadBaseline(label) {
        const baselineFile = join(join(process.cwd(), config.baselineFolder), label + ".json");
        if (!existsSync(baselineFile)) return null;
        return JSON.parse(readFileSync(baselineFile).toString());
    }
    
    getChecker() {
        // Return a minimal checker interface
        // In Vitest, the engine runs in the browser, so we don't have direct access
        return {
            engine: {
                getHelp: (ruleId, reasonId, archive) => {
                    // Construct help URL
                    const archivePath = config.ruleArchivePath || config.ruleArchive;
                    const archiveName = archivePath ? archivePath.substring(archivePath.lastIndexOf("/") + 1) : archive;
                    return `https://able.ibm.com/rules/${archiveName}/${ruleId}.html`;
                }
            }
        };
    }
}

/**
 * Initialize configuration and managers
 */
async function initialize() {
    if (initialized) return;
    
    config = await ACConfigManager.getConfig();
    const absAPI = new VitestAbsAPI();
    
    // Initialize ReporterManager with config and absAPI
    // Note: We don't have rulesets in Node.js context, but ReporterManager can work without them
    ReporterManager.initialize(config, absAPI, []);
    
    // Initialize BaselineManager
    BaselineManager.initialize(config, absAPI, {});
    
    initialized = true;
}

/**
 * Get configuration
 */
async function getConfig() {
    await initialize();
    return config;
}

/**
 * Send scan results to reporter
 */
async function sendResultsToReporter(data) {
    await initialize();
    const { profile, startScan, url, title, label, report } = data;
    // Use ReporterManager.addEngineReport like Cypress does
    return ReporterManager.addEngineReport(profile, startScan, url, title, label, report);
}

/**
 * Assert compliance against baseline or fail levels
 */
async function assertCompliance(data) {
    await initialize();
    const { report } = data;
    const retVal = BaselineManager.assertCompliance(report);
    return retVal;
}

/**
 * Get baseline for a label
 */
async function getBaseline(data) {
    await initialize();
    const { label } = data;
    return BaselineManager.getBaseline(label);
}

/**
 * Get diff between actual and baseline
 */
async function getDiffResults(data) {
    await initialize();
    const { label, actual } = data;
    return BaselineManager.getDiffResults(label, actual);
}

/**
 * Handle task requests from browser
 */
async function handleTask(task, data) {
    try {
        switch (task) {
            case 'getConfig':
                return await getConfig();
            case 'sendResultsToReporter':
                return await sendResultsToReporter(data);
            case 'assertCompliance':
                return await assertCompliance(data);
            case 'getBaseline':
                return await getBaseline(data);
            case 'getDiffResults':
                return await getDiffResults(data);
            case 'generateSummaries':
                await onRunComplete();
                return { success: true };
            default:
                throw new Error(`Unknown task: ${task}`);
        }
    } catch (err) {
        console.error(`Error handling task ${task}:`, err);
        throw err;
    }
}

/**
 * Called when all tests are complete
 */
async function onRunComplete() {
    if (!initialized) return;
    
    try {
        // Generate final summary reports
        await ReporterManager.generateSummaries();
    } catch (err) {
        console.error('Error generating summary:', err);
    }
}

module.exports = {
    handleTask,
    onRunComplete
};



