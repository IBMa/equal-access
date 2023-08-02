const ACConfigManager = require("./common/config/ACConfigManager").ACConfigManager;
const request = require("@cypress/request");

const ACEngineManager = {
    engineLoaded: false
    , loadOnce: null
    , customRulesets: []
    
    /**
     * This function loads the compliance engine.
     * @param {Function} callback - Provide callback function which will be executed once the engine is loaded
     *
     * @return N/A - This function will not return any thing, as it is full async
     */
    , loadEngine: (win, config) => {
        // We're running from a command
        if (ACEngineManager.myWindow || win) {
            ACEngineManager.myWindow = win.parent;
            if (!ACEngineManager.myWindow.ace) {
                return ACEngineManager.loadCypressEngine(config)
                    .then(() => {
                        ACEngineManager.ace = win.ace = ACEngineManager.myWindow.ace;
                        ACEngineManager.checker = new ACEngineManager.ace.Checker();
                    })
            } else {
                ACEngineManager.ace = win.ace = ACEngineManager.myWindow.ace;
            }
        } else {
            config = ACConfigManager.getConfigNow();
            // Running from a task
            // We aren't loading the engine in tasks outside of the cypress browser engine
            if (ACEngineManager.ace) {
                return Promise.resolve(ACEngineManager.ace);
            } else {
                return ACEngineManager.loadLocalEngine(config, (engine) => {
                    ACEngineManager.engineLoaded = true;
                    return engine;
                });
            }
        }
    }

    , loadLocalEngine: (config) => {
        return new Promise((resolve, reject) => {
            request.get(config.rulePack + "/ace-node.js", function (err, data) {
                const path = require("path");
                const fs = require("fs");
                err && console.error(err);
                if (!data) {
                    console.log("Cannot read: " + ACTasks.Config.rulePack + "/ace-node.js");
                }
                data = data.body;
                let engineDir = path.join(path.resolve(config.cacheFolder), "engine");
                if (!fs.existsSync(engineDir)) {
                    fs.mkdirSync(engineDir, { recursive: true });
                }
                const nodePath = path.join(engineDir, "ace-node")
                let engineFilename = nodePath+".js";
                // Only write the engine if it's different - can cause Cypress to trigger a file changed watch
                if (fs.existsSync(engineFilename)) {
                    if (fs.readFileSync(engineFilename).toString() === data) {
                        try {
                            err && console.log(err);
                            ACEngineManager.ace = require(nodePath);
                            ACEngineManager.checker = new ACEngineManager.ace.Checker();
                            return resolve(ACEngineManager.ace);
                        } catch (e) {
                            console.log(e);
                            return reject(e);
                        }
                    }
                }
                fs.writeFile(engineFilename, data, function (err) {
                    try {
                        err && console.log(err);
                        ACEngineManager.ace = require(nodePath);
                        ACEngineManager.checker = new ACEngineManager.ace.Checker();
                    } catch (e) {
                        console.log(e);
                        return reject(e);
                    }
                    resolve(ACEngineManager.ace);
                });
            });
        });
    }
    , loadCypressEngine: (config) => {
        if (ACEngineManager.ace) {
            return;
        }
        const myrequest = (url) => {
            return fetch(url).then(resp => resp.text());
        }
        return myrequest(config.rulePack + "/ace.js")
            .then((data) => {
                const script = ACEngineManager.myWindow.document.createElement("script");
                script.innerHTML = data;
                ACEngineManager.myWindow.document.documentElement.appendChild(script);
                ACEngineManager.ace = ACEngineManager.myWindow.ace;
            })
    }

    , addRuleset: (ruleset) => {
        ACEngineManager.customRulesets.push(ruleset);
    }

    , getRuleset: async (rsId) => {
        if (!ACEngineManager.checker) {
            await ACEngineManager.loadEngine();
        }
        return ACEngineManager.customRulesets.concat(ACEngineManager.checker.rulesets).filter((function (rs) { return rs.id === rsId }))[0];
    }

    , getRulesets: async () => {
        if (!ACEngineManager.checker) {
            await ACEngineManager.loadEngine();
        }
        return ACEngineManager.customRulesets.concat(ACEngineManager.checker.rulesets);
    }

    , getChecker: () => {
        return ACEngineManager.checker;
    }

    , getRules: async () => {
        if (!ACEngineManager.checker) {
            await ACEngineManager.loadEngine();
        }
        let retVal = [];
        for (const ruleId in ACEngineManager.checker.engine.ruleMap) {
            retVal.push(ACEngineManager.checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }

    , getRulesSync: () => {
        if (!ACEngineManager.checker) return null;
        let retVal = [];
        for (const ruleId in ACEngineManager.checker.engine.ruleMap) {
            retVal.push(ACEngineManager.checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }
}

module.exports = {
    ACEngineManager
}