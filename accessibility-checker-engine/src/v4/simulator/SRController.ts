
import { SRWalker } from "./SRWalker";
import { SRRenderer } from "./SRRenderer";
import { NavigationMode, NavigationResult } from "./SRTypes";
import { SRNavigator } from "./SRNavigator";

/**
 * SRController class for managing screen reader simulation
 * Maintains a point of regard and provides navigation functions
 */
export class SRController {
    /** The current point of regard */
    private pointOfRegard: SRWalker;
    
    /**
     * Creates a new SRController
     * @param rootElement The root element to start from (defaults to document.body)
     */
    constructor(rootElement: Node = document.body) {
        this.setPointOfRegard(rootElement);
    }
    
    /**
     * Get the current point of regard
     * @returns The current SRWalker representing the point of regard
     */
    public getPointOfRegard(): SRWalker {
        return this.pointOfRegard;
    }
    
    /**
     * Set the point of regard to a specific DOM node
     * @param node The node to set as the point of regard
     * @returns NavigationResult indicating success or failure
     */
    public setPointOfRegard(node: Node): NavigationResult {
        try {
            this.pointOfRegard = new SRWalker(node);
            
            // Update container state
            const containerChanges = SRController.diffContainers("focus", this.pointOfRegard);
            
            const role = this.pointOfRegard.getRole();
            const name = this.pointOfRegard.getName()?.name;
            
            return {
                success: true,
                message: SRRenderer.renderCurrent("focus", this.pointOfRegard, containerChanges),
                role,
                name
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to set point of regard: ${error.message}`
            };
        }
    }
    
    /**
     * Jump to the next element by the specified mode
     * @param mode The navigation mode to use
     * @returns NavigationResult indicating success or failure
     */
    public jumpNext(mode: NavigationMode): NavigationResult {
        const oldPointOfRegard = this.pointOfRegard.clone();
        
        try {
            let bContinue = true;
            let nextJump = this.pointOfRegard.clone();
            while (bContinue && nextJump) {
                nextJump = SRNavigator.jumpNext(mode, nextJump);
                if (nextJump) {
                    let message = SRRenderer.renderCurrent(mode, nextJump, {entering: [], leaving: []});
                    bContinue = message.trim().length === 0;
                }
            }
            if (!nextJump) {
                // Restore the original point of regard
                this.pointOfRegard = oldPointOfRegard;
                return {
                    success: false,
                    message: `No next ${mode}`
                };
            } else {
                this.pointOfRegard = nextJump;
                const role = this.pointOfRegard.getRole();
                const name = this.pointOfRegard.getName()?.name;
                
                // Check for container changes
                const containerChanges = SRController.diffContainers(mode, this.pointOfRegard, oldPointOfRegard);
                let message = SRRenderer.renderCurrent(mode, this.pointOfRegard, containerChanges);
                return {
                    success: true,
                    message,
                    role,
                    name
                };
            }
        } catch (error) {
            // Restore the original point of regard
            this.pointOfRegard = oldPointOfRegard;
            return {
                success: false,
                message: `Navigation error: ${error.message}`
            };
        }
    }
    
    /**
     * Jump to the previous element by the specified mode
     * @param mode The navigation mode to use
     * @returns NavigationResult indicating success or failure
     */
    // public jumpPrevious(mode: NavigationMode): NavigationResult {
    //     const oldPointOfRegard = this.pointOfRegard.clone();
    //     const oldNode = this.pointOfRegard.getNode();
        
    //     try {
    //         const success = SRNavigator.jumpPrevious(this.pointOfRegard, mode);
            
    //         if (!success) {
    //             // Restore the original point of regard
    //             this.pointOfRegard = oldPointOfRegard;
    //             return {
    //                 success: false,
    //                 message: `No previous ${mode}`
    //             };
    //         } else {
    //             const newNode = this.pointOfRegard.getNode();
    //             const role = this.pointOfRegard.getRole();
    //             const name = this.pointOfRegard.getName()?.name;
                
    //             // Check for container changes
    //             const containerChanges = this.updateContainerState(newNode, oldNode);
                
    //             return {
    //                 success: true,
    //                 message: this.renderCurrent(mode, this.pointOfRegard, containerChanges),
    //                 role,
    //                 name
    //             };
    //         }
    //     } catch (error) {
    //         // Restore the original point of regard
    //         this.pointOfRegard = oldPointOfRegard;
    //         return {
    //             success: false,
    //             message: `Navigation error: ${error.message}`
    //         };
    //     }
    // }
    
    /**
     * Determine the different in containers between the two nodes
     * @param newWalker The new node we're navigating to
     * @param oldWalker The previous node we were at
     * @returns Array of container change messages
     */
    public static diffContainers(mode: NavigationMode | "focus", newWalker: SRWalker, oldWalker?: SRWalker): { leaving: string[], entering: string[] } {
        const DEBUG = false; //(newWalker && newWalker.getNode().nodeName === "MARK") || (oldWalker && oldWalker.getNode().nodeName === "MARK");
        DEBUG && console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
        DEBUG && console.log("A)", oldWalker.getNode().nodeName, newWalker.getNode().nodeName);
        let leaving: string[] = [];
        let entering: string[] = [];
        try {
            let walkNew = newWalker.clone();
            let walkOld = oldWalker ? oldWalker.clone() : (new SRWalker(newWalker.getNode().ownerDocument.body || newWalker.getNode().ownerDocument.documentElement));
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

    private static commonParent(walkerOne: SRWalker, walkerTwo: SRWalker): SRWalker {
        if (walkerOne.contains(walkerTwo)) {
            return walkerOne.clone();
        } else if (walkerTwo.contains(walkerOne)) {
            return walkerTwo.clone(); 
        } else {
            let commonParent: SRWalker = walkerOne.clone();
            while (!commonParent.contains(walkerTwo) && commonParent.parent());
            if (!commonParent.contains(walkerOne) || !commonParent.contains(walkerTwo)) {
                return null;
            } 
            return commonParent;
        }
    }

    public static renderAll(mode: NavigationMode): string[] {
        let ctrl = new SRController(document.body);
        let results: string[] = [];
        let bContinue = true;
        while (bContinue) {
            let nextVal = ctrl.jumpNext(mode);
            if (nextVal.success) {
                results.push(nextVal.message);
            } else {
                bContinue = false;
            }
        }
        return results;
    }
}