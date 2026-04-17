/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { getCompliance, assertCompliance, stringifyResults } from 'vitest-accessibility-checker/commands';

async function toBeAccessible(node, label) {
  const results = await getCompliance(node, label || this.task.name.replace(/[ \\/]/g, "_"));
  if (assertCompliance(results) === 0) {
    return {
      pass: true
    }
  } else {
    return {
      pass: false,
      message: () => stringifyResults(results)
    }
  }
}

export default toBeAccessible;

