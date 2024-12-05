   /******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

import * as aChecker from "../../../src/mjs/index.js";
import { expect } from "chai";
    
// Check all aspects of the IBMa namespace to make sure that all things are defined.
// Need to do this check, to make sure the engine is loaded into the browser correctly by the karma plugin.
describe("Check IBMa namespace", function () {
    it("IBMa Should be defined", function() {
        expect(typeof IBMa).not.toBe("undefined");
    });

    it("IBMa.validate Should be defined", function() {
        expect(typeof IBMa.validate).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.ARIA namespace to make sure that all things are defined.
describe("Check IBMa.ARIA namespace", function () {
    it("IBMa.ARIA Should be defined", function() {
        expect(typeof IBMa.ARIA).not.toBe("undefined");
    });

    it("IBMa.ARIA.elemToRole Should be defined", function() {
        expect(typeof IBMa.ARIA.elemToRole).not.toBe("undefined");
    });

    it("IBMa.ARIA.elemToRoleMap Should be defined", function() {
        expect(typeof IBMa.ARIA.elemToRoleMap).not.toBe("undefined");
    });

    it("IBMa.ARIA.hasParentRole Should be defined", function() {
        expect(typeof IBMa.ARIA.hasParentRole).not.toBe("undefined");
    });

    it("IBMa.ARIA.inputToRole Should be defined", function() {
        expect(typeof IBMa.ARIA.inputToRole).not.toBe("undefined");
    });

    it("IBMa.ARIA.inputToRoleMap Should be defined", function() {
        expect(typeof IBMa.ARIA.inputToRoleMap).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.Config namespace to make sure that all things are defined.
describe("Check IBMa.Config namespace", function () {
    it("IBMa.Config Should be defined", function() {
        expect(typeof IBMa.Config).not.toBe("undefined");
    });

    it("IBMa.Config.DEBUG Should be defined", function() {
        expect(typeof IBMa.Config.DEBUG).not.toBe("undefined");
    });

    it("IBMa.Config.ITER_COUNT Should be defined", function() {
        expect(typeof IBMa.Config.ITER_COUNT).not.toBe("undefined");
    });

    it("IBMa.Config.addMetadata Should be defined", function() {
        expect(typeof IBMa.Config.addMetadata).not.toBe("undefined");
    });

    it("IBMa.Config.addNLS Should be defined", function() {
        expect(typeof IBMa.Config.addNLS).not.toBe("undefined");
    });

    it("IBMa.Config.addRule Should be defined", function() {
        expect(typeof IBMa.Config.addRule).not.toBe("undefined");
    });

    it("IBMa.Config.addRules Should be defined", function() {
        expect(typeof IBMa.Config.addRules).not.toBe("undefined");
    });

    it("IBMa.Config.addRuleset Should be defined", function() {
        expect(typeof IBMa.Config.addRuleset).not.toBe("undefined");
    });

    it("IBMa.Config.clearRules Should be defined", function() {
        expect(typeof IBMa.Config.clearRules).not.toBe("undefined");
    });

    it("IBMa.Config.getAllRulesets Should be defined", function() {
        expect(typeof IBMa.Config.getAllRulesets).not.toBe("undefined");
    });

    it("IBMa.Config.getContexts Should be defined", function() {
        expect(typeof IBMa.Config.getContexts).not.toBe("undefined");
    });

    it("IBMa.Config.getContextsRole Should be defined", function() {
        expect(typeof IBMa.Config.getContextsRole).not.toBe("undefined");
    });

    it("IBMa.Config.getMatchingRules Should be defined", function() {
        expect(typeof IBMa.Config.getMatchingRules).not.toBe("undefined");
    });

    it("IBMa.Config.getMetadataForRule Should be defined", function() {
        expect(typeof IBMa.Config.getMetadataForRule).not.toBe("undefined");
    });

    it("IBMa.Config.getNLS Should be defined", function() {
        expect(typeof IBMa.Config.getNLS).not.toBe("undefined");
    });

    it("IBMa.Config.getNLSMap Should be defined", function() {
        expect(typeof IBMa.Config.getNLSMap).not.toBe("undefined");
    });

    it("IBMa.Config.getPageLocale Should be defined", function() {
        expect(typeof IBMa.Config.getPageLocale).not.toBe("undefined");
    });

    it("IBMa.Config.getRulesetById Should be defined", function() {
        expect(typeof IBMa.Config.getRulesetById).not.toBe("undefined");
    });

    it("IBMa.Config.includeBounds Should be defined", function() {
        expect(typeof IBMa.Config.includeBounds).not.toBe("undefined");
    });

    it("IBMa.Config.includeNodes Should be defined", function() {
        expect(typeof IBMa.Config.includeNodes).not.toBe("undefined");
    });

    it("IBMa.Config.includePassed Should be defined", function() {
        expect(typeof IBMa.Config.includePassed).not.toBe("undefined");
    });

    it("IBMa.Config.includeVisibility Should be defined", function() {
        expect(typeof IBMa.Config.includeVisibility).not.toBe("undefined");
    });

    it("IBMa.Config.loaded Should be defined", function() {
        expect(typeof IBMa.Config.loaded).not.toBe("undefined");
    });

    it("IBMa.Config.locale Should be defined", function() {
        expect(typeof IBMa.Config.locale).not.toBe("undefined");
    });

    it("IBMa.Config.metadata Should be defined", function() {
        expect(typeof IBMa.Config.metadata).not.toBe("undefined");
    });

    it("IBMa.Config.metadataId Should be defined", function() {
        expect(typeof IBMa.Config.metadataId).not.toBe("undefined");
    });

    it("IBMa.Config.nls Should be defined", function() {
        expect(typeof IBMa.Config.nls).not.toBe("undefined");
    });

    it("IBMa.Config.populateResult Should be defined", function() {
        expect(typeof IBMa.Config.populateResult).not.toBe("undefined");
    });

    it("IBMa.Config.populateResults Should be defined", function() {
        expect(typeof IBMa.Config.populateResults).not.toBe("undefined");
    });

    it("IBMa.Config.rs Should be defined", function() {
        expect(typeof IBMa.Config.rs).not.toBe("undefined");
    });

    it("IBMa.Config.rsMap Should be defined", function() {
        expect(typeof IBMa.Config.rsMap).not.toBe("undefined");
    });

    it("IBMa.Config.rules Should be defined", function() {
        expect(typeof IBMa.Config.rules).not.toBe("undefined");
    });

    it("IBMa.Config.rulesById Should be defined", function() {
        expect(typeof IBMa.Config.rulesById).not.toBe("undefined");
    });

    it("IBMa.Config.rulesRole Should be defined", function() {
        expect(typeof IBMa.Config.rulesRole).not.toBe("undefined");
    });

    it("IBMa.Config.setLocale Should be defined", function() {
        expect(typeof IBMa.Config.setLocale).not.toBe("undefined");
    });

    it("IBMa.Config.setTimeout Should be defined", function() {
        expect(typeof IBMa.Config.setTimeout).not.toBe("undefined");
    });

    it("IBMa.Config.sevMap Should be defined", function() {
        expect(typeof IBMa.Config.sevMap).not.toBe("undefined");
    });

    it("IBMa.Config.sevMap2 Should be defined", function() {
        expect(typeof IBMa.Config.sevMap2).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.Context namespace to make sure that all things are defined.
describe("Check IBMa.Context namespace", function () {
    it("IBMa.Context Should be defined", function() {
        expect(typeof IBMa.Context).not.toBe("undefined");
    });

    it("IBMa.Context.prototype Should be defined", function() {
        expect(typeof IBMa.Context.prototype).not.toBe("undefined");
    });

    it("IBMa.Context.prototype.attrsMatch Should be defined", function() {
        expect(typeof IBMa.Context.prototype.attrsMatch).not.toBe("undefined");
    });

    it("IBMa.Context.prototype.getElement Should be defined", function() {
        expect(typeof IBMa.Context.prototype.getElement).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.Dom namespace to make sure that all things are defined.
describe("Check IBMa.Dom namespace", function () {
    it("IBMa.Dom Should be defined", function() {
        expect(typeof IBMa.Dom).not.toBe("undefined");
    });

    it("IBMa.Dom.NodeWalker Should be defined", function() {
        expect(typeof IBMa.Dom.NodeWalker).not.toBe("undefined");
    });

    it("IBMa.Dom.NodeWalker.prototype Should be defined", function() {
        expect(typeof IBMa.Dom.NodeWalker.prototype).not.toBe("undefined");
    });

    it("IBMa.Dom.NodeWalker.prototype.nextNode Should be defined", function() {
        expect(typeof IBMa.Dom.NodeWalker.prototype.nextNode).not.toBe("undefined");
    });

    it("IBMa.Dom.NodeWalker.prototype.prevNode Should be defined", function() {
        expect(typeof IBMa.Dom.NodeWalker.prototype.prevNode).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.Error namespace to make sure that all things are defined.
describe("Check IBMa.Error namespace", function () {
    it("IBMa.Error Should be defined", function() {
        expect(typeof IBMa.Error).not.toBe("undefined");
    });

    it("IBMa.Error.log Should be defined", function() {
        expect(typeof IBMa.Error.log).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.GSALoader namespace to make sure that all things are defined.
describe("Check IBMa.GSALoader namespace", function () {
   it("IBMa.GSALoader Should be defined", function() {
        expect(typeof IBMa.GSALoader).not.toBe("undefined");
    });

    it("IBMa.GSALoader.ROOTURL Should be defined", function() {
        expect(typeof IBMa.GSALoader.ROOTURL).not.toBe("undefined");
    });

    it("IBMa.GSALoader.addServers Should be defined", function() {
        expect(typeof IBMa.GSALoader.addServers).not.toBe("undefined");
    });

    it("IBMa.GSALoader.init Should be defined", function() {
        expect(typeof IBMa.GSALoader.init).not.toBe("undefined");
    });

    it("IBMa.GSALoader.initCBs Should be defined", function() {
        expect(typeof IBMa.GSALoader.initCBs).not.toBe("undefined");
    });

    it("IBMa.GSALoader.initStarted Should be defined", function() {
        expect(typeof IBMa.GSALoader.initStarted).not.toBe("undefined");
    });

    it("IBMa.GSALoader.loadJSON Should be defined", function() {
        expect(typeof IBMa.GSALoader.loadJSON).not.toBe("undefined");
    });

    it("IBMa.GSALoader.loadRules Should be defined", function() {
        expect(typeof IBMa.GSALoader.loadRules).not.toBe("undefined");
    });

    it("IBMa.GSALoader.loadScript Should be defined", function() {
        expect(typeof IBMa.GSALoader.loadScript).not.toBe("undefined");
    });

    it("IBMa.GSALoader.loading Should be defined", function() {
        expect(typeof IBMa.GSALoader.loading).not.toBe("undefined");
    });

    it("IBMa.GSALoader.onLoaded Should be defined", function() {
        expect(typeof IBMa.GSALoader.onLoaded).not.toBe("undefined");
    });
});

// Check all aspects of the IBMa.Scan namespace to make sure that all things are defined.
describe("Check IBMa.Scan namespace", function () {
    it("IBMa.Scan Should be defined", function() {
        expect(typeof IBMa.Scan).not.toBe("undefined");
    });

    it("IBMa.Scan.checkIter Should be defined", function() {
        expect(typeof IBMa.Scan.checkIter).not.toBe("undefined");
    });

    it("IBMa.Scan.cleanIter Should be defined", function() {
        expect(typeof IBMa.Scan.cleanIter).not.toBe("undefined");
    });

    it("IBMa.Scan.evalRule Should be defined", function() {
        expect(typeof IBMa.Scan.evalRule).not.toBe("undefined");
    });

    it("IBMa.Scan.isNodeVisible Should be defined", function() {
        expect(typeof IBMa.Scan.isNodeVisible).not.toBe("undefined");
    });

    it("IBMa.Scan.reportDocument Should be defined", function() {
        expect(typeof IBMa.Scan.reportDocument).not.toBe("undefined");
    });

    it("IBMa.Scan.scanDocument Should be defined", function() {
        expect(typeof IBMa.Scan.scanDocument).not.toBe("undefined");
    });

    it("IBMa.Scan.setRulesets Should be defined", function() {
        expect(typeof IBMa.Scan.setRulesets).not.toBe("undefined");
    });

    it("IBMa.Scan.stripFirebug Should be defined", function() {
        expect(typeof IBMa.Scan.stripFirebug).not.toBe("undefined");
    });
});
