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

/**
 * Browser-compatible deep-diff replacement using microdiff
 * This file provides a global DeepDiff object compatible with the old deep-diff API
 */

// Import microdiff - will be bundled/loaded separately
// For browser use, microdiff will be available as a global or module

/**
 * Converts microdiff output to deep-diff compatible format
 * 
 * Microdiff types:
 * - CREATE: property was created
 * - REMOVE: property was removed  
 * - CHANGE: property value changed
 * 
 * Deep-diff types:
 * - N: new property
 * - D: deleted property
 * - E: edited property
 * - A: array change
 */
function convertMicrodiffToDeepDiff(microDiff) {
    const result = {
        kind: 'E',
        path: microDiff.path
    };

    switch (microDiff.type) {
        case 'CREATE':
            result.kind = 'N';
            result.rhs = microDiff.value;
            break;
        case 'REMOVE':
            result.kind = 'D';
            result.lhs = microDiff.oldValue;
            break;
        case 'CHANGE':
            result.kind = 'E';
            result.lhs = microDiff.oldValue;
            result.rhs = microDiff.value;
            break;
    }

    return result;
}

/**
 * Deep-diff compatible diff function
 * Compares two objects and returns differences in deep-diff format
 * 
 * @param {*} lhs - Left-hand side object (actual)
 * @param {*} rhs - Right-hand side object (expected)
 * @returns {Array|undefined} Array of differences or undefined if objects are equal
 */
function diff(lhs, rhs) {
    // Use the global microdiff function (loaded from microdiff library)
    const microdiffFn = (typeof microdiff !== 'undefined') ? microdiff : 
                        (typeof window !== 'undefined' && window.microdiff) ? window.microdiff : null;
    
    if (!microdiffFn) {
        throw new Error('microdiff library not loaded');
    }
    
    const differences = microdiffFn(lhs, rhs);
    
    if (!differences || differences.length === 0) {
        return undefined;
    }

    return differences.map(convertMicrodiffToDeepDiff);
}

// Create global DeepDiff object for compatibility
if (typeof window !== 'undefined') {
    window.DeepDiff = {
        diff: diff
    };
} else if (typeof global !== 'undefined') {
    global.DeepDiff = {
        diff: diff
    };
}

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        diff: diff
    };
}
