import { Page, ElementHandle, KeyInput } from "puppeteer";
import { strict as assert } from "assert";
import { IBaselineReport, IBaselineResult } from "accessibility-checker/lib/common/engine/IReport";
import { assertCompliance, getBaseline, getCompliance } from "accessibility-checker";


export namespace PupUtil {
    export async function elemVisible(src: Page | ElementHandle<Node>, selector: string, bWait?: boolean) {
        let retVal: ElementHandle<Element> | null;
        if (typeof (src as ElementHandle<Node>).toElement === "undefined") {
            // Dealing with a page root
            const page = src as Page;
            if (selector.startsWith("//") || selector.startsWith("self:")) {
                retVal = await page.waitForXPath(selector, {visible: true}) as ElementHandle<Element>;
            } else {
                retVal = await page.waitForSelector(selector, {visible: true})!;
            }
        } else {
            // Dealing with an element root
            const elem = src as ElementHandle<Node>
            if (selector.startsWith("//")) {
                selector = `xpath/.${selector.replace(/\|/g, "|.")}`
                retVal = await elem.waitForSelector(selector, {visible: true});
            } else if (selector.startsWith("self:")) {
                selector = `xpath/${selector}`
                retVal = await elem.waitForSelector(selector, {visible: true});
            } else {
                retVal = await elem.waitForSelector(selector, {visible: true})!;
            }
        }
        if (bWait) {
            // Wait after detection
            await wait(1500);
        }
        return retVal;
    }

    export async function elemNotVisible(page: Page, selector: string) {
        try {
            if (selector.startsWith("//")) {
                await page.waitForXPath(selector, {timeout: 100, visible: true});
            } else {
                await page.waitForSelector(selector, {timeout: 100, visible: true});
            }
        } catch(err) {
            return;
        }
        assert.strictEqual(false, true);
    }

    export async function untilElemNotVisible(page: Page, selector: string) {
        let count = 0;
        do {
            try {
                if (selector.startsWith("//")) {
                    await page.waitForXPath(selector, {timeout: 100, visible: true});
                } else {
                    await page.waitForSelector(selector, {timeout: 100, visible: true});
                }
            } catch(err) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            ++count;
        } while (count < 50);
        assert.strictEqual(false, true);
    }

    export async function pathVisible(page: Page, selector: string) {
        if (selector.startsWith("//")) {
            return await page.waitForXPath(selector, {visible: true});
        } else {
            return await page.waitForSelector(selector, {visible: true});
        }
    }

