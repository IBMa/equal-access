/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const aChecker = require("accessibility-checker");

async function toBeAccessible(node, label) {
  let results = await aChecker.getCompliance(node, label);
  if (aChecker.assertCompliance(results.report) === 0) {
    return {
      pass: true
    }
  } else {
    return {
      pass:false,
      message: () => aChecker.stringifyResults(results.report)
    }
  }
}

module.exports = toBeAccessible;