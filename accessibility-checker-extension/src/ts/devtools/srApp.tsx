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
import * as React from 'react';

import { BrowserDetection } from '../util/browserDetection';
import {
    Theme,
    Column,
    Grid,
    Button,
    ButtonSet,
    Layer,
    Tile,
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    InlineNotification,
    // CodeSnippet,
    SkeletonText
} from "@carbon/react";
import { ArrowLeft, ArrowRight, PlayOutline, StopOutline, TableOfContents, Template, Link as LinkIcon, VolumeMute, VolumeUp, Renew, WatsonHealthMagnify, Reset, Keyboard, KeyboardOff } from '@carbon/icons-react';

import "../styles/index.scss";
import "./srApp.scss";
import { ePanel, getDevtoolsController } from './devtoolsController';
import { getDevtoolsAppController } from './devtoolsAppController';
import { getBGController } from '../background/backgroundController';
import { UnorderedList } from '@carbon/react';
import { ListItem } from '@carbon/react';
import { Accordion } from '@carbon/react';
import { AccordionItem } from '@carbon/react';
import { CheckboxGroup } from '@carbon/react';
import { Checkbox } from '@carbon/react';

// Define the navigation modes available
type NavigationMode = 'item' | 'tab_focus' | 'heading' | 'region' | "image";

// Define the navigation result structure
interface NavigationResult {
    success: boolean;
    renderingResult: {
        message: string;
        start?: any;
        end?: any;
    };
}

// Define the structure for the "Show All" table data
interface StructureItem {
    id: string;
    region: string;
    heading: string;
    item: string;
    tab_focus: string;
    image: string;
    selector: string;
}

interface SRAppProps {
    panel: ePanel;
}

const StructureModes : Array<{ label: string, mode: NavigationMode }> = [
    { label: "Region", mode: "region" },
    { label: "Heading", mode: "heading" },
    { label: "Item", mode: "item" },
    { label: "Tabbable", mode: "tab_focus" },
    { label: "Images", mode: "image" }
];

interface SRAppState {
    currentResult: Array<{action: string, value: string}>
    currentMode: NavigationMode;
    currentDirection: 'next' | 'previous' | 'focus';
    speechEnabled: boolean;
    isStreaming: boolean;
    structureData: StructureItem[];
    loading: boolean;
    lastAction: string;
    error: string | null;
    uiMode: "emulate" | "review";
    columnVisibility: { [key: string]: boolean };
    keyboardCaptureEnabled: boolean;
}

export class SRApp extends React.Component<SRAppProps, SRAppState> {
    private bgController = getBGController();
    private devtoolsAppController = getDevtoolsAppController();
    private devtoolsController = getDevtoolsController(this.devtoolsAppController.toolTabId);
    private keyboardHandler: null | ((e: KeyboardEvent) => void) = null;
    private streamingTimeout?: NodeJS.Timeout;
    private keyboardCaptureButtonRef = React.createRef<HTMLButtonElement>();


    // // Navigation modes configuration
    // private navigationModes: { mode: NavigationMode, label: string }[] = [
    //     { mode: "item", label: "Item" },
    //     { mode: "tab_focus", label: "Tabbable" },
    //     { mode: "heading", label: "Heading" },
    //     { mode: "region", label: "Region" }
    // ];

    constructor(props: SRAppProps) {
        super(props);
        this.state = {
            currentResult: [],
            currentMode: 'item',
            currentDirection: 'next',
            speechEnabled: false,
            isStreaming: false,
            structureData: [],
            loading: false,
            error: null,
            lastAction: "",
            uiMode: "review",
            columnVisibility: {
                region: true,
                heading: true,
                item: true,
                tab_focus: true
            },
            keyboardCaptureEnabled: false
        };
    }

    componentDidMount(): void {
        // Initialize connection to the content script
        this.setupContentScriptConnection();
        this.setupKeyboardHandlers();
        this.showAll();
        this.bgController.addSRLiveListener(this.devtoolsAppController.toolTabId, async (msg: string) => {
            let update: Array<{action: string, value: string}> = JSON.parse(JSON.stringify(this.state.currentResult));
            update.push({ action: "live region", value: msg });
            this.setState({
                currentResult: update
            });
        })
    }