    export async function assertElemTextEquals(page: Page, selector: string, matchText: string) {
        let elem = await elemVisible(page, selector)!;
        if (elem) {
            const content = await page.evaluate((elem) => ((elem as any).value || elem.textContent).trim().replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' '), elem);
            assert.strictEqual(content, matchText);
        }
    }

    export async function assertElemTextStartsWith(page: Page, selector: string, matchText: string) {
        let elem = await elemVisible(page, selector)!;
        if (elem) {
            await elemVisible(elem, `self::node()[starts-with(.,'${matchText}')]`);
        }
        // let content = await page.evaluate((elem) => ((elem as any).value || elem.textContent).trim().replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' '), elem);
        // content = content.substring(0, matchText.length);
        // assert.strictEqual(content, matchText, "Does not start with expected text");
    }

    export async function assertElemTextEndsWith(page: Page, selector: string, matchText: string) {
        let elem = await elemVisible(page, selector)!;
        if (elem) {
            await elemVisible(elem, `self::node()['${matchText}'=substring(., string-length(.)-string-length('${matchText}')+1)]`);
        }
        // let content = await page.evaluate((elem) => ((elem as any).value || elem.textContent).trim().replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' '), elem);
        // content = content.substring(0, matchText.length);
        // assert.strictEqual(content, matchText, "Does not start with expected text");
    }

    export async function assertElemTextContains(page: Page, selector: string, matchText: string) {
        let elem = await elemVisible(page, selector)!;
        if (elem) {
            let content = await page.evaluate((elem) => ((elem as any).value || elem.textContent).trim().replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' '), elem);
            const idx = content.indexOf(matchText);
            if (idx >= 0) {
                content = content.substring(idx, idx+matchText.length);
            }
            assert.strictEqual(content, matchText, "Does not contain expected text");
        }
    }

    export async function elemClick(page: Page | ElementHandle<Node>, clickElemSelector: string, waitElemSelector?: string) {
        let elem: ElementHandle<Element> = await elemVisible(page, clickElemSelector) as any;
        await elem.click();
        if (waitElemSelector) {
            await elemVisible(page, waitElemSelector);
        }
        return elem;
    }

    export async function elemTap(page: Page | ElementHandle<Node>, clickElemSelector: string, waitElemSelector?: string) {
        let elem: ElementHandle<Element> = await elemVisible(page, clickElemSelector) as any;
        if (elem) {
            await elem.tap();
            if (waitElemSelector) {
                await elemVisible(page, waitElemSelector);
            }
        }
    }

    export async function elemPress(page: Page | ElementHandle<Node>, clickElemSelector: string, key: KeyInput, waitElemSelector?: string) {
        let elem: ElementHandle<Element> = await elemVisible(page, clickElemSelector) as any;
        if (elem) {
            await elem.press(key);
            if (waitElemSelector) {
                await elemVisible(page, waitElemSelector);
            }
        }
    }
    export async function elemType(page: Page | ElementHandle<Node>, elemSelector: string, text: string, waitElemSelector?: string) {
        let elem = await elemVisible(page, elemSelector)!;
        if (elem) {
            await elem.type(text);
            if (waitElemSelector) {
                await elemVisible(page, waitElemSelector);
            }
        }
    }

    export async function elemClear(page: Page, elemSelector: string, waitElemSelector?: string) {
        let elem = await elemVisible(page, elemSelector)!
        if (elem) {
            await elem.click({ clickCount: 3 })
            await page.keyboard.press('Backspace');
            if (waitElemSelector) {
                await elemVisible(page, waitElemSelector);
            }
        }
    }

    export async function elemSelect(page: Page, elemSelector:string, option: string, waitElemSelector?: string) {
        let elem = await elemVisible(page, elemSelector)!;
        if (elem) {
            await elem.select(option);
            if (waitElemSelector) {
                await elemVisible(page, waitElemSelector);
            }
        }
    }

    export async function xpathClick(page: Page, xpath: string, waitElemSelector?: string) {
        let elem = await page.waitForXPath(xpath, {visible: true}) as unknown as HTMLElement;
        await elem.click();
        if (waitElemSelector) {
            await elemVisible(page, waitElemSelector);
        }
    }

    export async function wait(num: number) {
        return await new Promise<void>((resolve, _reject) => {
            setTimeout(() => {
                resolve();
            }, num);
        })
    }

    function serialize(results: IBaselineResult[]) {
        let retVal = "";
        for (const item of results) {
            if (item.value[0] === "VIOLATION" && item.value[1] === "FAIL") {
                retVal += `${item.message} (${item.path.dom})
    `;
            }
        }
        return retVal;
    }

    export async function accessibilityScan(page: Page, fullLabel:string) {
        let result = await getCompliance(page, fullLabel);
        let report = result.report as IBaselineReport;
        if (assertCompliance(report) === 0) {
            return
        } else {
            let baseline = getBaseline(fullLabel);
            let message = (baseline ? `${report.summary.counts.violation} accessibility violations
        Expected:
        ${serialize(baseline.results)}

        ` : `No baseline

        `) + `Actual:
        ${serialize(report.results)}`;
            assert(report.summary.counts.violation === (baseline ? baseline.summary.counts.violation : 0), message);
        }
    }
}