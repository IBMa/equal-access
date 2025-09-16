import { SRController } from "./SRController";
import { NavigationMode, NavigationResult } from "./SRTypes";

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
    constructor(private navigateNext: (mode: NavigationMode) => void, private navigatePrevious: (mode: NavigationMode) => void) {
        this.createOverlay();
    }

    /**
     * Creates the overlay UI elements and adds them to the DOM
     */
    private createOverlay(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'ibma-sr-overlay';
        this.container.style.position = 'fixed';
        this.container.style.bottom = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.color = 'white';
        this.container.style.padding = '10px';
        this.container.style.zIndex = '10000';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.gap = '10px';

        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexWrap = 'wrap';
        controlsContainer.style.gap = '10px';

        // Create navigation mode groups
        this.navigationModes.forEach(navMode => {
            const modeGroup = document.createElement('div');
            modeGroup.style.display = 'flex';
            modeGroup.style.alignItems = 'center';
            modeGroup.style.gap = '5px';
            modeGroup.style.margin = '0 10px';

            const modeLabel = document.createElement('span');
            modeLabel.textContent = navMode.label + ':';
            modeGroup.appendChild(modeLabel);

            // Previous button
            const prevButton = document.createElement('button');
            prevButton.textContent = '◀ Prev';
            prevButton.style.padding = '5px 10px';
            prevButton.style.backgroundColor = '#444';
            prevButton.style.color = 'white';
            prevButton.style.border = 'none';
            prevButton.style.borderRadius = '3px';
            prevButton.style.cursor = 'pointer';
            prevButton.addEventListener('click', () => this.navigatePrevious(navMode.mode));
            modeGroup.appendChild(prevButton);

            // Next button
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next ▶';
            nextButton.style.padding = '5px 10px';
            nextButton.style.backgroundColor = '#444';
            nextButton.style.color = 'white';
            nextButton.style.border = 'none';
            nextButton.style.borderRadius = '3px';
            nextButton.style.cursor = 'pointer';
            nextButton.addEventListener('click', () => this.navigateNext(navMode.mode));
            modeGroup.appendChild(nextButton);

            controlsContainer.appendChild(modeGroup);
        });

        // Create results display
        this.resultsDisplay = document.createElement('div');
        this.resultsDisplay.style.padding = '10px';
        this.resultsDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        this.resultsDisplay.style.borderRadius = '3px';
        this.resultsDisplay.style.minHeight = '50px';
        this.resultsDisplay.style.fontFamily = 'monospace';
        this.resultsDisplay.textContent = 'Screen reader simulation results will appear here.';

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
            displayText = `${direction.toUpperCase()} ${mode}: ${result.renderingResult.message}`;
        } else {
            displayText = `${direction.toUpperCase()} ${mode}: ${result.renderingResult.message}`;
        }
        result.renderingResult.end.getElement()?.scrollIntoView();
        result.renderingResult.start.getElement()?.scrollIntoView();
        window.scrollBy(0, -200);
        
        this.resultsDisplay.textContent = displayText;
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
    /** Keyboard event handler */
    private keyboardHandler: (e: KeyboardEvent) => void;
    /** Focus event handler */
    private focusHandler: (e: FocusEvent) => void;

    /**
     * Creates a new SRViewer
     * @param rootElement The root element to start from (defaults to document.body)
     */
    constructor(rootElement: Node = document.body) {
        // Create controller for the document body
        this.controller = new SRController(rootElement);
        
        // Create overlay UI
        let myThis = this;
        this.overlay = new SROverlay(
            (mode: NavigationMode) => {
                myThis.navigateNext(mode);
            },
            (mode: NavigationMode) => {
                myThis.navigatePrevious(mode);
            }
        );
        
        // Set up keyboard handlers
        this.setupKeyboardHandlers();
        
        // Set up focus tracking
        this.setupFocusTracking();
    }

    /**
     * Navigate to the next element using the specified mode
     * @param mode The navigation mode to use
     */
    public navigateNext(mode: NavigationMode): void {
        const result = this.controller.jumpNext(mode);
        this.overlay.displayResult(result, mode, 'next');
        this.speakResult(result);
    }

    /**
     * Navigate to the previous element using the specified mode
     * @param mode The navigation mode to use
     */
    public navigatePrevious(mode: NavigationMode): void {
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
     * Set up focus tracking to update the point of regard when focus changes
     */
    private setupFocusTracking(): void {
        this.focusHandler = (e: FocusEvent) => {
            // Skip if the focus is on the overlay itself
            if (e.target instanceof HTMLElement) {
                const target = e.target as HTMLElement;
                if (this.overlay && target.closest('.sr-overlay')) {
                    return;
                }
                console.log("Setting focus");
                
                // Update the point of regard to the newly focused element
                const result = this.controller.setPointOfRegard(target);
                
                // Announce the focus change
                if (result.success) {
                    this.overlay.displayResult(result, 'focus', 'focus');
                    this.speakResult(result);
                }
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

// Made with Bob
