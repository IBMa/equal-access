import { ACConfigManager } from "./ACConfigManager";
import * as request from "request";
import * as path from "path";
import * as fs from "fs";

let ace;

let checker;

export class ACEngineManager {
    static customRulesets = []
    static async loadEngine(content) {
        let config = await ACConfigManager.getConfigUnsupported();
        if (ACEngineManager.isPuppeteer(content) || ACEngineManager.isPlaywright(content)) {
            config.DEBUG && console.log("[INFO] aChecker.loadEngine detected Puppeteer/Playwright");
            let page = content;
            await page.evaluate((scriptUrl) => {
                try {
                    if ('undefined' === typeof(ace)) {
                        return new Promise<void>((resolve, reject) => {
                            let script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('aChecker', 'ACE');
                            script.setAttribute('src', scriptUrl);
                            script.addEventListener('load', function () {
                                resolve();
                            });
                            let heads = document.getElementsByTagName('head');
                            if (heads.length > 0) { heads[0].appendChild(script); }
                            else if (document.body) { document.body.appendChild(script); }
                            else { Promise.reject("Invalid document"); }
                        })
                    }
                } catch (e) {
                    return Promise.reject(e);
                }
            }, `${config.rulePack}/ace.js`);
            return ACEngineManager.loadEngineLocal();
        } else if (ACEngineManager.isSelenium(content)) {
            config.DEBUG && console.log("[INFO] aChecker.loadEngine detected Selenium");
            try {
                let browser = content;
                // Selenium
                let scriptStr =
`let cb = arguments[arguments.length - 1];
try {
    if ('undefined' === typeof(ace)) {
        let script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('aChecker', 'ACE');
        script.setAttribute('src', '${config.rulePack}/ace.js');
        script.addEventListener('load', function() {
            cb();
        });
        let heads = document.getElementsByTagName('head');
        if (heads.length > 0) { heads[0].appendChild(script); }
        else { document.body.appendChild(script); }
    } else {
        cb();
    }
} catch (e) {
    cb(e);
}
`
                let manage = browser.manage();
                if (manage.timeouts) {
                    manage.timeouts().setScriptTimeout(60000);
                } else if (manage.setTimeouts) {
                    manage.setTimeouts({
                        "script": 60000
                    })
                }

                return browser.executeAsyncScript(scriptStr).then(function (return_success) {
                    return ACEngineManager.loadEngineLocal();
                }).catch(function (err) {
                    console.log(err);
                });
            } catch (e) {
                console.log(e);
            }
        } else {
            config.DEBUG && console.log("[INFO] aChecker.loadEngine detected local");
            if (ace) {
                return Promise.resolve();
            } else {
                return ACEngineManager.loadEngineLocal();
            }
        }
    }

    static async loadEngineLocal() {
        if (ace) {
            return Promise.resolve();
        }
        let config = await ACConfigManager.getConfigUnsupported();

        return new Promise<void>((resolve, reject) => {
            request.get(`${config.rulePack}/ace-node.js`, function (err, data) {
                if (!data) {
                    console.log("Cannot read: " + `${config.rulePack}/ace-node.js`);
                }
                data = data.body;
                let engineDir = path.join(__dirname, "engine");
                if (!fs.existsSync(engineDir)) {
                    fs.mkdirSync(engineDir);
                }
                let cacheDir = path.join(engineDir, "cache");
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir);
                }
                fs.writeFile(path.join(engineDir, "ace-node.js"), data, function (err) {
                    try {
                        err && console.log(err);
                        ace = require("./engine/ace-node");
                        checker = new ace.Checker();
                    } catch (e) {
                        console.log(e);
                        return reject(e);
                    }
                    resolve();
                });
            });
        });
    }

    static isPuppeteer(content) {
        if (content && content.constructor) {
            return !!content.constructor.toString().match(/Function: Page/) 
                || content.constructor.toString().includes("Puppeteer");
        }
        return false;
    }
    
    static isPlaywright(content) {
        if (content && content.constructor) {
            return !!content.constructor.toString().match(/class Page /);
        }
        return false;
    }
    
    static isSelenium(content) {
        if (content && content.constructor) {
            return content.constructor.toString().indexOf("Driver") !== -1 ||
                // check required for selenium >= 3.0.1
                (content.constructor.name && content.constructor.name.indexOf("Driver") !== -1);
        }
        return false;
    }


    /**
     * This function is responsible for building the full help file URL using rule server.
     *
     * @param {String} helpFileName - Provide the help file name
     *
     * @return {String} helpFileName - The full help file URL
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static getHelpURL(issue) {
        let config = ACConfigManager.getConfigNow();
        let engineHelp = checker.engine.getHelp(issue.ruleId, issue.reasonId);
        let engineHelpId = engineHelp.match(/\/help\/([^/]*)/);
        if (engineHelpId) {
            engineHelpId = engineHelpId[1]+".html";
        } else {
            engineHelpId = engineHelp;
        }
        let minIssue = {
            message: issue.message,
            snippet: issue.snippet,
            value: issue.value,
            reasonId: issue.reasonId,
            ruleId: issue.ruleId
        };
        return `${config.ruleServer}/archives/${config.ruleArchive}/doc/en-US/${engineHelpId}#${encodeURIComponent(JSON.stringify(minIssue))}`
    };

    static addRuleset = (ruleset) => {
        ACEngineManager.customRulesets.push(ruleset);
    }

    static getRuleset = async (rsId) => {
        if (!checker) {
            await ACEngineManager.loadEngineLocal();
        }
        return ACEngineManager.customRulesets.concat(checker.rulesets).filter((function (rs) { return rs.id === rsId }))[0];
    };

    static getRulesets = async function () {
        if (!checker) {
            await ACEngineManager.loadEngineLocal();
        }
        return ACEngineManager.customRulesets.concat(checker.rulesets);
    };

    static getChecker() {
        return checker;
    }
}