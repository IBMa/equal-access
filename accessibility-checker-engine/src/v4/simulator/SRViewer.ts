import { SRController } from "./SRController";
import { NavigationMode, NavigationResult } from "./SRTypes";

function createDOMElement(elemName: string, attrs: { [attr: string]: string}, styles: Partial<CSSStyleDeclaration>) {
    let retVal = document.createElement(elemName);
    if (attrs) {
        for (const key in attrs) {
            retVal[key] = attrs[key];
        }
    }
    if (styles) {
        for (const key in styles) {
            retVal.style[key] = styles[key];
        }
    }
    return retVal;
}

/**
 * SROverlay class for creating a UI widget to control screen reader simulation
 * Provides buttons for navigation and displays results
 */
export class SROverlay {
    /** The container element for the overlay */
    private container: HTMLElement;
    /** The results display element */
    private resultsDisplay: HTMLElement;
    /** Navigation modes available in the UI */
    private navigationModes: { mode: NavigationMode, label: string }[] = [
        { mode: "item", label: "Item" },
        { mode: "tab_focus", label: "Tabbable" },
        { mode: "heading", label: "Heading" },
        { mode: "region", label: "Region" }
    ];

    /**
     * Creates a new SROverlay
     * @param controller The SRController instance to use for navigation
     */
    constructor(private srViewer: SRViewer) {
        this.createOverlay();
    }

    /**
     * Creates the overlay UI elements and adds them to the DOM
     */
    private createOverlay(): void {
        // Create main container
        this.container = createDOMElement("div", {
            className: "ibma-sr-overlay"
        }, {
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            zIndex: '10000',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });

        // Create controls container
        const controlsContainer = createDOMElement("div", {}, { 
            display: "flex", flexWrap: "wrap", gap: "10px"});

        // Create navigation mode groups
        this.navigationModes.forEach(navMode => {
            const modeGroup = createDOMElement('div', {}, {
                display: "flex",
                alignItems: 'center',
                gap: '5px',
                margin: '0 10px'
            });

            modeGroup.appendChild(createDOMElement('span', {
                textContent: navMode.label + ":"
            }, {}));

            // Previous button
            const prevButton = createDOMElement('button', {
                textContent: '◀ Prev'
            }, {
                padding: '5px 10px',
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
            });
            prevButton.addEventListener('click', () => this.srViewer.navigatePrevious(navMode.mode));
            modeGroup.appendChild(prevButton);

            // Next button
            const nextButton = createDOMElement('button', {
                textContent: 'Next ▶'
            }, {
                padding: '5px 10px',
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
            });
            nextButton.addEventListener('click', () => this.srViewer.navigateNext(navMode.mode));
            modeGroup.appendChild(nextButton);

            controlsContainer.appendChild(modeGroup);
        });
        let otherButtonGroup = createDOMElement('div', {}, {
            display: "flex",
            alignItems: 'center',
            gap: '5px',
            margin: '0 10px'
        })
        // Show all button
        const showAllButton = createDOMElement('button', {
            textContent: 'Show all'
        }, {
            padding: '5px 10px',
            backgroundColor: '#444',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
        });
        showAllButton.addEventListener('click', () => this.srViewer.showAll(true));
        otherButtonGroup.appendChild(showAllButton);

        // Toggle Speech Button
        const toggleSpeech = createDOMElement('button', {
            textContent: 'Toggle speech'
        }, {
            padding: '5px 10px',
            backgroundColor: '#444',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
        });
        toggleSpeech.addEventListener('click', () => this.srViewer.toggleSpeech());
        otherButtonGroup.appendChild(toggleSpeech);
        controlsContainer.appendChild(otherButtonGroup);


        // Create results display
        this.resultsDisplay = createDOMElement('div', {
            textContent: 'Screen reader simulation results will appear here.'
        }, {
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            minHeight: '100px',
            maxHeight: '50vh',
            fontFamily: 'monospace',
            overflow: 'auto'
        });

        // Add elements to container
        this.container.appendChild(controlsContainer);
        this.container.appendChild(this.resultsDisplay);

        // Add to document
        document.body.appendChild(this.container);
    }

