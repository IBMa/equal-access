/*
 * Licensed under the Apache License, Version 2.0.
 * SPDX-License-Identifier: Apache-2.0
 */

const { AriaUtil } = require('../../../src/v4/util/AriaUtil');
const { VisUtil } = require('../../../src/v4/util/VisUtil');
const { AccNameUtil } = require('../../../src/v4/util/AccNameUtil');

describe('AriaUtil semantic role resolution', function () {
    let fixture;

    beforeEach(function () {
        fixture = document.createElement('div');
        document.body.appendChild(fixture);
    });

    afterEach(function () {
        fixture.remove();
    });

    function image(attributes = '') {
        fixture.innerHTML = `<h1><img alt="ACT rules" ${attributes}></h1>`;
        return fixture.querySelector('img');
    }

    for (const role of ['presentation', 'none']) {
        it(`honors ${role} on a named image while retaining the authoring error`, function () {
            const img = image(`role="${role}"`);
            expect(AriaUtil.getInvalidRoles(img)).toContain(role);
            expect(AriaUtil.getResolvedRole(img)).toBe(role);
            expect(VisUtil.isNodePresentational(img)).toBe(true);
            expect(AccNameUtil.computeAccessibleName(fixture.querySelector('h1'))).toBeNull();
        });

        for (const tabIndex of [0, -1]) {
            it(`ignores ${role} on a focusable image (tabindex ${tabIndex})`, function () {
                const img = image(`role="${role} button" tabindex="${tabIndex}"`);
                expect(AriaUtil.getResolvedRole(img)).toBe('img');
                expect(VisUtil.isNodePresentational(img)).toBe(false);
            });
        }

        for (const attribute of ['aria-label="Name"', 'aria-label=""', 'aria-describedby="description"']) {
            it(`ignores ${role} when the global attribute ${attribute} is present`, function () {
                const img = image(`role="${role} button" ${attribute}`);
                expect(AriaUtil.getResolvedRole(img)).toBe('img');
                expect(VisUtil.isNodePresentational(img)).toBe(false);
            });
        }
    }

    it('keeps a normal image alternative as the heading name', function () {
        const img = image();
        expect(AriaUtil.getResolvedRole(img)).toBe('img');
        expect(AccNameUtil.computeAccessibleName(fixture.querySelector('h1')).name).toBe('ACT rules');
    });

    it('uses the first supported role even when it is not allowed for the host element', function () {
        const img = image('role="heading presentation"');
        expect(AriaUtil.getResolvedRole(img)).toBe('heading');
        expect(VisUtil.isNodePresentational(img)).toBe(false);
        expect(AriaUtil.getInvalidRoles(img)).toContain('heading');
    });

    it('skips unknown and abstract role tokens', function () {
        const img = image('role="unknown-role command presentation"');
        expect(AriaUtil.getResolvedRole(img)).toBe('presentation');
    });

    it('does not let a later role replace generic', function () {
        fixture.innerHTML = '<div role="generic button"></div>';
        expect(AriaUtil.getResolvedRole(fixture.firstElementChild)).toBe('generic');
    });

    it('does not treat role-specific or unknown ARIA attributes as global attributes', function () {
        const img = image('role="presentation" aria-level="1" aria-unknown="value"');
        expect(AriaUtil.getResolvedRole(img)).toBe('presentation');
    });

    it('does not treat a hidden element with a negative tabindex as focusable', function () {
        const img = image('role="presentation" tabindex="-1" hidden');
        expect(AriaUtil.getResolvedRole(img)).toBe('presentation');
    });

    it('does not treat an inert descendant with a negative tabindex as focusable', function () {
        fixture.innerHTML = '<div inert><img alt="ACT rules" role="presentation" tabindex="-1"></div>';
        expect(AriaUtil.getResolvedRole(fixture.querySelector('img'))).toBe('presentation');
    });

    for (const explicitFirst of [true, false]) {
        it(`keeps implicit and explicit-only lookups independent (explicit first: ${explicitFirst})`, function () {
            const img = image();
            if (explicitFirst) {
                expect(AriaUtil.getResolvedRole(img, false)).toBeNull();
                expect(AriaUtil.getResolvedRole(img, true)).toBe('img');
            } else {
                expect(AriaUtil.getResolvedRole(img, true)).toBe('img');
                expect(AriaUtil.getResolvedRole(img, false)).toBeNull();
            }
        });
    }
});
