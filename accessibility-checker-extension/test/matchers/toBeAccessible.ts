/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { assertCompliance, getCompliance, stringifyResults } from "accessibility-checker";
import { ICheckerReport } from "accessibility-checker/lib/api/IChecker";
import { Page } from "puppeteer";

async function toBeAccessible(node: Page) {
  let results = await getCompliance(node, this.currentTestName.replace(/[ \\/]/g, "_"));
  if (assertCompliance(results.report as ICheckerReport) === 0) {
    return {
      pass: true
    }
  } else {
    return {
      pass:false,
      message: () => stringifyResults(results.report as ICheckerReport)
    }
  }
}
module.exports = toBeAccessible;