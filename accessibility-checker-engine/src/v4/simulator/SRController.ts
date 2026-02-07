
import { SRCursor } from "./SRCursor";
import { SRRenderer } from "./SRRenderer";
import { NavigationMode, NavigationResult, RenderResult } from "./SRTypes";
import { SRNavigator } from "./SRNavigator";
import { CacheUtil } from "../util/CacheUtil";
import { SRUtil } from "./SRUtil";
import { VisUtil } from "../util/VisUtil";

/**
 * SRController class for managing screen reader simulation
 * Maintains a point of regard and provides navigation functions
 */
export class SRController {
    public static singleton;
    public static getController() {
        if (!this.singleton) {
            this.singleton = new SRController();
        }
        return this.singleton;
    }

    /** The current point of regard */
    private pointOfRegard: SRCursor;
    private mutationObserver: MutationObserver;
    private liveListeners: Array<(result: string) => Promise<void>> = [];
    
    /**
     * Creates a new SRController
     * @param rootElement The root element to start from (defaults to document.body)
     */
    private constructor(private rootElement: Node = document.body) {
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
    
    private findAllShadowRoots(root: Document | DocumentFragment | Node = document): Node[] {
        const shadowRoots: Node[] = [];

        // Get all elements in the current root
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT,
            null
        );

        let node: Node | null;
        while (node = walker.nextNode()) {
            const element = node as Element;

            // Check if this element has an open shadow root
            if (element.shadowRoot) {
                shadowRoots.push(element.shadowRoot);

                // Recursively search inside this shadow root
                const nestedShadowRoots = this.findAllShadowRoots(element.shadowRoot);
                shadowRoots.push(...nestedShadowRoots);
            }
        }

        return shadowRoots;
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
            
            for (const mutation of mutations) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(addedNode => {
                        // Add observation of new shadow roots
                        let allRoots = this.findAllShadowRoots(addedNode);
                        for (const root of allRoots) {
                            observer.observe(root, {
                                childList: true,
                                subtree: true,
                                characterData: true
                            });
                        }
                    });
                }

                const node = mutation.target;
                const elem = node.nodeType === 1 ? node as HTMLElement : node.parentElement;
                if (elem 
                    && !elem.closest(`[aria-busy="true"]`)
                    && elem.getAttribute("aria-busy") !== "true"
                ) {
                    // Identify the live region container
                    const liveRegionElem = 
                        // The element itself is a live region container
                        ((
                            ["polite", "assertive"].includes(elem.getAttribute("aria-live"))
                                || elem.nodeName.toUpperCase() === "OUTPUT"
                                || ["status", "log", "progressbar", "alert", "timer"].includes(elem.getAttribute("role"))
                        ) && elem) 
                        // Or get the nearest ancestor
                        || elem.closest(`[aria-live="polite"],[aria-live="assertive"],output,[role="status"],[role="log"],[role="progressbar"],[role="alert"],[role="timer"]`);

                    let isMutationRelevant = false;
                    let relevance = ["additions", "text"];
                    if (liveRegionElem) {
                        // Determine what kinds of changes are 'relevant'
                        const relevantElem = elem.closest("[aria-relevant]");
                        if (relevantElem) {
                            relevance = relevantElem.getAttribute("aria-relevant").split(/ +/g);
                        }

                        if (liveRegionElem.getAttribute("role") === "log") {
                            relevance = ["additions"];
                        }
                        if (liveRegionElem.hasAttribute("aria-relevant")) {
                            relevance = liveRegionElem.getAttribute("aria-relevant").split(/ +/g);
                        }
                        if (relevance.includes("all")) {
                            relevance = ["additions", "removals", "text"];
                        }
                        isMutationRelevant = (mutation.target.nodeType === 3 && relevance.includes("text"))
                            || (mutation.addedNodes.length > 0 && relevance.includes("additions"))
                            || (mutation.removedNodes.length > 0 && relevance.includes("removals"));
                    }
                    

                    if (liveRegionElem && isMutationRelevant) {
                        const isAtomic = liveRegionElem.getAttribute("aria-atomic") === "true" || ["alert", "status", "timer", "marquee"].includes(liveRegionElem.getAttribute("role"));
                        // Read the whole region if atomic
                        if (!isAtomic && mutation.type === "characterData" && mutation.target.nodeType === 3 && !VisUtil.isNodeHiddenFromAT(mutation.target.parentElement)) {
                            for (const liveListener of this.liveListeners) {
                                liveListener(mutation.target.nodeValue);
                            }
                        } else {
                            let liveTarget = isAtomic ? liveRegionElem : mutation.target;
                            if ((liveTarget as any).liveAnnounce) {
                                clearTimeout((liveTarget as any).liveAnnounce);
                            }
                            (liveTarget as any).liveAnnounce = setTimeout(() => {
                                let results = [];
                                let isRemoval = (relevance.includes("removals") && mutation.removedNodes.length > 0);
                                if (isAtomic || isRemoval) {
                                    let liveCursor = new SRCursor(liveTarget, false);
                                    let liveCursorEnd = new SRCursor(liveTarget, true);
                                    liveCursorEnd.next(() => true);
                                    results.push((isRemoval?"[removed] ":"")+SRRenderer.renderRange("item", liveCursor, liveCursorEnd));
                                } else if (relevance.includes("additions") && mutation.addedNodes.length > 0) {
                                    mutation.addedNodes.forEach(addedNode => {
                                        // Just render the additions
                                        let liveCursor = new SRCursor(addedNode, false);
                                        let liveCursorEnd = new SRCursor(addedNode, true);
                                        liveCursorEnd.next(() => true);
                                        results.push(SRRenderer.renderRange("item", liveCursor, liveCursorEnd));
                                    });
                                }
                                for (const liveListener of this.liveListeners) {
                                    liveListener(results.join("\n"));
                                }
                            }, 100);
                        }
                    }
                }
            }
        });

        // Need to observe all of the shadow roots
        let allRoots = this.findAllShadowRoots(document.documentElement);
        allRoots.push(document.documentElement);
        for (const root of allRoots) {
            observer.observe(root, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    public addLiveListener(listener: (result: string) => Promise<void>) {
        this.liveListeners.push(listener);
    }

    public removeLiveListener(removeListener: (result: string) => Promise<void>) {
        this.liveListeners = this.liveListeners.filter(listener => listener !== removeListener);
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
        let ctrl = SRController.getController();
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
        let ctrl = SRController.getController();
        ctrl.setPointOfRegard(document.body);
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

    public static renderStructure(): Array<{ [key: string]: string }> {
        const modes: NavigationMode[] = [ "region", "heading", "item", "tab_focus", "image" ];
        let details = modes.map(modeLabel => SRController.renderAllDetail(modeLabel));
        let retVal: Array<{ [key: string]: string }> = [];
        while (details.some(detail => detail.length > 0)) {
            let next = details[0][0]?.start;
            modes.forEach((mode, idx) => {
                if (details[idx].length > 0) {
                    if (!next || SRCursor.compare(details[idx][0].start, next) < 0) {
                        next = details[idx][0].start;
                    }
                }
            });

            let nextItem: { [key: string]: string } = {};
            modes.forEach((mode, idx) => {
                nextItem[mode] = "";
                if (details[idx].length > 0 && SRCursor.compare(details[idx][0].start, next) === 0) {
                    nextItem[mode] = details[idx].shift().message;
                }
            });

            const elem = next.getElement();
            const selector = elem && SRUtil.getUniqueSelector(elem);
            if (selector && document.querySelector(selector)) {
                nextItem.selector = selector;
            }
            retVal.push(nextItem);
        }
        return retVal;
    }
}