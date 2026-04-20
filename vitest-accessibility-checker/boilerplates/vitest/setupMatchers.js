/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { expect } from 'vitest';
import { toBeAccessible } from 'vitest-accessibility-checker/matchers';

// Extend Vitest's expect with custom accessibility matcher
expect.extend({
  toBeAccessible
});

