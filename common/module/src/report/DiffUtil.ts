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

import microdiff, { Difference } from 'microdiff';

/**
 * Deep-diff compatible difference types
 */
export type DeepDiffKind = 'N' | 'D' | 'E' | 'A';

/**
 * Deep-diff compatible difference object
 */
export interface DeepDiffResult {
    kind: DeepDiffKind;
    path: (string | number)[];
    lhs?: any;
    rhs?: any;
    index?: number;
    item?: DeepDiffResult;
}

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
function convertMicrodiffToDeepDiff(microDiff: Difference): DeepDiffResult {
    const result: DeepDiffResult = {
        kind: 'E' as DeepDiffKind,
        path: microDiff.path as (string | number)[]
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
 * @param lhs - Left-hand side object (actual)
 * @param rhs - Right-hand side object (expected)
 * @returns Array of differences or undefined if objects are equal
 */
export function diff(lhs: any, rhs: any): DeepDiffResult[] | undefined {
    const differences = microdiff(lhs, rhs);
    
    if (!differences || differences.length === 0) {
        return undefined;
    }

    return differences.map(convertMicrodiffToDeepDiff);
}

/**
 * Default export for compatibility with deep-diff import patterns
 */
export default {
    diff
};
