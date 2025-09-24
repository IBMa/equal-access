
import { SRCursor } from "./SRCursor";
import { SRRenderer } from "./SRRenderer";
import { NavigationMode, NavigationResult, RenderResult } from "./SRTypes";
import { SRNavigator } from "./SRNavigator";
import { CacheUtil } from "../util/CacheUtil";
import { VisUtil } from "../util/VisUtil";
import { SRUtil } from "./SRUtil";

/**
 * SRController class for managing screen reader simulation
 * Maintains a point of regard and provides navigation functions
 */
export class SRController {
    /** The current point of regard */
    private pointOfRegard: SRCursor;
    private mutationObserver: MutationObserver;
    
    /**
     * Creates a new SRController
     * @param rootElement The root element to start from (defaults to document.body)
     */
    constructor(private rootElement: Node = document.body) {
        this.setPointOfRegard(rootElement);
        this.setupMutationTracking();
        console.info(`[WARNING] The SRController is a new feature that is not yet "stable". What this means:
* API subject to change, even between minor versions of the checker
* Results should be considered experimental. There are a variety of known issues, but making this available for early experimentation / feedback.`);
    }

    public disconnect() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
    
    /**
     * Set up mutation tracking
     * 
     * In the event that the point of regard is removed from the DOM, we need to get up to the nearest parent that's not being removed
     */
    private setupMutationTracking(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        const myThis = this;
        const observer = new MutationObserver((mutations) => {
            let porNode = myThis.pointOfRegard.getNode();
            for (const removalMutation of mutations.filter(mutation => mutation.removedNodes?.length > 0)) {
                removalMutation.removedNodes.forEach((removedNode) => {
                    if (removedNode.isSameNode(porNode) || removedNode.contains(porNode)) {
                        console.info("Adjusting PoR due to DOM mutation removing PoR", removalMutation.target, removedNode, porNode)
                        porNode = removalMutation.target;
                    }                    
                })
            };
            this.setPointOfRegard(porNode);
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Get the current point of regard
     * @returns The current SRCursor representing the point of regard
     */
    public getPointOfRegard(): SRCursor {
        return this.pointOfRegard;
    }
    
    /**
     * Set the point of regard to a specific DOM node
     * @param node The node to set as the point of regard
     * @returns NavigationResult indicating success or failure
     */
    public setPointOfRegard(node: Node): NavigationResult {
        const DEBUG = false;
        DEBUG && console.group("setPointOfRegard");
        try {
            this.pointOfRegard = new SRCursor(node);
            
            // Update container state
            const containerChanges = SRController.diffContainers("focus", this.pointOfRegard);
            
            const role = this.pointOfRegard.getRole();
            const name = this.pointOfRegard.getNameInfo()?.name;
            
            return {
                success: true,
                renderingResult: SRRenderer.renderCurrent("focus", this.pointOfRegard, containerChanges),
                role,
                name
            };
        } catch (error) {
            return {
                success: false,
                renderingResult: {
                    start: this.pointOfRegard.clone(),
                    end: this.pointOfRegard.clone(),
                    message: `Failed to set point of regard: ${error.message}`
                }
            };
        } finally {
            DEBUG && console.groupEnd();
        }
    }
    
    /**
     * Jump to the next element by the specified mode
     * @param mode The navigation mode to use
     * @returns NavigationResult indicating success or failure
     */
    public jumpNext(mode: NavigationMode): NavigationResult {
        CacheUtil.clearCaches(document.documentElement);
        const oldPointOfRegard = this.pointOfRegard.clone();
        const DEBUG = false;
        DEBUG && console.group("jumpNext");
        try {
            let bContinue = true;
            let nextJump = this.pointOfRegard.clone();
            let renderingResult;
            while (bContinue && nextJump) {
                const lastJump = nextJump.clone();
                nextJump = SRNavigator.jumpNext(mode, nextJump);
                const containerChanges = SRController.diffContainers(mode, nextJump, lastJump);
                if (nextJump) {
                    renderingResult = SRRenderer.renderCurrent(mode, nextJump, containerChanges);
                    // Keep going if the landing point is empty, unless it's certain nav modes (e.g., region)
                    bContinue = renderingResult.message.trim().length === 0 && !["region"].includes(mode);
                }
            }
            if (!nextJump) {
                // Restore the original point of regard
                this.pointOfRegard = oldPointOfRegard;
                let currentResult = SRRenderer.renderCurrent(mode, oldPointOfRegard, { leaving: [], entering: []});
                return {
                    success: false,
                    renderingResult: {
                        start: oldPointOfRegard.clone(),
                        end: oldPointOfRegard.clone(),
                        message: `No next ${mode}. ${currentResult?.message || ""}`
                    }
                };
            } else {
                this.pointOfRegard = nextJump;
                const role = this.pointOfRegard.getRole();
                const name = this.pointOfRegard.getNameInfo()?.name;
                
                // Check for container changes
                DEBUG && console.log("New POR:", this.pointOfRegard.getNode(), renderingResult);
                return {
                    success: true,
                    renderingResult,
                    role,
                    name
                };
            }
        } catch (error) {
            console.error(error);
            // Restore the original point of regard
            this.pointOfRegard = oldPointOfRegard;
            return {
                success: false,
                renderingResult: {
                    start: oldPointOfRegard.clone(),
                    end: oldPointOfRegard.clone(),
                    message: `Navigation error: ${error.message}`
                }
            };
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Jump to the previous element by the specified mode
     * @param mode The navigation mode to use
     * @returns NavigationResult indicating success or failure
     */
    public jumpPrevious(mode: NavigationMode): NavigationResult {
        CacheUtil.clearCaches(document.documentElement);
        const oldPointOfRegard = this.pointOfRegard.clone();
        
        try {
            let bContinue = true;
            let prevJump = this.pointOfRegard.clone();
            let renderingResult;
            while (bContinue && prevJump) {
                const lastJump = prevJump.clone();
                prevJump = SRNavigator.jumpPrevious(mode, prevJump);
                const containerChanges = SRController.diffContainers(mode, prevJump, lastJump);
                if (prevJump) {
                    renderingResult = SRRenderer.renderCurrent(mode, prevJump, containerChanges);
                    // Keep going if the landing point is empty, unless it's certain nav modes (e.g., region)
                    bContinue = renderingResult.message.trim().length === 0 && !["region"].includes(mode);
                }
            }
            
            if (!prevJump) {
                // Restore the original point of regard
                this.pointOfRegard = oldPointOfRegard;
                let currentResult = SRRenderer.renderCurrent(mode, oldPointOfRegard, { leaving: [], entering: []});
                return {
                    success: false,
                    renderingResult: {
                        start: oldPointOfRegard.clone(),
                        end: oldPointOfRegard.clone(),
                        message: `No previous ${mode}. ${currentResult?.message || ""}`
                    }
                };
            } else {
                this.pointOfRegard = prevJump;
                const role = this.pointOfRegard.getRole();
                const name = this.pointOfRegard.getNameInfo()?.name;
                
                // // Check for container changes
                // const containerChanges = SRController.diffContainers(mode, this.pointOfRegard, oldPointOfRegard);
                // let s = SRRenderer.renderEnter(mode, this.pointOfRegard);
                // if (containerChanges.entering[containerChanges.entering.length-1] !== s) {
                //     containerChanges.entering.push(s);
                // }
                return {
                    success: true,
                    renderingResult,
                    role,
                    name
                };
            }
        } catch (error) {
            console.error(error);
            // Restore the original point of regard
            this.pointOfRegard = oldPointOfRegard;
            return {
                success: false,
                renderingResult: {
                    start: oldPointOfRegard.clone(),
                    end: oldPointOfRegard.clone(),
                    message: `Navigation error: ${error.message}`
                }
            };
        }
    }
    
    /**
     * Determine the different in containers between the two nodes
     * @param newWalker The new node we're navigating to
     * @param oldWalker The previous node we were at
     * @returns Array of container change messages
     */
    public static diffContainers(mode: NavigationMode | "focus", newWalker: SRCursor, oldWalker?: SRCursor): { leaving: string[], entering: string[] } {
        const DEBUG = false;
        DEBUG && console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
        DEBUG && console.log("A)", oldWalker.getNode().nodeName, newWalker.getNode().nodeName);
        let leaving: string[] = [];
        let entering: string[] = [];
        try {
            const docRoot = newWalker ? 
                (newWalker.getNode().ownerDocument.body || newWalker.getNode().ownerDocument.documentElement) :
                oldWalker ?
                    (oldWalker.getNode().ownerDocument.body || oldWalker.getNode().ownerDocument.documentElement) :
                    document.body || document.documentElement;

            let walkNew = newWalker ? newWalker.clone() : (new SRCursor(docRoot));
            let walkOld = oldWalker ? oldWalker.clone() : (new SRCursor(docRoot));
            if (!walkNew.getNode().isSameNode(walkOld.getNode())) {
                let commonParent = SRController.commonParent(walkNew, walkOld);
                if (commonParent) {
                    DEBUG && console.log("B)", commonParent.getNode().nodeName);
                    while (commonParent.contains(walkNew)) {
                        DEBUG && console.log("Entering:", walkNew.getNode().nodeName);
                        entering.push(SRRenderer.renderEnter(mode, walkNew, walkOld));
                        walkNew.parent();
                    }
                    entering.reverse();
                    entering = entering.filter(s => s && s.trim().length > 0).map(s => s.trim());;

                    while (commonParent.contains(walkOld)) {
                        DEBUG && console.log("Leaving:", walkNew.getNode().nodeName);
                        leaving.push(SRRenderer.renderLeave(mode, walkOld, walkOld));
                        walkOld.parent();
                    }
                    leaving = leaving.filter(s => s && s.trim().length > 0).map(s => s.trim());
                }
            }
        } catch (err) {
            console.error(err);
        }
        DEBUG && console.log(leaving, entering);

        return {
            leaving,
            entering
        };
    }

    private static commonParent(walkerOne: SRCursor, walkerTwo: SRCursor): SRCursor {
        if (walkerOne.contains(walkerTwo)) {
            return walkerOne.clone();
        } else if (walkerTwo.contains(walkerOne)) {
            return walkerTwo.clone(); 
        } else {
            let commonParent: SRCursor = walkerOne.clone();
            while (!commonParent.contains(walkerTwo) && commonParent.parent());
            if (!commonParent.contains(walkerOne) || !commonParent.contains(walkerTwo)) {
                return null;
            } 
            return commonParent;
        }
    }

    public static renderAll(mode: NavigationMode): string[] {
        let ctrl = new SRController(document.body);
        let dialogs = document.body.querySelectorAll("dialog,[role='dialog']");
        dialogs.forEach(dialog => {
            if (SRUtil.isModalDialogElement(dialog)) {
                ctrl.setPointOfRegard(dialog);
            }
        })
        let results: string[] = [];
        // Handle the initial item first (if there is one)
        let starterMsg = SRRenderer.renderCurrent(mode, ctrl.getPointOfRegard(), {entering: [], leaving: []});
        if (starterMsg) {
            results.push(starterMsg.message);
        }

        let bContinue = true;
        while (bContinue) {
            let nextVal = ctrl.jumpNext(mode);
            if (nextVal.success) {
                results.push(nextVal.renderingResult.message);
            } else {
                bContinue = false;
            }
        }
        return results;
    }

    public static renderAllDetail(mode: NavigationMode): RenderResult[] {
        let ctrl = new SRController(document.body);
        let dialogs = document.body.querySelectorAll("dialog,[role='dialog']");
        dialogs.forEach(dialog => {
            if (SRUtil.isModalDialogElement(dialog)) {
                ctrl.setPointOfRegard(dialog);
            }
        })
        let results: RenderResult[] = [];
        // Handle the initial item first (if there is one)
        let starterMsg = SRRenderer.renderCurrent(mode, ctrl.getPointOfRegard(), {entering: [], leaving: []});
        if (starterMsg) {
            results.push(starterMsg);
        }

        let bContinue = true;
        while (bContinue) {
            let nextVal = ctrl.jumpNext(mode);
            if (nextVal.success) {
                // mode === "item" && console.log(nextVal);
                results.push(nextVal.renderingResult);
            } else {
                bContinue = false;
            }
        }
        return results;
    }

    public static renderStructure(): Array<{region: string, heading: string, item: string, tab_focus: string }> {
        let headings = SRController.renderAllDetail("heading");
        let regions = SRController.renderAllDetail("region");
        let items = SRController.renderAllDetail("item");
        let tabbable = SRController.renderAllDetail("tab_focus");
        let retVal: Array<{region: string, heading: string, item: string, tab_focus:  string}> = [];
        while (regions.length > 0 || headings.length > 0 || items.length > 0 || tabbable.length > 0) {
            // console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
            // Determine which of the modes has the earliest cursor
            let next = regions[0]?.start;
            if (headings.length > 0) {
                if (!next || SRCursor.compare(headings[0].start, next) < 0) {
                    next = headings[0].start;
                }
            }
            if (items.length > 0) {
                if (!next || SRCursor.compare(items[0].start, next) < 0) {
                    next = items[0].start;
                }
            }
            if (tabbable.length > 0) {
                if (!next || SRCursor.compare(tabbable[0].start, next) < 0) {
                    next = tabbable[0].start;
                }
            }
            // console.log(next);
            let nextItem = { region: "", heading: "", item: "", tab_focus: "" };
            if (regions.length > 0 && SRCursor.compare(regions[0].start, next) === 0) {
                nextItem.region = regions.shift().message;
            }
            if (headings.length > 0 && SRCursor.compare(headings[0].start, next) === 0) {
                nextItem.heading = headings.shift().message;
            }
            if (items.length > 0 && SRCursor.compare(items[0].start, next) === 0) {
                nextItem.item = items.shift().message;
            }
            if (tabbable.length > 0 && SRCursor.compare(tabbable[0].start, next) === 0) {
                nextItem.tab_focus = tabbable.shift().message;
            }
            retVal.push(nextItem);
        }
        return retVal;
    }
}