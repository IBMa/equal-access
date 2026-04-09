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
 * Browser-compatible microdiff wrapper
 * Exposes microdiff as a global function for use in Karma tests
 */
(function(root) {
    'use strict';
    
    const richTypes = { Date: true, RegExp: true, String: true, Number: true };
    
    function diff(obj, newObj, options, _stack) {
        options = options || { cyclesFix: true };
        _stack = _stack || [];
        
        let diffs = [];
        const isObjArray = Array.isArray(obj);
        
        for (const key in obj) {
            const objKey = obj[key];
            const path = isObjArray ? +key : key;
            
            if (!(key in newObj)) {
                diffs.push({
                    type: "REMOVE",
                    path: [path],
                    oldValue: obj[key],
                });
                continue;
            }
            
            const newObjKey = newObj[key];
            const areCompatibleObjects = typeof objKey === "object" &&
                typeof newObjKey === "object" &&
                Array.isArray(objKey) === Array.isArray(newObjKey);
                
            if (objKey &&
                newObjKey &&
                areCompatibleObjects &&
                !richTypes[Object.getPrototypeOf(objKey)?.constructor?.name] &&
                (!options.cyclesFix || !_stack.includes(objKey))) {
                const nestedDiffs = diff(objKey, newObjKey, options, options.cyclesFix ? _stack.concat([objKey]) : []);
                nestedDiffs.forEach(function(difference) {
                    difference.path.unshift(path);
                    diffs.push(difference);
                });
            }
            else if (objKey !== newObjKey &&
                // treat NaN values as equivalent
                !(Number.isNaN(objKey) && Number.isNaN(newObjKey)) &&
                !(areCompatibleObjects &&
                    (isNaN(objKey)
                        ? objKey + "" === newObjKey + ""
                        : +objKey === +newObjKey))) {
                diffs.push({
                    path: [path],
                    type: "CHANGE",
                    value: newObjKey,
                    oldValue: objKey,
                });
            }
        }
        
        const isNewObjArray = Array.isArray(newObj);
        for (const key in newObj) {
            if (!(key in obj)) {
                diffs.push({
                    type: "CREATE",
                    path: [isNewObjArray ? +key : key],
                    value: newObj[key],
                });
            }
        }
        
        return diffs;
    }
    
    // Export as global
    root.microdiff = diff;
    
    // Also support CommonJS for Node.js environments
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = diff;
    }
    
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);

