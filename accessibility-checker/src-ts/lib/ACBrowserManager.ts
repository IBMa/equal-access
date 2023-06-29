import * as puppeteer from "puppeteer";
import { ACConfigManager } from "./common/config/ACConfigManager";
import { IConfigInternal } from "./common/config/IConfig";


export class ACBrowserManager {
    static browserP;
    static config: IConfigInternal;
    static numInits: 0;
    static pages: any[] = [];

    static async getBrowserChrome(force: boolean) {
        if (!ACBrowserManager.config) {
            ACBrowserManager.config = await ACConfigManager.getConfigUnsupported();
        }
        if  (force || !ACBrowserManager.browserP) {
            return ACBrowserManager.browserP = puppeteer.launch({headless: ACBrowserManager.config.headless, ignoreHTTPSErrors: ACBrowserManager.config.ignoreHTTPSErrors || false});
        } else {
            return ACBrowserManager.browserP;
        }
    }

    static async close() {
        if (ACBrowserManager.browserP) {
            let browser = await ACBrowserManager.browserP;
            await browser.close();
            ACBrowserManager.browserP = null;
            ACBrowserManager.pages = [];
        }
    }

    /**
     * This function is responsible for building an iframe object with the provided URL or local file.
     *
     * @param {String} URLorLocalFile - Provide a URL or local file to scan.
     *
     * @return {Object} content - return an object which contains the iframeDoc and also the URL or
     *                               local file name.
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static async buildIframeAndGetDoc(URLorLocalFileorContent) {
        if (!ACBrowserManager.config) {
            ACBrowserManager.config = await ACConfigManager.getConfigUnsupported();
        }
        const MAX_TABS = ACBrowserManager.config.maxTabs;
        const browser = await ACBrowserManager.getBrowserChrome(false);

        // Clear out any pages that are already closed
        ACBrowserManager.pages = ACBrowserManager.pages.filter((page) => page && !page.isClosed());

        // If there's an existing, ready page, use it
        let availPage;
        for (const page of ACBrowserManager.pages) {
            if (!availPage) {
                if (!page.aceBusy) {
                    availPage = page;
                    page.aceBusy = true;
                }
            }
        }

        if (!availPage) {
            // All pages are busy. Should we create a new one?
            if (ACBrowserManager.pages.length+ACBrowserManager.numInits >= MAX_TABS) {
                // Too many pages, restart
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        resolve(await ACBrowserManager.buildIframeAndGetDoc(URLorLocalFileorContent));
                    }, 500);
                });
            } else {
                // Let's create a new page
                ++ACBrowserManager.numInits;

                let newPage = await browser.newPage();
                newPage.on('console', msg => {
                    for (let i = 0; i < msg.args.length; ++i)
                    console.log(`${i}: ${msg.args[i]}`);
                });
                newPage.aceBusy = true;
                availPage = newPage;
                ACBrowserManager.pages.push(newPage);
                --ACBrowserManager.numInits;
            }
        }

        let err = null,
            retVal = null;
        async function nav() {
            try {
                if (URLorLocalFileorContent.toLowerCase().includes("<html")) {
                    // await page.goto(`data:text/html,encodeURIComponent(${URLorLocalFileorContent})`, { waitUntil: 'networkidle0' });
                    let urlStr = "data:text/html;charset=utf-8," + encodeURIComponent(URLorLocalFileorContent);
                    await availPage.goto(urlStr);
                } else {
                    await availPage.goto(URLorLocalFileorContent);
                }
            } catch (e) {
                err = `${e.message} ${URLorLocalFileorContent}`;
                console.error(err);
                return null;
            }
            return availPage;
        }
        try {
            retVal = await nav();
        } catch (e) {
        }
        if (!retVal) {
            // Page bad or unable to navigate, start over
            availPage.close();
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    resolve(await ACBrowserManager.buildIframeAndGetDoc(URLorLocalFileorContent));
                }, 0);
            });
        }
        if (retVal === null) {
            console.log("[Internal Error:load content]", err);
        }

        return retVal;
    };
}