    /**
     * Display the navigation result in the overlay
     * @param result The navigation result
     * @param mode The navigation mode used
     * @param direction The navigation direction ('next', 'previous', or 'focus')
     */
    public displayResult(result: NavigationResult, mode: NavigationMode, direction: 'next' | 'previous' | 'focus'): void {
        let displayText = '';
        
        if (result.success) {
            // console.log("???", result);
            displayText = `${direction.toUpperCase()} ${mode}: ${result.renderingResult.message}`;
        } else {
            displayText = `${direction.toUpperCase()} ${mode}: ${result.renderingResult.message}`;
        }
        result.renderingResult.end?.getElement()?.scrollIntoView();
        result.renderingResult.start?.getElement()?.scrollIntoView();
        window.scrollBy(0, -200);
        
        this.resultsDisplay.innerHTML = "";
        this.resultsDisplay.textContent = displayText;
        let inspectButton = createDOMElement("button", {
            innerText: "Debug"
        }, {
        });
        inspectButton.addEventListener("click", () => {
            console.log(result.renderingResult.start?.getNode(), result.renderingResult.end?.getNode());
        })
        this.resultsDisplay.appendChild(inspectButton)
    }

    public displayAll(result: Array<{ [key: string]: string }>): void {
        const table = createDOMElement("table", {}, {});
        const headerRow = createDOMElement("tr", {}, {});
        const headingLabels = ["Region", "Heading", "Item", "Tabbable"];
        const headingFields = ["region", "heading", "item", "tab_focus"];
        for (const headingLabel of headingLabels) {
            headerRow.appendChild(createDOMElement("th", {
                scope: "col",
                innerText: headingLabel
            }, {
                textAlign: "left",
                padding: ".25rem",
                margin: "0rem",
                color: "white"
            }));
            table.appendChild(headerRow);
        }

        for (const line of result) {
            const dataRow = createDOMElement("tr", {}, {});
            headingFields.forEach((field) => {
                dataRow.appendChild(createDOMElement("td", {
                    innerText: line[field]
                }, {
                    verticalAlign: "top",
                    border: "solid white 1px",
                    padding: ".25rem",
                    margin: "0rem",
                    color: "white"
                }));
            })
            table.appendChild(dataRow);
        }
        this.resultsDisplay.innerHTML = "";
        this.resultsDisplay.appendChild(table);
    }

    /**
     * Remove the overlay from the DOM
     */
    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

/**
 * SRViewer class for managing screen reader simulation with UI controls
 */
export class SRViewer {
    /** The controller instance */
    private controller: SRController;
    /** The overlay UI instance */
    private overlay: SROverlay;
    /** Flag to track if speech is active */
    private isStreaming: boolean = false;
    /** Flag to set if showing all */
    private isShowingAll: boolean = false;
    /** Flag to set if it should be speaking */
    private speechEnabled: boolean = false;
    /** Keyboard event handler */
    private keyboardHandler: (e: KeyboardEvent) => void;
    /** Focus event handler */
    private focusHandler: (e: FocusEvent) => void;

    /**
     * Creates a new SRViewer
     * @param rootElement The root element to start from (defaults to document.body)
     */
    constructor(_rootElement: Node = document.body) {
        // Create controller for the document body
        this.controller = SRController.getController();
        
        // Create overlay UI
        this.overlay = new SROverlay(this);
        
        // Set up keyboard handlers
        this.setupKeyboardHandlers();
        
        // Set up focus tracking
        this.setupFocusTracking();

        // Set up mutation tracking
        this.setupMutationTracking();
    }

    public showAll(bEnableAllMode?: boolean): void {
        if (bEnableAllMode) {
            this.isShowingAll = true;
        }
        const result = SRController.renderStructure();
        this.overlay.displayAll(result);
    }

    public toggleSpeech() {
        this.speechEnabled = !this.speechEnabled;
    }

    /**
     * Navigate to the next element using the specified mode
     * @param mode The navigation mode to use
     */
    public navigateNext(mode: NavigationMode): void {
        this.isShowingAll = false;
        const result = this.controller.jumpNext(mode);
        this.overlay.displayResult(result, mode, 'next');
        this.speakResult(result);
    }

    /**
     * Navigate to the previous element using the specified mode
     * @param mode The navigation mode to use
     */
    public navigatePrevious(mode: NavigationMode): void {
        this.isShowingAll = false;
        const result = this.controller.jumpPrevious(mode);
        this.overlay.displayResult(result, mode, 'previous');
        this.speakResult(result);
    }

