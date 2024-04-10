/**
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

let aChecker = null;

async function toBeAccessible(node) {
    if (process.env.DISABLE_A11Y_SCAN)
      return {message: 'A11y scan skipped', pass: true};
  
    if (!aChecker) {
      aChecker = require('accessibility-checker');
  
      const ignorelist = [
        'html_lang_exists',
        'page_title_exists',
        'skip_main_exists',
        'html_skipnav_exists',
        'aria_content_in_landmark'
      ];
      const ruleset = await aChecker.getRuleset('IBM_Accessibility');
      const customRuleset = JSON.parse(JSON.stringify(ruleset));
  
      customRuleset.id = 'Custom_Ruleset';
      customRuleset.checkpoints = customRuleset.checkpoints.map(checkpoint => {
        checkpoint.rules = checkpoint.rules.filter(
          rule => !ignorelist.includes(rule.id)
        );
        return checkpoint;
      });
  
      aChecker.addRuleset(customRuleset);
    }
    try {
      const results = await aChecker.getCompliance(node, this.currentTestName);
      if (aChecker.assertCompliance(results.report) === 0) {
          return {
              pass: true
          }
      } else {
          return {
              pass: false,
              message: () => aChecker.stringifyResults(results.report)
          };
      }
    } catch (e) {
      console.error(e);
    } finally {
        await aChecker.close();
    }
  }

module.exports = toBeAccessible;