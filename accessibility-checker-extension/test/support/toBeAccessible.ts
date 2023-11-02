/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { getCompliance, assertCompliance, stringifyResults } from "accessibility-checker";
import { ICheckerReport } from "accessibility-checker/lib/api/IChecker";

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeAccessible: () => CustomMatcherResult;
        }
    }
}

export async function toBeAccessible(this: any, node: any) {
    let results = await getCompliance(node, this.currentTestName.replace(/[ \\/]/g, "_"));
    let pass = assertCompliance(results.report as ICheckerReport) === 0;
    return { 
        pass, 
        message: () => (pass ? "" : stringifyResults(results.report as ICheckerReport))
    };
}
