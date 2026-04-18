/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test, describe, beforeEach } from 'vitest'
import { getCompliance, assertCompliance, getBaseline, getDiffResults } from '../../src/commands.js'

// Note: toBeAccessible matcher is set up in setupMatchers.js

// Helper function to render HTML in the document
function renderHTML(html) {
    document.body.innerHTML = html
}

describe('Accessibility checker tests', () => {
    beforeEach(() => {
        // Clear document before each test
        document.body.innerHTML = ''
    })

    test('getCompliance() returns a report with no violations', async () => {
        // Use exact HTML from Cypress test
        renderHTML(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <div role="main">
                    <h1>Test</h1>
                    <img src="no-missing-alt.jpg" alt="Some kind of image" />
                </div>
            </body>
            </html>
        `)
        
        const report = await getCompliance(document.body, 'getComplianceOfDocument no violations')
        
        // Output report if there are unexpected results
        if (report.results.length > 0) {
            console.error('Unexpected violations found:')
            console.error(JSON.stringify(report.results, null, 2))
        }
        
        expect(report.results).toHaveLength(0)
    })

    test('getCompliance() returns a report with violations', async () => {
        // Use exact HTML from Cypress test - missing alt attribute
        renderHTML(`
            <html>
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <h1>Test</h1>
                <img src="missing-alt.jpg" />
            </body>
            </html>
        `)
        
        const report = await getCompliance(document.body, 'getComplianceOfDocument with violations')
        
        // Output report for debugging
        if (report.results.length === 0) {
            console.error('Expected violations but found none')
            console.error('Report:', JSON.stringify(report, null, 2))
        } else {
            console.log(`Found ${report.results.length} issues as expected`)
        }
        
        expect(report.results.length).toBeGreaterThan(0)
    })

    test('getCompliance() returns a report with potential violations', async () => {
        // Use exact HTML from Cypress test - no h1, just img without alt
        renderHTML(`
            <html>
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <img src="missing-alt.jpg" />
            </body>
            </html>
        `)
        
        const report = await getCompliance(document.body, 'getComplianceOfDocument with potential violations')
        
        // Output report for debugging
        if (report.results.length === 0) {
            console.error('Expected potential violations but found none')
            console.error('Report:', JSON.stringify(report, null, 2))
        } else {
            console.log(`Found ${report.results.length} issues as expected`)
        }
        
        expect(report.results.length).toBeGreaterThan(0)
    })

    describe('assertCompliance()', () => {
        test('Is successful when there are no violations', async () => {
            renderHTML(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <div role="main">
                        <h1>Test</h1>
                        <img src="no-missing-alt.jpg" alt="Some kind of image" />
                    </div>
                </body>
                </html>
            `)
            
            const report = await getCompliance(document.body, 'assert compliance rc 0 no baseline')
            const rc = await assertCompliance(report)
            expect(rc).toBe(0)
        })

        test('Is successful when the baselines match', async () => {
            renderHTML(`
                <html>
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <h1>Test</h1>
                    <img src="missing-alt.jpg" />
                </body>
                </html>
            `)
            
            const report = await getCompliance(document.body, 'violations')
            const rc = await assertCompliance(report)
            expect(rc).toBe(0)
        })

        test('Fails when the baselines dont match', async () => {
            // Compare violations to a different baseline
            renderHTML(`
                <html>
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <h1>Test</h1>
                    <img src="missing-alt.jpg" />
                </body>
                </html>
            `)
            
            const report = await getCompliance(document.body, 'violations-no-match')
            const rc = await assertCompliance(report)
            expect(rc).toBe(1)
        })

        test('Fails when there are violations due to fail levels', async () => {
            renderHTML(`
                <html>
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <h1>Test</h1>
                    <img src="missing-alt.jpg" />
                </body>
                </html>
            `)
            
            const report = await getCompliance(document.body, 'assert compliance rc 2')
            const rc = await assertCompliance(report)
            expect(rc).toBe(2)
        })
    })

    test('getBaseline() should return data from baseline scan', async () => {
        renderHTML(`
            <html>
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <h1>Test</h1>
                <img src="missing-alt.jpg" />
            </body>
            </html>
        `)
        
        await getCompliance(document.body, 'getBaseline test')
        const result = await getBaseline('getBaseline test')
        expect(result).not.toBeNull()
    })

    test('getDiffResults() should return diff between scan and baseline', async () => {
        // First scan to create baseline - no violations
        renderHTML(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <div role="main">
                    <h1>Test</h1>
                    <img src="no-missing-alt.jpg" alt="Some kind of image" />
                </div>
            </body>
            </html>
        `)
        await getCompliance(document.body, 'violations-no-match')
        
        // Second scan with violations - missing alt
        renderHTML(`
            <html>
            <head>
                <title>Vitest accessibility-checker test page</title>
            </head>
            <body>
                <h1>Test</h1>
                <img src="missing-alt.jpg" />
            </body>
            </html>
        `)
        
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

    describe('toBeAccessible() custom matcher', () => {
        test('Passes when there are no violations', async () => {
            renderHTML(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <div role="main">
                        <h1>Test</h1>
                        <img src="no-missing-alt.jpg" alt="Some kind of image" />
                    </div>
                </body>
                </html>
            `)
            
            // Use the custom matcher
            await expect(document.body).toBeAccessible('toBeAccessible no violations')
        })

        test('Fails when there are violations', async () => {
            renderHTML(`
                <html>
                <head>
                    <title>Vitest accessibility-checker test page</title>
                </head>
                <body>
                    <h1>Test</h1>
                    <img src="missing-alt.jpg" />
                </body>
                </html>
            `)
            
            // This should fail because of missing alt attribute
            await expect(async () => {
                await expect(document.body).toBeAccessible('toBeAccessible with violations')
            }).rejects.toThrow()
        })
    })
})

