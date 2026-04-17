/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test, describe } from 'vitest'
import { page } from '@vitest/browser/context'
import { getCompliance, assertCompliance, getBaseline, getDiffResults } from 'vitest-accessibility-checker/commands'

describe('Accessibility checker tests', () => {

    test('getCompliance() returns a report of the document', async () => {
        await page.goto('/sample-html/no-violations.html')
        const report1 = await getCompliance(document.body, 'getComplianceOfDocument no violations')
        expect(report1.results).toHaveLength(0)

        await page.goto('/sample-html/violations.html')
        const report2 = await getCompliance(document.body, 'getComplianceOfDocument with violations')
        expect(report2.results.length).toBeGreaterThan(0)

        await page.goto('/sample-html/potentialviolations.html')
        const report3 = await getCompliance(document.body, 'getComplianceOfDocument with potential violations')
        expect(report3.results.length).toBeGreaterThan(0)
    })

    describe('assertCompliance()', () => {
        test('Is successful when there are no violations', async () => {
            await page.goto('/sample-html/no-violations.html')
            const report = await getCompliance(document.body, 'assert compliance rc 0 no baseline')
            const rc = await assertCompliance(report)
            expect(rc).toBe(0)
        })

        test('Is successful when the baselines match', async () => {
            await page.goto('/sample-html/violations.html')
            const report = await getCompliance(document.body, 'violations')
            const rc = await assertCompliance(report)
            expect(rc).toBe(0)
        })

        test('Fails when the baselines dont match', async () => {
            // Compare no-violations to a violations baseline
            await page.goto('/sample-html/violations.html')
            const report = await getCompliance(document.body, 'violations-no-match')
            const rc = await assertCompliance(report)
            expect(rc).toBe(1)
        })

        test('Fails when there are violations due to fail levels', async () => {
            await page.goto('/sample-html/violations.html')
            const report = await getCompliance(document.body, 'assert compliance rc 2')
            const rc = await assertCompliance(report)
            expect(rc).toBe(2)
        })
    })

    test('getBaseline() should return data from baseline scan', async () => {
        await page.goto('/sample-html/violations.html')
        await getCompliance(document.body, 'getBaseline test')

        const result = await getBaseline('getBaseline test')
        expect(result).not.toBeNull()
    })

    test('getDiffResults() should return diff between scan and baseline', async () => {
        // Compare violations to a no-violations baseline
        await page.goto('/sample-html/violations.html')
        const report = await getCompliance(document.body, 'violations-no-match')
        const rc = await assertCompliance(report)
        expect(rc).toBe(1)

        const result = await getDiffResults('violations-no-match', report)
        expect(result).not.toBeNull()
        result.forEach((obj) => {
            expect(obj.kind).not.toBeNull()
            expect(obj.kind).not.toBeUndefined()
        })
    })
})

