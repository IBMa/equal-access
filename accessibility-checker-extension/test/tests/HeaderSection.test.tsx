/**
 * @jest-environment jsdom
 */
'use strict';
import * as React from 'react';
import { HeaderSection } from '../../src/ts/devtools/components/headerSection';
import { setupTest } from '../support/testUtil';
    
// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("HeaderSection", () => {
    test("Is accessible", async () => {
        setupTest(<HeaderSection />)
        await (expect(document) as any).toBeAccessible();
    });
});
