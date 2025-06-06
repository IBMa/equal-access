import { createHash } from 'crypto';
import { join } from 'path';
import {Browser, launch, Page} from 'puppeteer';
// import {CustomWorld} from './CustomWorld';

let one: BrowserWrapper | null = null;

const PANEL_MAP : { [key: string]: string } = {
    "assessment": "/devtoolsMain.html",
    "quickGuide": "/quickGuideAC.html",
    "userGuide": "/usingAC.html",
    "options": "/options.html"
}

const PAGE_MAP : { [key: string]: {tabId: number, url: string} } = {
    "altoro": {
        tabId: 1,
        url: "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud"
    }
};

const MAP1 = "0123456789abcdef";
const MAP2 = "abcdefghijklmnop";
const EXTENSION_PATH = join(process.cwd(), "../dist")
const EXTENSION_ID = createHash('sha256')
    .update(EXTENSION_PATH)
    .digest('hex')
    .split("")
    .map(ch => MAP2[MAP1.indexOf(ch)])
    .join("")
    .substring(0,32);

export class BrowserWrapper {
    browser: Promise<Browser> | null = null;
    tabs: Page[] = [];
    homepage: string

    constructor() {
        this.homepage = `chrome-extension://${EXTENSION_ID}`;
        this.browser = launch({ 
            headless: process.env.TRAVIS === "true" ? true : true, 
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--enable-automation',
                '--ignore-certificate-errors'
            ]
        }).then(async browser => {
            for (const key in PAGE_MAP) {
                let p = await browser.newPage();
                await p.goto(PAGE_MAP[key].url);
                while (await p.evaluate(() => Promise.resolve(document.readyState)) !== "complete") {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            const index = this.pageKeyToTabId("altoro")!;
            const panelUrl = this.panelKeyToURL("assessment");
            let p = await browser.newPage();
            await p.goto(`${panelUrl}?index=${encodeURIComponent(index)}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await p.close();

            return browser;
        })
    }

    panelKeyToURL(key: string) {
        if (key in PANEL_MAP) {
            return `${this.homepage}${PANEL_MAP[key]}`
        } else {
            return null;
        }
    }

    pageKeyToTabId(key: string) {
        if (key in PAGE_MAP) {
            return PAGE_MAP[key].tabId;
        } else {
            return null;
        }
    }

    pageKeyToTabUrl(key: string) {
        if (key in PAGE_MAP) {
            return PAGE_MAP[key].url;
        } else {
            return null;
        }
    }

    page(): Page {
        return this.tabs[this.tabs.length-1];
    }

    async openTab(widthKey: "mobile" | "tablet" | "desktop", url?: string) {
        const width = {
            "mobile": 400,
            "tablet": 800,
            "desktop": 1200
        }
        const tab = await (await this.browser!).newPage()!;
        tab.on('console', async e => {
            const args = await Promise.all(e.args().map(a => a.jsonValue()));
            console.log(`[${e.type()}]:`,...args);
        });

        // https://github.com/puppeteer/puppeteer/issues/8166
        await tab.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36')
        
        await tab.setViewport({
            width: width[widthKey],
            height: 1080
        })
        if (url) {
            await tab.goto(url);
        }
        this.tabs.push(tab);
        return tab;
    }

    async closeTab() {
        const tab = this.tabs.pop();
        if (tab) {
            await tab.close();
        }
    }

    async closeBrowser() {
        for (const tab of this.tabs) {
            try {
                await tab.close();
            } catch (err) {}
        }

        if (this.browser) {
            (await this.browser).close();
        }
        this.browser = null;
    }

    static get() {
        if (!one) {
            one = new BrowserWrapper();
        }
        return one;
    }
}