    /**
     * Set up keyboard event handlers for screen reader navigation
     */
    private setupKeyboardHandlers(): void {
        this.keyboardHandler = (e: KeyboardEvent) => {
            // Don't capture keyboard events when focus is in form controls
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                return;
            }
            
            // Handle keyboard shortcuts
            if (e.ctrlKey) {
                // Ctrl key stops speech
                this.stopSpeech();
                return;
            }
            if (e.altKey || e.metaKey) return;
            // console.log(e.key);
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigatePrevious('item');
                    break;
                case ' ':
                    this.isStreaming = true;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateNext('item');
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.activateCurrentElement();
                    this.controller.setPointOfRegard(document.activeElement);
                    break;
                case 'H':
                case 'h':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.navigatePrevious('heading');
                    } else {
                        e.preventDefault();
                        this.navigateNext('heading');
                    }
                    break;
                case 'R':
                case 'r':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.navigatePrevious('region');
                    } else {
                        e.preventDefault();
                        this.navigateNext('region');
                    }
                    break;
                case 'Tab':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.navigatePrevious('tab_focus');
                    } else {
                        e.preventDefault();
                        this.navigateNext('tab_focus');
                    }
                    break;
            }
        };
        
        // Add the event listener
        document.addEventListener('keydown', this.keyboardHandler);
    }

    private speakResult(result): void {
        if (!this.speechEnabled) return;
        const utterance = new SpeechSynthesisUtterance(result.renderingResult.message);
        utterance.rate = 1.5;
        let myThis = this;
        utterance.addEventListener("end", (event) => {
            if (myThis.isStreaming) {
                this.navigateNext('item');
            }
        });
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
    
    /**
     * Stop speech output
     */
    private stopSpeech(): void {
        this.isStreaming = false;
        // Cancel any active speech synthesis
        speechSynthesis.cancel();
    }
    
    /**
     * Set up mutation tracking
     */
    private setupMutationTracking(): void {
        const observer = new MutationObserver((mutations) => {
            // console.log(this.isShowingAll, mutations.length);
            if (this.isShowingAll) {
                const outsideOverlay = mutations.filter(mutation => mutation.target.nodeType === 1 
                    && !(mutation.target as HTMLElement).closest(".ibma-sr-overlay"))
                if (outsideOverlay.length > 0) {
                    // console.log("Mutations",outsideOverlay);
                    observer.disconnect();
                    let myThis = this;
                    myThis.showAll();
                    setTimeout(() => {
                        myThis.showAll();
                        observer.observe(document.documentElement, {
                            attributes: true,
                            childList: true,
                            subtree: true
                        });

                    }, 1000);
                }
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    /**
     * Set up focus tracking to update the point of regard when focus changes
     */
    private setupFocusTracking(): void {
        this.focusHandler = (e: FocusEvent) => {
            // Skip if the focus is on the overlay itself
            if (e.target instanceof HTMLElement) {
                const target = e.target as HTMLElement;
                if (this.overlay && target.closest('.ibma-sr-overlay')) {
                    return;
                }
                console.group("focusHandler");
                // Update the point of regard to the newly focused element
                const result = this.controller.setPointOfRegard(target);
                
                // Announce the focus change
                if (result.success) {
                    this.overlay.displayResult(result, 'focus', 'focus');
                    this.speakResult(result);
                }
                console.groupEnd();
            }
        };
        
        // Add the focus event listener to the document
        document.addEventListener('focusin', this.focusHandler);
    }
    
    /**
     * Activate (click) the element at the current point of regard
     */
    private activateCurrentElement(): void {
        const currentElement = this.controller.getPointOfRegard().getElement();
        
        if (currentElement) {
            // Announce that we're activating the element
            const result = {
                success: true,
                renderingResult: {
                    message: `Activating: ${currentElement.textContent || currentElement.nodeName}`,
                    start: this.controller.getPointOfRegard(),
                    end: this.controller.getPointOfRegard()
                }
            };
            this.overlay.displayResult(result, 'focus', 'focus');
            this.speakResult(result);
            
            // Focus the element first
            if (currentElement.focus) {
                currentElement.focus();
            }
            
            // Simulate a click on the element
            currentElement.click();
        }
    }

    /**
     * Get the controller instance
     * @returns The SRController instance
     */
    public getController(): SRController {
        return this.controller;
    }

    /**
     * Destroy the viewer and clean up resources
     */
    public destroy(): void {
        // Remove event listeners
        document.removeEventListener('keydown', this.keyboardHandler);
        document.removeEventListener('focusin', this.focusHandler);
        
        // Stop any active speech
        this.stopSpeech();
        
        // Destroy overlay
        this.overlay.destroy();
    }
}