    componentDidUpdate(_prevProps: Readonly<SRAppProps>, prevState: Readonly<SRAppState>, _snapshot?: any): void {
        if (prevState.currentResult.length !== this.state.currentResult.length) {
            setTimeout(() => {
                const renderContainer = document.querySelector(".sr-result-content");
                if (renderContainer) {
                    renderContainer.scrollTo({
                        top: renderContainer.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 0);
        }
    }

    componentWillUnmount(): void {
        // Clean up any listeners or connections
        this.stopSpeech();
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
    }
    
    // Set up communication with the content script
    private setupContentScriptConnection(): void {
    }

        /**
     * Set up keyboard event handlers for screen reader navigation
     */
    private setupKeyboardHandlers(): void {
        this.keyboardHandler = (e: KeyboardEvent) => {
            // F2 key toggles keyboard capture mode in emulate mode
            if (this.state.uiMode === "emulate" && e.key === 'F2') {
                e.preventDefault();
                e.stopPropagation();
                this.setState({ keyboardCaptureEnabled: !this.state.keyboardCaptureEnabled }, () => {
                    // Focus the keyboard capture button after toggling
                    if (this.keyboardCaptureButtonRef.current) {
                        this.keyboardCaptureButtonRef.current.focus();
                    }
                });
                return;
            }
            
            // Only handle keyboard events in emulate mode with capture enabled
            if (this.state.uiMode !== "emulate" || !this.state.keyboardCaptureEnabled) {
                return;
            }
            
            // // Don't capture keyboard events when focus is in form controls
            // const target = e.target as HTMLElement;
            // if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            //     return;
            // }
            
            // Handle keyboard shortcuts
            if (e.ctrlKey) {
                // Ctrl key stops speech
                this.stopSpeech();
                return;
            }
            if (e.altKey || e.metaKey) return;
            // console.log(e.key);
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.activatePointOfRegard();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigatePrevious('item');
                    break;
                case ' ':
                    e.preventDefault();
                    this.setState({ isStreaming: true });
                    this.navigateNext('item');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateNext('item');
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

    // Navigate to the next element using the specified mode
    private async navigateNext(mode: NavigationMode) {
        this.setState({
            uiMode: "emulate",
            loading: true,
            currentMode: mode,
            currentDirection: 'next'
        });
        const result : NavigationResult = (await this.bgController.jumpNext(this.devtoolsAppController.toolTabId, mode)) as NavigationResult;
        
        let update: Array<{action: string, value: string}> = JSON.parse(JSON.stringify(this.state.currentResult));
        let action = "";
        if (!this.state.isStreaming) {
            action = `next ${mode}`;
        }
        update.push({ action, value: result.renderingResult.message });
        this.setState({
            currentResult: update,
            loading: false
        });
        
        if (result.success) {
            if (this.state.speechEnabled) {
                this.speakResult(result);
            } else if (this.state.isStreaming) {
                this.streamingTimeout = setTimeout(() => this.navigateNext('item'), 500);
            }
        }
    }

    private async activatePointOfRegard() {
        const result : NavigationResult = (await this.bgController.activatePointOfRegard(this.devtoolsAppController.toolTabId)) as NavigationResult;
        let update: Array<{action: string, value: string}> = JSON.parse(JSON.stringify(this.state.currentResult));
        let action = "activate";
        update.push({ action, value: result.renderingResult.message });

        this.setState({
            currentResult: update,
            loading: false
        });
        
        if (this.state.speechEnabled) {
            this.speakResult(result);
        }
    }

    // Navigate to the previous element using the specified mode
    private async navigatePrevious(mode: NavigationMode) {
        this.setState({
            uiMode: "emulate",
            loading: true,
            currentMode: mode,
            currentDirection: 'previous'
        });

        const result : NavigationResult = (await this.bgController.jumpPrevious(this.devtoolsAppController.toolTabId, mode)) as NavigationResult;
        let update: Array<{action: string, value: string}> = JSON.parse(JSON.stringify(this.state.currentResult));
        let action = "";
        if (!this.state.isStreaming) {
            action = `previous ${mode}`;
        }
        update.push({ action, value: result.renderingResult.message });

        this.setState({
            currentResult: update,
            loading: false
        });
        
        if (this.state.speechEnabled) {
            this.speakResult(result);
        }
    }

    // Toggle column visibility in the structure table
    private toggleColumnVisibility(column: NavigationMode): void {
        this.setState(prevState => ({
            columnVisibility: {
                ...prevState.columnVisibility,
                [column]: !prevState.columnVisibility[column]
            }
        }));
    }

    // Show all navigable elements in a structured table
    private async showAll() {
        this.setState({
            uiMode: "review",
            loading: true
        });
        const engineResult = ((await this.bgController.renderStructure(this.devtoolsAppController.toolTabId)) as any[]);
        const results: StructureItem[] = engineResult.map((item, idx) => ({ id: idx, ...item }));
            
        this.setState({
            structureData: results,
            loading: false
        });
    }

    // Toggle speech synthesis on/off
    private toggleSpeech(): void {
        this.setState(prevState => ({
            speechEnabled: !prevState.speechEnabled
        }));
    }

    // Speak the navigation result using speech synthesis
    private speakResult(result: NavigationResult): void {
        if (!this.state.speechEnabled || !result.success) return;
        
        // Simulate speech synthesis
        const utterance = new SpeechSynthesisUtterance(result.renderingResult.message);
        utterance.rate = 1.5;
        
        // If streaming is enabled, continue to the next item when speech ends
        if (this.state.isStreaming) {
            utterance.onend = () => {
                this.navigateNext('item');
            };
        }
        
        // Cancel any current speech and speak the new text
        window.speechSynthesis?.cancel();
        window.speechSynthesis?.speak(utterance);
    }

    // Stop speech output
    private stopSpeech(): void {
        clearTimeout(this.streamingTimeout);
        this.setState({ isStreaming: false });
        window.speechSynthesis?.cancel();
    }

    // Start continuous reading
    private startStreaming(): void {
        this.setState({
            currentResult: [],
            isStreaming: true
        }, () => {
            this.navigateNext('item');
        });
    }

    // Display version information
    displayVersion() {
        let manifest = chrome.runtime.getManifest();
        let extVersion = manifest.version;
        if (extVersion.endsWith(".9999")) {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1");
        } else {
            return extVersion.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1-rc.$2");
        }
    }

    // Render the navigation controls
    private renderEmulationControls() {
        const buttonSpace = ".7rem";
        return (
            <div className="sr-navigation-row">
                <div>
                    <Button
                        ref={this.keyboardCaptureButtonRef}
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription={this.state.keyboardCaptureEnabled ? "Disable keyboard capture (F2)" : "Enable keyboard capture (F2)"}
                        renderIcon={this.state.keyboardCaptureEnabled ? Keyboard : KeyboardOff}
                        kind={this.state.keyboardCaptureEnabled ? "secondary" : "tertiary"}
                        size="sm"
                        onClick={() => this.setState({ keyboardCaptureEnabled: !this.state.keyboardCaptureEnabled })}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Start reading (Spacebar)"
                        renderIcon={PlayOutline}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.startStreaming()}
                        disabled={this.state.loading || this.state.isStreaming}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Stop reading (Ctrl)"
                        renderIcon={StopOutline}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.stopSpeech()}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Clear results"
                        renderIcon={Reset}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.setState({currentResult: []})}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Previous Region (Shift+R)"
                        renderIcon={Template}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigatePrevious("region")}
                        // disabled={this.state.loading}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Next Region (R)"
                        renderIcon={Template}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigateNext("region")}
                        // disabled={this.state.loading}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Previous Heading (Shift+H)"
                        renderIcon={TableOfContents}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigatePrevious("heading")}
                        // disabled={this.state.loading}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Next Heading (H)"
                        renderIcon={TableOfContents}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigateNext("heading")}
                        // disabled={this.state.loading}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Previous Item (LeftArrow)"
                        renderIcon={ArrowLeft}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigatePrevious("item")}
                        // disabled={this.state.loading}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Next Item (RightArrow)"
                        renderIcon={ArrowRight}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigateNext("item")}
                        // disabled={this.state.loading}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Previous Tabbable (Shift+Tab)"
                        renderIcon={LinkIcon}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigatePrevious("tab_focus")}
                        // disabled={this.state.loading}
                    />
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Next Tabbable (Tab)"
                        renderIcon={LinkIcon}
                        kind="tertiary"
                        size="sm"
                        onClick={() => this.navigateNext("tab_focus")}
                        // disabled={this.state.loading}
                    />
                    <span style={{display: "inline-block", minWidth: buttonSpace}}> </span>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription={this.state.speechEnabled ? "Disable speech": "Enable speech"}
                        renderIcon={this.state.speechEnabled ? VolumeUp : VolumeMute }
                        kind={this.state.speechEnabled ? "secondary" : "tertiary"}
                        size="sm"
                        onClick={() => this.toggleSpeech()}
                    />
                </div>
            </div>
        );
    }


    // Render the navigation controls
    private renderStructureControls() {
        return (
            <div className="sr-navigation-row">
                <div>
                    <Button
                        hasIconOnly
                        tooltipAlignment="start"
                        iconDescription="Refresh"
                        renderIcon={Renew}
                        kind="primary"
                        size="sm"
                        onClick={() => this.showAll()}
                        // disabled={this.state.loading}
                    />
                </div>
            </div>
        );
    }

    // Render the results display
    private renderResultsDisplay() {
        if (this.state.error) {
            return (
                <div>
                    <InlineNotification
                        kind="error"
                        title="Error"
                        subtitle={this.state.error}
                        hideCloseButton
                    />
                </div>
            );
        }

        if (this.state.uiMode === "review") {
            if (this.state.loading) {
                return (
                    <div>
                        <h2>Results</h2>
                        <SkeletonText paragraph width="100%" lineCount={3} />
                    </div>
                );
            }
            return (
                <div>
                    <h2>Page Structure</h2>
                    
                    <div className="sr-table-controls">
                        <div className="sr-column-toggles">
                            <CheckboxGroup legendText="Show columns">
                                {StructureModes.map((column) => (
                                    <Checkbox
                                        key={column.mode}
                                        id={`toggle-${column.mode}`}
                                        labelText={column.label}
                                        checked={this.state.columnVisibility[column.mode]}
                                        onChange={() => this.toggleColumnVisibility(column.mode)}
                                        size="sm"
                                    />
                                ))}
                            </CheckboxGroup>
                        </div>
                    </div>
                    <DataTable
                        rows={this.state.structureData}
                        headers={StructureModes.map(structureMode => ({
                            key: structureMode.mode,
                            header: structureMode.label
                        })).filter(header => this.state.columnVisibility[header.key as NavigationMode])}
                    >
                        {({
                            rows,
                            headers,
                            getHeaderProps,
                            getTableProps
                        }: {
                            rows: Array<any>;
                            headers: Array<{header: string; key: string}>;
                            getHeaderProps: (props: {header: any}) => any;
                            getTableProps: () => any;
                        }) => (
                            <Table {...getTableProps()}>
                                <TableHead>
                                    <TableRow>
                                        {headers.map((header: {header: string; key: string}) => (
                                            <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                                {header.header}
                                            </TableHeader>
                                        ))}
                                        <TableHeader>
                                            Inspect
                                        </TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows
                                        .filter((row: {id: string; cells: Array<{id: string; value: any}>}) => (
                                            row.cells.some(cell => {
                                                const [_num, headerId] = cell.id.split(":");
                                                return (this.state.columnVisibility as any)[headerId] && (cell.value as string).length > 0;
                                            })
                                        ))
                                        .map((row: {id: string; cells: Array<{id: string; value: any}>}) => (
                                        <TableRow key={row.id}>
                                            {row.cells.map((cell: {id: string; value: any}) => (
                                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                            ))}
                                            <TableCell>
                                                {this.state.structureData[parseInt(row.id)].selector && <Button
                                                    hasIconOnly
                                                    tooltipAlignment="end"
                                                    iconDescription="Inspect element"
                                                    renderIcon={ WatsonHealthMagnify }
                                                    kind="tertiary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const structureData = this.state.structureData[parseInt(row.id)];
                                                        this.devtoolsController.inspectSelector(structureData.selector)
                                                    }}
                                                />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </DataTable>
                </div>
            );
        }

        return (
            <div>
                <h2>Screen Reader Output</h2>
                {this.state.keyboardCaptureEnabled && (
                    <div
                        role="status"
                        aria-live="polite"
                        style={{
                            padding: "0.5rem 1rem",
                            marginBottom: "1rem",
                            backgroundColor: "var(--cds-layer-accent)",
                            border: "1px solid var(--cds-border-strong)",
                            borderRadius: "4px"
                        }}
                    >
                        <strong>Keyboard capture active.</strong> Press F2 to disable and return to normal navigation.
                    </div>
                )}
                <div>
                    Last action: {this.state.currentDirection} {this.state.currentMode}
                </div>
                {(this.state.currentResult && this.state.currentResult.length > 0) ? (
                    <div className="sr-result-content">
                        <Layer withBackground level={1} style={{ backgroundColor: "var(--cds-layer)", padding: "1rem" }}>
                            <table role="presentation">
                                {this.state.currentResult.map(line => <tr><td style={{paddingRight: ".5rem", textAlign: "right", minWidth: "10rem"}}>{"{ "+line.action+" }"}</td><td>{line.value}</td></tr>)}
                            </table>
                        </Layer>
                        {/* <div className="sr-result-debug">
                            <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Information}
                                onClick={() => console.log("Debug info", this.state.currentResult)}
                            >
                                Debug
                            </Button>
                        </div> */}
                    </div>
                ) : (
                    <p className="sr-no-result">
                        Use the navigation controls above to simulate screen reader navigation.
                    </p>
                )}
            </div>
        );
    }

    // // Render keyboard shortcuts help
    // private renderKeyboardShortcuts() {
    //     return (
    //         <Tile className="sr-keyboard-shortcuts-tile">
    //             <h3>Keyboard Shortcuts</h3>
    //             <div className="sr-shortcuts-grid">
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">↑</span>
    //                     <span>Previous item</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">↓</span>
    //                     <span>Next item</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">H</span>
    //                     <span>Next heading</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Shift+H</span>
    //                     <span>Previous heading</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">R</span>
    //                     <span>Next region</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Shift+R</span>
    //                     <span>Previous region</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Tab</span>
    //                     <span>Next tabbable</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Shift+Tab</span>
    //                     <span>Previous tabbable</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Space</span>
    //                     <span>Start continuous reading</span>
    //                 </div>
    //                 <div className="sr-shortcut">
    //                     <span className="sr-key">Ctrl</span>
    //                     <span>Stop speech</span>
    //                 </div>
    //             </div>
    //         </Tile>
    //     );
    // }

    render() {
        const warnNotice = <>
            <InlineNotification 
                kind="info" lowContrast hideCloseButton 
                title="Experimental"
                subtitle="This feature is experimental. Results are in early development stages. No assessment of compliance should be made based on these results."
            />
            <Accordion align="start">
                <AccordionItem title="Known Issues/TODOs">
                    <UnorderedList>
                        <ListItem>Focus sync</ListItem>
                        <ListItem>Emulate: Show point-of-regard on the website</ListItem>
                        <ListItem>Emulate: General keyboard interactions</ListItem>
                        <ListItem>Emulate: Something odd with previous not providing expected results</ListItem>
                        <ListItem>Review: Seems to get stuck sometimes - hard to determine long processing vs stuck</ListItem>
                        <ListItem>Review: Auto-update Review panel due to DOM/page changes?</ListItem>
                    </UnorderedList>
                </AccordionItem>
            </Accordion>
        </>;
        return (
            <Theme theme={BrowserDetection.isDarkMode()?"g100":"white"} style={{padding: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%"}}>
                <Grid fullWidth={true} narrow={true} className="srGrid" style={{padding: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%"}}>
                    <Column className="srColumn" sm={4} md={8} lg={16} style={{margin: "0rem", minHeight: "100%", maxHeight: "100%", height: "100%" }}>
                        <div className="sr-simulator-container" style={{ width: "calc(100% - 1rem)", minHeight: "100%", maxHeight: "100%", height: "100%" }}>
                            {warnNotice}
                            <Tile className="sr-results-tile">
                                <div role="group" aria-label="Screen reader mode selection">
                                    <ButtonSet>
                                        <Button
                                            kind={this.state.uiMode === "review" ? "primary" : "secondary"}
                                            aria-pressed={this.state.uiMode === "review"}
                                            onClick={() => {
                                                this.setState({ uiMode: "review", currentResult: [] });
                                                this.showAll();
                                                this.bgController.resetSRController(this.devtoolsAppController.toolTabId);
                                            }}
                                        >
                                            Review
                                        </Button>
                                        <Button
                                            kind={this.state.uiMode === "emulate" ? "primary" : "secondary"}
                                            aria-pressed={this.state.uiMode === "emulate"}
                                            onClick={() => {
                                                this.setState({ uiMode: "emulate", currentResult: [] });
                                                this.bgController.resetSRController(this.devtoolsAppController.toolTabId);
                                            }}
                                        >
                                            Emulate
                                        </Button>
                                    </ButtonSet>
                                </div>
                                <div style={{ marginTop: "1rem "}} />
                                {this.state.uiMode === "review" && this.renderStructureControls()}
                                {this.state.uiMode === "emulate" && this.renderEmulationControls()}
                                {this.renderResultsDisplay()}
                            </Tile>
                            {/* {this.renderKeyboardShortcuts()} */}
                        </div>
                    </Column>
                </Grid>
            </Theme>
        );
    }
}
