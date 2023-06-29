import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { ACConfigManager } from "./common/config/ACConfigManager";

let ace;

let checker;

export class ACEngineManager {
    static customRulesets = []
    static engineContent = null;
    static async loadEngine(content) {
        let config = await ACConfigManager.getConfigUnsupported();
        let ENGINE_LOAD_MODE = config.engineMode;
        if (ENGINE_LOAD_MODE === "DEFAULT") {
            // ENGINE_LOAD_MODE = "REMOTE";
            ENGINE_LOAD_MODE = "INJECT";
        }
        if (ENGINE_LOAD_MODE === "INJECT" && !ACEngineManager.engineContent) {
            const response = await axios.get(`${config.rulePack}/ace.js`);
            ACEngineManager.engineContent = await response.data;
        }
        if (ACEngineManager.isPuppeteer(content) || ACEngineManager.isPlaywright(content)) {

            config.DEBUG && console.log("[INFO] aChecker.loadEngine detected Puppeteer/Playwright");
            let page = content;
            if (ENGINE_LOAD_MODE === "REMOTE") {
                await page.evaluate((scriptUrl) => {
                    try {
                        var ace_backup_in_ibma;
                        if ('undefined' !== typeof(ace)) {
                            if (!ace || !ace.Checker)
                                ace_backup_in_ibma = ace;
                            ace = null;
                        }
                        if ('undefined' === typeof (ace) || ace === null) {
                            return new Promise<void>((resolve, reject) => {
                                let script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('aChecker', 'ACE');
                                script.setAttribute('src', scriptUrl);
                                script.addEventListener('load', function () {
                                    globalThis.ace_ibma = ace;
                                    if ('undefined' !== typeof(ace)) {
                                        ace = ace_backup_in_ibma;
                                    }
                                    resolve();
                                });
                                script.addEventListener('error', function (evt) {
                                    reject(new Error(`Unable to load engine into ${document.location.href}. This can happen if the page server sets a Content-Security-Policy that prevents ${scriptUrl} from loading.`))
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
            } else if (ENGINE_LOAD_MODE === "INJECT") {
                await page.evaluate((engineContent) => {
                    try {
                        var ace_backup_in_ibma;
                        if ('undefined' !== typeof(ace)) {
                            if (!ace || !ace.Checker)
                                ace_backup_in_ibma = ace;
                            ace = null;
                        }
                        if ('undefined' === typeof (ace) || ace === null) {
                            return new Promise<void>((resolve, reject) => {
                                eval(engineContent);
                                globalThis.ace_ibma = ace;
                                if ('undefined' !== typeof(ace)) {
                                    ace = ace_backup_in_ibma;
                                }
                                resolve();
                            })
                        }
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }, ACEngineManager.engineContent);
            }
            return ACEngineManager.loadEngineLocal();
        } else if (ACEngineManager.isSelenium(content)) {
            config.DEBUG && console.log("[INFO] aChecker.loadEngine detected Selenium");
            try {
                let browser = content;
                let scriptStr;
                if (ENGINE_LOAD_MODE === "REMOTE") {
                    scriptStr =
                        `let cb = arguments[arguments.length - 1];
    try {
        var ace_backup_in_ibma;
            if ('undefined' !== typeof(ace)) {
                if (!ace || !ace.Checker) 
                    ace_backup_in_ibma = ace;
                ace = null; 
            } 
            if ('undefined' === typeof (ace) || ace === null) {
            let script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('aChecker', 'ACE');
            script.setAttribute('src', '${config.rulePack}/ace.js');
            script.addEventListener('load', function() {
                globalThis.ace_ibma = ace;
                if ('undefined' !== typeof(ace)) {
                    ace = ace_backup_in_ibma;
                } 
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
                } else if (ENGINE_LOAD_MODE === "INJECT") {

                    // Selenium
                    scriptStr =
                        `let cb = arguments[arguments.length - 1];
    try {
        var ace_backup_in_ibma;
        if ('undefined' !== typeof(ace)) {
            if (!ace || !ace.Checker) 
                ace_backup_in_ibma = ace;
            ace = null; 
        } 
        if ('undefined' === typeof (ace) || ace === null) {
            eval(${JSON.stringify(ACEngineManager.engineContent)})
            globalThis.ace_ibma = ace;
            if ('undefined' !== typeof(ace)) {
                ace = ace_backup_in_ibma;
            } 
            cb();
            
        } else {
            cb();
        }
    } catch (e) {
        cb(e);
    }
    `                
                }

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
            if (globalThis.ace_ibma) {
                return Promise.resolve();
            } else {
                return ACEngineManager.loadEngineLocal();
            }
        }
    }

    static localLoadPromise = null;
    static async loadEngineLocal() {
        if (globalThis.ace_ibma) {
            return Promise.resolve();
        }
        if (!ACEngineManager.localLoadPromise) {
            ACEngineManager.localLoadPromise = new Promise<void>(async (resolve, reject) => {
                let config = await ACConfigManager.getConfigUnsupported();
                const response = await axios.get(`${config.rulePack}/ace-node.js`);
                const data = await response.data;
                let engineDir = path.join(path.resolve(config.cacheFolder), "engine");
                if (!fs.existsSync(engineDir)) {
                    fs.mkdirSync(engineDir, { recursive: true });
                }
                let nodePath = path.join(engineDir, "ace-node")
                fs.writeFile(nodePath + ".js", data, function (err) {
                    try {
                        err && console.log(err);
                        var ace_ibma = require(nodePath);
                        checker = new ace_ibma.Checker();
                    } catch (e) {
                        console.log(e);
                        return reject(e);
                    }
                    resolve();
                });
            });
        }
        return this.localLoadPromise;
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

    static getRules = async function() {
        if (!checker) {
            await ACEngineManager.loadEngineLocal();
        }
        let retVal = [];
        for (const ruleId in checker.engine.ruleMap) {
            retVal.push(checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }

    static getRulesSync = function() {
        if (!checker) return null;
        let retVal = [];
        for (const ruleId in checker.engine.ruleMap) {
            retVal.push(checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }
}