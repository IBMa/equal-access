import TabMessaging from "../util/tabMessaging";

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    injectCSS(
        `
        .line {
                stroke-width: 1px;
                stroke: black;
            }
        .lineError {
                stroke-width: 1px;
                stroke: red;
        }
        .lineEmboss {
            stroke-width: 1px;
            stroke: white;
        }
        .lineEmbossError {
            stroke-width: 1px;
            stroke: white;
        }
        .lineTop {
            stroke-width: 1px;
            stroke: black;
        }
        .lineBottom {
            stroke-width: 1px;
            stroke: black;
        }
        .lineLeft {
            stroke-width: 1px;
            stroke: black;
        }
        .lineRight {
            stroke-width: 1px;
            stroke: black;
        }
        `
    );
    injectCSS(
        `#svgCircle{
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            overflow: visible !important;
            pointer-events: none !important;
            z-index: 2147483646 !important;
            visibility: visible !important;
        }

        .noHighlightSVG{
            fill: purple;
            stroke-width: 1px;
            stroke: lightblue;
        }
        
        .highlightSVG{
            fill: #0f62fe;
            stroke-width: 3px;
            stroke: black;
        }

        .noHighlightSVGtriangle{
            fill: darkorange;
            stroke-width: 1px;
            stroke: grey;
        }
        
        .highlightSVGtriangle{
            fill: yellow;
            stroke-width: 3px;
            stroke: black;
        }

        .textColorWhite{
            fill: white
        }

        .textColorBlack{
            fill: black
        }

        `
    );

    injectCSS(
        `#svgLine{
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            overflow: visible !important;
            pointer-events: none !important;
            z-index: 2147483646 !important;
            visibility: visible !important;
        }
        .svgIconTest{
            position: absolute !important;
            overflow: visible !important;
            pointer-events: none !important;
            z-index: 2147483646 !important;
        }
        .circleText{
            pointer-events: none !important;
        }

        .circleSmall{
            font-size: 12px !important;
        }
        `
    );

    // Create nodes that have keyboard errors
    let tabStopsErrors = JSON.parse(JSON.stringify(message.tabStopsErrors));

    // Create nodes that are tabbable, i.e., in the tab chain
    let regularTabstops: any = JSON.parse(JSON.stringify(message.tabStopsResults));
    for (let index = 0; index < message.tabStopsResults.length; index++) {
        const tabElem = message.tabStopsResults[index];
        let flagMatchFound = false;
        message.tabStopsErrors.forEach((errorElem: any) => {
            if (tabElem.path.dom === errorElem.path.dom) {
                flagMatchFound = true;
            }
        });
        if (flagMatchFound) {
            regularTabstops[index].nodeHasError = true
        } 
    }
    
    // JCH - this allows the web to scroll to the top before drawing occurs
    goToTop().then(function() {
        setTimeout(() => {
            draw(regularTabstops, tabStopsErrors, message.tabStopLines, message.tabStopOutlines).then(function() {
                drawErrors(tabStopsErrors, regularTabstops, message.tabStopOutlines);
            });
            
        }, 1000)
        
    });



    // Here is a possibile approach to window resize events:
    // 1. Catch window resize events (they come in bunches)
    // 2. When there is a "reasonable" since the last event
    // 3. Turn off window resize event listener
    // ---- Make sure the following happen sequentially using promises -------
    // 4. Delete drawing
    // 5. Scan (make sure scan cannot be started from anywhere else)
    //    we can update the tabstops and tabstop errors
    // 6. When scan finished make sure page is at the top
    // 7. draw tabstops regular and with errors
    // 8. Turn back on window resize event listener


    // For softlaunch use notification or just help
    window.addEventListener("resize", debounce( resizeContent, 250 ));


    // Tab key listener
    window.addEventListener('keyup', function (event) { // JCH - keydown does NOT work
        if (!event.shiftKey && event.key === "Tab") { // only catch Tab key
            let element = this.document.activeElement;  // get element just tabbed to which has focus
            // get xpath for active element
            let elementXpath = getXPathForElement(element);
            // get circle or polygon with matching xpath
            let circle = this.document.querySelector('circle[xpath="'+elementXpath+'"]');
            let polygon = this.document.querySelector('polygon[xpath="'+elementXpath+'"]');
            let prevHighlightedElement;
            if (prevHighlightedElement = this.document.getElementsByClassName("highlightSVG")[0]) {
                // console.log("Found prevHighlightedElement is circle = ", prevHighlightedElement);
            } else if (prevHighlightedElement = this.document.getElementsByClassName("highlightSVGtriangle")[0]) {
                // console.log("Found prevHighlightedElement is polygon = ", prevHighlightedElement );
            }
            // for prevHighlightedElement remove highlightSVG and add noHighlightSVG
            
            if (prevHighlightedElement) {
                // console.log("prevHighlightedElement.tagName = ", prevHighlightedElement.tagName);
                if (prevHighlightedElement.tagName === "circle") {
                    prevHighlightedElement.classList.remove("highlightSVG");
                    prevHighlightedElement.classList.add("noHighlightSVG");
                } 
                else if (prevHighlightedElement.tagName === "polygon") {
                    prevHighlightedElement.classList.remove("highlightSVGtriangle");
                    prevHighlightedElement.classList.add("noHighlightSVGtriangle");
                }
                // console.log("prevHighlightedElement unhighlighted = ",prevHighlightedElement);
            } else {
                // console.log("No prevHighlightedElement to highlight")
            }
            // Highlight circle
            if (circle) {
                circle?.classList.remove("noHighlightSVG");
                circle?.classList.add("highlightSVG");
                // console.log("circle highlighted = ",circle);
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            if (polygon) {
                polygon?.classList.remove("noHighlightSVGtriangle");
                polygon?.classList.add("highlightSVGtriangle");
                // console.log("polygon highlighted = ",polygon);
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            // Inspect active element
            // console.log("circle.xpath = ", circle?.getAttribute("xpath"));
            // console.log("circle?.getAttribute('circleNumber')", circle?.getAttribute("circleNumber"));
            // TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: circle?.getAttribute("xpath"), circleNumber: circle?.getAttribute("circleNumber")! + 1 });
            // Returm from elements tab to browse page tab
        } else if (event.shiftKey && event.key === "Tab") { // catch only SHIFT TAB
            let element = this.document.activeElement;  // get element just tabbed to which has focus
            // get xpath for active element
            let elementXpath = getXPathForElement(element);
            // get circle or polygon with matching xpath
            let circle = this.document.querySelector('circle[xpath="'+elementXpath+'"]');
            let polygon = this.document.querySelector('polygon[xpath="'+elementXpath+'"]');
            let prevHighlightedElement;
            if (prevHighlightedElement = this.document.getElementsByClassName("highlightSVG")[0]) {
                // console.log("Found prevHighlightedElement is circle = ", prevHighlightedElement);
            } else if (prevHighlightedElement = this.document.getElementsByClassName("highlightSVGtriangle")[0]) {
                // console.log("Found prevHighlightedElement is polygon = ", prevHighlightedElement );
            }
            // for prevHighlightedElement remove highlightSVG and add noHighlightSVG
            
            if (prevHighlightedElement) {
                // console.log("prevHighlightedElement.tagName = ", prevHighlightedElement.tagName);
                if (prevHighlightedElement.tagName === "circle") {
                    prevHighlightedElement.classList.remove("highlightSVG");
                    prevHighlightedElement.classList.add("noHighlightSVG");
                } 
                else if (prevHighlightedElement.tagName === "polygon") {
                    prevHighlightedElement.classList.remove("highlightSVGtriangle");
                    prevHighlightedElement.classList.add("noHighlightSVGtriangle");
                }
                // console.log("prevHighlightedElement unhighlighted = ",prevHighlightedElement);
            } else {
                // console.log("No prevHighlightedElement to highlight")
            }
            // Highlight circle
            if (circle) {
                circle?.classList.remove("noHighlightSVG");
                circle?.classList.add("highlightSVG");
                // console.log("circle highlighted = ",circle);
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            if (polygon) {
                polygon?.classList.remove("noHighlightSVGtriangle");
                polygon?.classList.add("highlightSVGtriangle");
                // console.log("polygon highlighted = ",polygon);
            } else {
                // console.log("No circle to highlight = ",circle);
            }
            // Inspect active element
            // console.log("circle.xpath = ", circle?.getAttribute("xpath"));
            // console.log("circle?.getAttribute('circleNumber')", circle?.getAttribute("circleNumber"));
            // TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: circle?.getAttribute("xpath"), circleNumber: circle?.getAttribute("circleNumber")! + 1 });
            // Returm from elements tab to browse page tab
        }
        
    });

    return true;
});

// Debounce
function debounce(func:any, time:any) {
    // turn off resize event
    var time = time || 100; // 100 by default if no param
    var timer: any;
    return function(event:any) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, time, event);
    };
}

// Function with stuff to execute
function resizeContent() {
    // Do loads of stuff once window has resized
    let resize = true;
    TabMessaging.sendToBackground("TABSTOP_RESIZE", { resize: resize } );

    // Turn resize listener back on
}

function getXPathForElement(element: any) {
    const idx: any = (sib: any, name: any) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
    const segs: any = (elm: any) => (!elm || elm.nodeType !== 1) ? [''] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

TabMessaging.addListener("HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS", async (message: any) => {
    // Clearing any that are already highlighted
    document.querySelectorAll(".highlightSVG").forEach(e => e.classList.remove("highlightSVG"));
    // Highlighting any that are "clicked"
    document.getElementsByClassName("circleNumber" + message.tabStopId)[0].classList.add("highlightSVG");
    return true;
});

//@ts-ignore
TabMessaging.addListener("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    deleteDrawing(".deleteMe");
    return true;
});

function injectCSS(styleString: string) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

async function draw(tabstops: any, tabStopsErrors: any, lines:boolean, outlines:boolean) {
    // console.log("Inside draw")
    await redraw(tabstops, tabStopsErrors, lines, outlines);
}

async function drawErrors(tabStopsErrors: any, tabStops: any, outlines: boolean) {
    // console.log("Inside drawErrors")
    await redrawErrors(tabStopsErrors, tabStops, outlines);
    return true;
}

function deleteDrawing(classToRemove: string) {
    // console.log("Function: deleteDrawing");
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}


function redrawErrors(tabStopsErrors: any, tabStops: any, outlines: boolean) {
    // JCH - FIX drawing ? trangle if there is already a tabbable triangle
    console.log("Function: redrawErrors");
    setTimeout(() => {
        let tabbableNodesXpaths = getNodesXpaths(tabStops);
        
        let nodes = getNodesXpaths(tabStopsErrors);
        let nodeXpaths = nodes;
        nodes = convertXpathsToHtmlElements(nodes);
        
        // console.log("tabStopsErrors = ", tabStopsErrors);
        nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });
        let offset = 0;


        // console.log("nodes.length = ",nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            // console.log("nodes[",i,"] = ",nodes[i]);
            // Check if already taken care of in the tabbable elements
            let skipErrorNode = false;
            for (let j=0; j < tabbableNodesXpaths.length; j++) {
                if (nodeXpaths[i] === tabbableNodesXpaths[j]) {
                    // console.log("Already in Tab Chain");
                    // console.log(tabStopsErrors[i].ruleId);
                    skipErrorNode = true; // JCH - already taken care of in redraw
                } else {
                    // console.log("Not in Tab Chain");
                    // console.log(tabStopsErrors[i].ruleId);
                    // console.log("nodeXpaths[",i,"] = ",nodeXpaths[i]);
                }
            }
            if (skipErrorNode === true) {
                // console.log("JCH - skip out");
                continue; // JCH - don't put up non triangle for an element if already done in redraw
            }

            if (nodeXpaths[i].includes("body")) { // JCH - non tabbable nodes must be within body
                // console.log("Non tabbable nodes[",i,"] = ",nodes[i]);
                
                if (nodes[i] != null ) { // JCH - tabbable nodes
                    if (nodes[i] != null ) { // JCH - tabbable nodes
                        console.log("NON Tabbable nodes[",i,"]   element exists");
                    } else {
                        console.log("NON Tabbable nodes[",i,"] is null $$$$$");
                    }
    
                    if (typeof nodes[i].tagName !== 'undefined' ||  nodes[i].tagName !== null ) { // JCH - tabbable nodes
                        console.log("NON Tabbable nodes[",i,"]   tagName is ",nodes[i].tagName);
                    } else {
                        console.log("NON Tabbable nodes[",i,"].tagName is null $$$$$");
                    }
                   
                    if (typeof nodes[i].getBoundingClientRect !== 'undefined' || nodes[i].getBoundingClientRect != null) {
                        console.log("NON Tabbable nodes[",i,"] Has bounding rect");
                    }
                    else {
                        console.log("NON Tabbable nodes[",i,"] NO bounding rect");
                    }
                }
                console.log("--------------------------------");

                if (nodes[i] != null ) { // JCH - if node exists

                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    if (outlines) {

                        // MAKE BOX AROUND ACTIVE COMPONENT
                        makeLine(x, y, xPlusWidth, y, ["lineError"]);
                        makeLine(x, y, x, yPlusHeight, ["lineError"]);
                        makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["lineError"]);
                        makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["lineError"]);

                        // Make white stroke around active component outline
                        makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmbossError"]);
                        makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmbossError"]);
                        makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmbossError"]);
                        makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmbossError"]);

                        // Make white stroke inside active component outline
                        makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmbossError"]);
                        makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmbossError"]);
                        makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmbossError"]);
                        makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmbossError"]);
                    }

                    // Logic used from:  https://math.stackexchange.com/questions/1344690/is-it-possible-to-find-the-vertices-of-an-equilateral-triangle-given-its-center
                    let triangleLegLength = 27;
                    let triangleXShifted = x;  
                    let triangleYShifted = y+1; // Shift 1 px to center the ? we draw
                    // If the triangle is being drawn slighly off of the screen move it into the screen
                    if (triangleXShifted >= -10 && triangleXShifted <= 6) {
                        triangleXShifted = 14;
                    }
                    if (triangleYShifted >= -10 && triangleYShifted <= 6) {
                        triangleYShifted = 14;
                    }
                    // console.log("Not Tabbable ERROR i = ",i," so makeTriangle");
                    makeTriangle(  
                                triangleXShifted, triangleYShifted - (Math.sqrt(3)/3)*triangleLegLength ,
                                triangleXShifted-triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                triangleXShifted+triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                "Error"+i.toString(), nodeXpaths[i])
                    
                    makeTextSmall(x, y, "?", "textColorBlack");
                } else {
                    continue;
                }
            }
        }
    }, 1);
}



function redraw(tabstops: any, tabStopsErrors: any, lines: boolean, outlines: boolean) {
    console.log("Function: redraw");

    setTimeout(() => { 
        let offset = 3;
        // console.log("redraw tabstops = ", tabstops);
        let nodes = getNodesXpaths(tabstops);
        // console.log(tabstopErrors)
        let nodeXpaths = nodes;
        nodes = convertXpathsToHtmlElements(nodes);
        let slope: number = -1;

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] != null ) { // JCH - tabbable nodes
                console.log("Tabbable nodes[",i+1,"]   element exists");
            } else {
                console.log("Tabbable nodes[",i+1,"] is null $$$$$");
            }
            if (nodes[i] != null) {
                if (typeof nodes[i].tagName !== 'undefined' ||  nodes[i].tagName !== null ) { // JCH - tabbable nodes
                    console.log("Tabbable nodes[",i+1,"]   tagName is ",nodes[i].tagName);
                } else {
                    console.log("Tabbable nodes[",i+1,"].tagName is null $$$$$");
                }
                
                if (typeof nodes[i].getBoundingClientRect !== 'undefined' || nodes[i].getBoundingClientRect != null) {
                    console.log("Has bounding rect");
                }
                else {
                    console.log("NO bounding rect");
                }
            }
            console.log("--------------------------------");
        }

        // JCH - need for last line to return to first node
        console.log("nodes.length = ",nodes.length);
        for (let i = 0; i < nodes.length; i++) { //Make lines between numbers
            // console.log("i = ", i, "   i+1 = ",i+1, "   i+2 = ",i+2);
            if (nodes[i] != null ) { // JCH - tabbable nodes
                console.log("Tabbable nodes[",i,"]   element exists");
                if (tabstops[i].hasOwnProperty("nodeHasError") && tabstops[i].nodeHasError) { // if this is true we should draw a triangle instead of a circle
                    console.log("*** Tabbable Error Node ",i,"***");
                    let nextTabbableElement;
                    let k = i;
                    for (let j = i+1; j < nodes.length; j++) {
                        if (nodes[j] != null) {
                            k = j;
                            nextTabbableElement = nodes[j];
                            break;
                        }
                    }
                    if (typeof nodes[i].getBoundingClientRect !== 'undefined' || nodes[i].getBoundingClientRect != null) {
                        console.log("nodes[",i,"] has bounding rect");
                    }
                    else {
                        console.log("nodes[",i,"] has NO bounding rect");
                    }
                    
                    if (nextTabbableElement != null) {
                        if (typeof nextTabbableElement.getBoundingClientRect !== 'undefined' || nextTabbableElement.getBoundingClientRect != null) {
                            console.log("nextTabbableElement has bounding rect");
                        }
                        else {
                            console.log("nextTabbableElement has NO bounding rect");
                        }
                        
                        slope = (nextTabbableElement.getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nextTabbableElement.getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)
                    }
                    

                    // offset to stay away from the outline?
                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    // Logic used from:  https://math.stackexchange.com/questions/1344690/is-it-possible-to-find-the-vertices-of-an-equilateral-triangle-given-its-center
                    let triangleLegLength = 27
                    let triangleXShifted = x
                    let triangleYShifted = y

                    // console.log("Top left of Bounding Rectangle");
                    // console.log("x = ", x, "   y = ", y);
                    // console.log("triangleXShifted = ", triangleXShifted, "   triangleYShifted = ", triangleYShifted);

                    // JCH - if error is rule element_tabbable_visible then need to calculate where to put
                    //       the triangle at the intersection point (0,?) where one of the two lines
                    //       pointing to the element in question is going off the page.
                    //
                    //       if we have the line(s) for an element get the y for the line at x = ~ 16px
                    //       now how do we choose which of the two lines to use? Higher on page or lower on page?

                    // check to see if any tab stop has ruleID element_tabbable_visible
                    let yIntercept: number;
                    let xIntercept: number;
                    let xOffScreenShift = false; let yOffScreenShift = false;
                    tabStopsErrors.map((result: any) => {
                        if (result.ruleId === "element_tabbable_visible" && result.path.dom === nodeXpaths[i]) {
                            
                            // console.log("getBoundingClientRect().x = ",nodes[i].getBoundingClientRect().x);
                            // console.log("getBoundingClientRect().y = ",nodes[i].getBoundingClientRect().y);
                            
                            if (nodeXpaths[i] === result.path.dom) {
                                if (nodes[i].getBoundingClientRect().x < -10 || nodes[i].getBoundingClientRect().y < -10) {
                                    console.log("Adjustments for element_tabbable_visible for when element off page");
                                    if (triangleXShifted < 0) { // need to get y intercept
                                        // find y intercept y = mx + c or c = y - mx
                                        yIntercept = triangleYShifted - slope * triangleXShifted;
                                        // console.log("yIntercept = ",yIntercept);
                                        triangleXShifted = 20;
                                        triangleYShifted = yIntercept + 15;
                                        xOffScreenShift = true;
                                    } else if (triangleYShifted < 0) { // need to get x intercept
                                        // find x intercept y = mx + c or c = y - mx
                                        yIntercept = triangleYShifted - slope * triangleXShifted;
                                        // console.log("yIntercept = ",yIntercept);
                                        // 0 = slope * x + yIntercept
                                        // xIntercept = yIntercept / slope
                                        xIntercept = -yIntercept / slope;
                                        // console.log("xIntercept = ", xIntercept);
                                        triangleYShifted = 25;
                                        triangleXShifted = xIntercept + 10;
                                        yOffScreenShift = true;
                                    }
                                }
                            }
                        }         
                    });

                    // // Now deal with x2 line end for nodes[i+1]
                    let y2Intercept: number;
                    let x2Intercept: number;
                    let x2OffScreenShift = false; let y2OffScreenShift = false;
                    let triangleX2Shifted = 0;
                    let triangleY2Shifted = 0;
                    if (nextTabbableElement != null && nodes[i+2] != null) {
                        triangleX2Shifted = nextTabbableElement.getBoundingClientRect().x - offset;
                        triangleY2Shifted = nextTabbableElement.getBoundingClientRect().y - offset;
                        if (k+1 < nodes.length) {
                            let slope2 = (nodes[k+1].getBoundingClientRect().y - offset - nextTabbableElement.getBoundingClientRect().y - offset) / (nodes[k+1].getBoundingClientRect().x - offset - nextTabbableElement.getBoundingClientRect().x - offset);
            
                            tabStopsErrors.map((result: any) => {
                                if (result.ruleId === "element_tabbable_visible" && result.path.dom === nodeXpaths[k]) {
                                    
                                    // console.log("getBoundingClientRect().x = ",nodes[i+1].getBoundingClientRect().x);
                                    // console.log("getBoundingClientRect().y = ",nodes[i+1].getBoundingClientRect().y);
                                    
                                    if (nodeXpaths[i+1] === result.path.dom) {
                                        if (nodes[i+1].getBoundingClientRect().x < -10 || nodes[i+1].getBoundingClientRect().y < -10) {
                                            // console.log("Adjustments for element_tabbable_visible for when element off page");
                                            if (triangleXShifted < 0) { // need to get y intercept
                                                // find y intercept y = mx + c or c = y - mx
                                                y2Intercept = triangleY2Shifted - slope2 * triangleX2Shifted;
                                                // console.log("yIntercept = ",yIntercept);
                                                triangleX2Shifted = 20;
                                                triangleY2Shifted = yIntercept + 15;
                                                x2OffScreenShift = true;
                                            } else if (triangleYShifted < 0) { // need to get x intercept
                                                // find x intercept y = mx + c or c = y - mx
                                                y2Intercept = triangleY2Shifted - slope2 * triangleX2Shifted;
                                                // console.log("yIntercept = ",yIntercept);
                                                // 0 = slope * x + yIntercept
                                                // xIntercept = yIntercept / slope
                                                x2Intercept = -y2Intercept / slope2;
                                                // console.log("xIntercept = ", xIntercept);
                                                triangleY2Shifted = 25;
                                                triangleX2Shifted = x2Intercept + 10;
                                                y2OffScreenShift = true;
                                            }
                                        }
                                    }
                                }         
                            });
                        }
                    }

                    // center of the triangle is triangleXShifted, triangleYShifted

                    // What if triangle is is bumping up against top of viewport, or left of viewport or right of viewport
                    // If the triangle is being drawn slighly off of the screen move it into the screen
                    
                    let xShifted = false; let yShifted = false;
                    if (triangleXShifted >= -10 && triangleXShifted <= 6 && xOffScreenShift === false) {
                        // console.log("X Adjustment if tab element circle or triangle very close to top or left but within viewport");
                        triangleXShifted = 14;
                        xShifted = true;
                    }
                    if (triangleYShifted >= -10 && triangleYShifted <= 6 && yOffScreenShift === false) {
                        // console.log("Y Adjustment if tab element circle or triangle very close to top or left but within viewport");
                        triangleYShifted = 14;
                        yShifted = true;
                    }
                    
                    let x2Shifted = false; let y2Shifted = false;
                    if (nextTabbableElement != null && nodes[k+1] != null) {
                        
                        if (triangleX2Shifted >= -10 && triangleX2Shifted <= 6 && x2OffScreenShift === false) {
                            // console.log("X Adjustment if tab element circle or triangle very close to top or left but within viewport");
                            triangleX2Shifted = 14;
                            x2Shifted = true;
                        }
                        if (triangleY2Shifted >= -10 && triangleY2Shifted <= 6 && y2OffScreenShift === false) {
                            // console.log("Y Adjustment if tab element circle or triangle very close to top or left but within viewport");
                            triangleY2Shifted = 14;
                            y2Shifted = true;
                        }
                    }
                    
                    if (lines && nextTabbableElement != null) {
                        console.log("Triangle line ",i," to ",k);
                        if (i < nodes.length - 1) {
                            // Create basic black line
                            let x1 = nodes[i].getBoundingClientRect().x;   let y1 = nodes[i].getBoundingClientRect().y;
                            let x2 = nextTabbableElement.getBoundingClientRect().x; let y2 = nextTabbableElement.getBoundingClientRect().y;
                            // console.log("x1 = ", x1, "   y1 = ", y1);
                            // console.log("x2 = ", x2, "   y2 = ", y2);
                            if (xShifted === true) {
                                x1 = x1 + 14;
                                // console.log("Line shift x1 = ", x1);
                                xShifted = false;
                            } if (yShifted === true) {
                                y1 = y1 + 14;
                                // console.log("Line shift y1 = ", y1);
                                yShifted = false;
                            //@ts-ignore   
                            } if (xOffScreenShift === true) {
                                x1 = x1 + triangleXShifted;
                                y1 = y1 + triangleYShifted;
                                // console.log("off screen line shift x1 = ", x1, "   y1 = ",y1);
                                xOffScreenShift = false;
                            //@ts-ignore
                            }  if (yOffScreenShift === true) {
                                x1 = x1 + triangleXShifted;
                                y1 = y1 + triangleYShifted;
                                // console.log("off screen line shift x1 = ", x1, "   y1 = ",y1);
                                yOffScreenShift = false;
                            }

                            if (nextTabbableElement != null && nodes[k+1] != null) {
                                if (x2Shifted === true) {
                                    x2 = x2 + 14;
                                    // console.log("Line shift x2 = ", x2);
                                    x2Shifted = false;
                                } if (y2Shifted === true) {
                                    y2 = y2 + 14;
                                    // console.log("Line shift y2 = ", y2);
                                    yShifted = false;
                                //@ts-ignore   
                                } if (xOffScreenShift === true) {
                                    x2 = x2 + triangleX2Shifted;
                                    y2 = y2 + triangleY2Shifted;
                                    // console.log("off screen line shift x2 = ", x2, "   y2 = ",y2);
                                    xOffScreenShift = false;
                                //@ts-ignore
                                }  if (y2OffScreenShift === true) {
                                    x2 = x2 + triangleXShifted;
                                    y2 = y2 + triangleYShifted;
                                    // console.log("off screen line shift x2 = ", x2, "   y2 = ",y2);
                                    y2OffScreenShift = false;
                                }
                            }
                            // console.log("x1 - offset = ", x1 - offset, "   y1 - offset = ",y1 - offset);
                            // console.log("x2 - offset = ", x2 - offset, "   y2 - offset = ",y2 - offset);
                            // console.log("------------------");


                            makeLine(x1 - offset, y1 - offset, x2 - offset, y2 - offset, ["line"]);

                            // Create white outline
                            if (Math.abs(slope) < 1) {  // Low slope move y
                                makeLine(x1 - offset, y1 - offset - 1, x2 - offset, y2 - offset - 1, ["lineEmboss"]);
                                makeLine(x1 - offset, y1 - offset + 1, x2 - offset, y2 - offset + 1, ["lineEmboss"]);

                            } else { // high slope move x
                                makeLine(x1 - offset - 1, y1 - offset, x2 - offset - 1, y2 - offset, ["lineEmboss"]);
                                makeLine(x1 - offset + 1, y1 - offset, x2 - offset + 1, y2 - offset, ["lineEmboss"]);
                            }
                        }
                    }

                    // console.log("triangleXShifted = ",triangleXShifted, "   triangleYShifted",triangleYShifted);
                    if (i < nodes.length) {
                        // console.log("Tabbable i = ",i," so makeTriangle");
                        makeTriangle(  
                                    triangleXShifted, triangleYShifted - (Math.sqrt(3)/3)*triangleLegLength ,
                                    triangleXShifted-triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                    triangleXShifted+triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                    i.toString(), nodeXpaths[i])
                        
                        // makeTextSmall(x, y, (i + 1).toString(), "textColorBlack");

                        makeTextSmall(triangleXShifted, triangleYShifted, (i + 1).toString(), "textColorBlack");
                    }

                    if (outlines) {

                        // console.log("Outline: x = ", x, "   y = ",y, "   width = ", xPlusWidth, "   height = ", yPlusHeight);

                        // Make box around active component
                        makeLine(x, y, xPlusWidth, y, ["line", "lineTop", "lineNumber" + i]);
                        makeLine(x, y, x, yPlusHeight, ["line", "lineLeft", "lineNumber" + i]);
                        makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["line", "lineRight", "lineNumber" + i]);
                        makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["line", "lineBottom", "lineNumber" + i]);

                        // Make white stroke around active component outline
                        makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmboss"]);
                        makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmboss"]);
                        makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);
                        makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);

                        // Make white stroke inside active component outline
                        makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmboss"]);
                        makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmboss"]);
                        makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                        makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                    }
                } else { // This is the defalt case were we just draw a circle
                    console.log("*** Tabbable Node ",i,"***");
                    // for line to next tabbable element find next tabbable element that exists
                    let nextTabbableElement;
                    let k;
                    for (let j = i+1; j < nodes.length; j++) {
                        if (nodes[j] != null) {
                            k = j;
                            nextTabbableElement = nodes[j];
                            break;
                        }
                    }
                    if (lines) {
                        console.log("Circle line ",i," to ",k);
                        if (i < nodes.length - 1) {
                            if (typeof nodes[i].getBoundingClientRect !== 'undefined' || nodes[i].getBoundingClientRect != null) {
                                console.log("nodes[",i,"] has bounding rect");
                            }
                            else {
                                console.log("nodes[",i,"] has NO bounding rect");
                            }
                            if (typeof nextTabbableElement.getBoundingClientRect !== 'undefined' || nextTabbableElement.getBoundingClientRect != null) {
                                console.log("nextTabbableElement has bounding rect");
                            }
                            else {
                                console.log("nextTabbableElement has NO bounding rect");
                            }

                            let slope = (nextTabbableElement.getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nextTabbableElement.getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)
                            let x1 = nodes[i].getBoundingClientRect().x;
                            let y1 = nodes[i].getBoundingClientRect().y;
                            let x2 = nextTabbableElement.getBoundingClientRect().x;
                            let y2 = nextTabbableElement.getBoundingClientRect().y;

                            makeLine(x1 - offset, y1 - offset, x2 - offset, y2 - offset, ["line"]);

                            // Create white outline
                            if (Math.abs(slope) < 1) {  // Low slope move y
                                makeLine(x1 - offset, y1 - offset - 1, x2 - offset, y2 - offset - 1, ["lineEmboss"]);
                                makeLine(x1 - offset, y1 - offset + 1, x2 - offset, y2 - offset + 1, ["lineEmboss"]);

                            } else { // high slope move x
                                makeLine(x1 - offset - 1, y1 - offset, x2 - offset - 1, y2 - offset, ["lineEmboss"]);
                                makeLine(x1 - offset + 1, y1 - offset, x2 - offset + 1, y2 - offset, ["lineEmboss"]);
                            }
                        }
                    }

                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    makeCircleSmall(x, y, i.toString(), 13, nodeXpaths[i]);
                    makeTextSmall(x, y, (i + 1).toString(),"textColorWhite");

                    if (outlines) {

                        // Make box around active component
                        makeLine(x, y, xPlusWidth, y, ["line", "lineTop", "lineNumber" + i]);
                        makeLine(x, y, x, yPlusHeight, ["line", "lineLeft", "lineNumber" + i]);
                        makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["line", "lineRight", "lineNumber" + i]);
                        makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["line", "lineBottom", "lineNumber" + i]);

                        // Make white stroke around active component outline
                        makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmboss"]);
                        makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmboss"]);
                        makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);
                        makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);

                        // Make white stroke inside active component outline
                        makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmboss"]);
                        makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmboss"]);
                        makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                        makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
                    }
                }
            } else {
                continue;
            }
        }

    }, 1)
}

function makeCircleSmall(x1: number, y1: number, circleNumber: string, radius: number, xpath: string) {

    // TODO: Find possible better way to deal with this (Talk to design)
    // If the circle is being drawn slighly off of the screen move it into the screen
    if (x1 >= -10 && x1 <= 6) {
        x1 = 12;
    }
    if (y1 >= -10 && y1 <= 6) {
        y1 = 12;
    }
    var circleClone = createSVGCircleTemplate();
    circleClone.removeAttribute("id");
    circleClone.classList.add("deleteMe");
    circleClone.classList.add("circleNumber" + circleNumber);
    circleClone.setAttribute('cx', String(x1));
    circleClone.setAttribute('cy', String(y1));
    circleClone.setAttribute('pointer-events', "auto");
    circleClone.setAttribute('r', String(radius));
    circleClone.setAttribute('xpath', xpath);
    circleClone.onclick = () => {
        TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: xpath, circleNumber: circleNumber + 1 })
    };
    if (document.getElementById("svgCircle") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgCircle");
        elemSVG.classList.add("dynamic");
        document.body.appendChild(elemSVG);
    }
    // console.log("Inject circle circleNumber" + circleNumber);
    document.getElementById('svgCircle')?.appendChild(circleClone)
}

function makeTriangle(x1: number, y1: number, x2: number, y2: number,x3: number, y3: number, circleNumber: string, xpath: string) {
    // <svg xmlns="http://www.w3.org/2000/svg" class="svg-triangle">
    //  <polygon points="0,0 100,0 50,100"/>
    // </svg>

    // <polygon points="x1,y1 x2,y2 x3,y3"
    // x1,y1 represents the starting point of the

    // .svg-triangle{
    //     margin: 0 auto;
    //     width: 100px;
    //     height: 100px;
    // }
    
    // .svg-triangle polygon {
    // fill:#98d02e;
    // stroke:#65b81d;
    // stroke-width:2;
    // }

    // TODO: Find possible better way to deal with this (Talk to design)
   
    var triangleClone = createSVGTriangleTemplate();
    triangleClone.removeAttribute("id");
    triangleClone.classList.add("deleteMe");
    triangleClone.classList.add("circleNumber" + circleNumber);
    triangleClone.setAttribute('points', String(x1)+","+String(y1)+","+String(x2)+","+String(y2)+","+String(x3)+","+String(y3));
    triangleClone.setAttribute('pointer-events', "auto");
    triangleClone.setAttribute('xpath', xpath);
    triangleClone.onclick = () => {
        TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: xpath, circleNumber: circleNumber + 1 })
    };
    if (document.getElementById("svgCircle") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgCircle");
        document.body.appendChild(elemSVG);
    }
    // console.log("Inject triangle circleNumber" + circleNumber);
    document.getElementById('svgCircle')?.appendChild(triangleClone);
}



function makeTextSmall(x1: number, y1: number, n: string, textColorClassName?: string) {

    // TODO: Find possible better way to deal with this (Talk to design)
    // If the circle is being drawn slighly off of the screen move it into the screen
    if (x1 >= -10 && x1 <= 6) {
        x1 = 12;
    }
    if (y1 >= -10 && y1 <= 6) {
        y1 = 12;
    }

    // let text = document.getElementsByClassName('circleText')[0]
    var textClone = createSVGCircleTextTemplate();//text.cloneNode(true);
    textClone.removeAttribute("id");
    textClone.classList.add("deleteMe");
    textClone.classList.add("circleSmall");
    if(textColorClassName){
        textClone.classList.add(textColorClassName); 
    }

    if (n.length >= 3) { // If number has 3+ digits shift it a few more px to center it
        textClone.setAttribute('x', String(x1 - 10));
        textClone.setAttribute('y', String(y1 + 4));
    } else if (n.length == 2) { // number has 2 digits
        textClone.setAttribute('x', String(x1 - 6));
        textClone.setAttribute('y', String(y1 + 4));
    } else { // number has 1 digit
        textClone.setAttribute('x', String(x1 - 3));
        textClone.setAttribute('y', String(y1 + 3));
    }
    textClone.innerHTML = n;
    if (document.getElementById("svgCircle") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgCircle");
        document.body.appendChild(elemSVG);
    }
    document.getElementById('svgCircle')?.appendChild(textClone)
}

function makeLine(x1: number, y1: number, x2: number, y2: number, CSSclass?: string[]) {
    // console.log("Inject line");
    // let line = document.getElementsByClassName('tabLine')[0]
    var lineClone = createSVGLineTemplate()//line.cloneNode(true);
    if (CSSclass) {
        for (let i = 0; i < CSSclass.length; i++) {
            lineClone.classList.add(CSSclass[i]);
        }
    }
    lineClone.removeAttribute("id");
    lineClone.classList.add("deleteMe");
    lineClone.setAttribute('x1', String(x1));
    lineClone.setAttribute('y1', String(y1));
    lineClone.setAttribute('x2', String(x2));
    lineClone.setAttribute('y2', String(y2));
    if (document.getElementById("svgLine") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgLine");
        document.body.appendChild(elemSVG);
    }
    document.getElementById('svgLine')?.appendChild(lineClone);
}

function createSVGTriangleTemplate() {
    // This is what we are creating:
    // <svg id="svgTriangle">
    // THIS PART->     <triangle id="triangle" class="tabTriangle" stroke="grey" stroke-width="1" fill="yellow"/>
    //                 <text class="TriangleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="black"/>
    // </svg>
    // var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    // elemCircle.setAttribute("id", "triangle");
    elemCircle.setAttribute("id", "circle");
    elemCircle.setAttribute("class", "tabCircle");
    elemCircle.classList.add("dynamic");
    elemCircle.classList.add("noHighlightSVGtriangle");
    elemCircle.setAttribute("stroke", "grey");
    elemCircle.setAttribute("stroke-width", "1");
    elemCircle.setAttribute("stroke-linejoin", "round");
    return elemCircle
}


function createSVGCircleTemplate() {
    // This is what we are creating:
    // <svg id="svgCircle">
    // THIS PART->     <circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/>
    //                 <text class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/>
    // </svg>
    var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    elemCircle.setAttribute("id", "circle");
    elemCircle.setAttribute("class", "tabCircle");
    elemCircle.classList.add("dynamic");
    elemCircle.classList.add("noHighlightSVG");
    elemCircle.setAttribute("stroke", "grey");
    elemCircle.setAttribute("stroke-width", "1");
    return elemCircle
}

function createSVGCircleTextTemplate() {
    // This is what we are creating:
    // <svg id="svgCircle">
    //                 <circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/>
    // THIS PART->     <text class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/>
    // </svg>
    var elemText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    elemText.setAttribute("class", "circleText");
    elemText.setAttribute("font-family", "helvetica");
    elemText.setAttribute("font-size", "10");
    elemText.setAttribute("font-weight", "normal");
    elemText.setAttribute("fill", "white");
    return elemText
}




function createSVGLineTemplate() {
    // This is what we are creating:
    // <svg id="svgLine">
    //    <line id="line" class="tabLine"/>
    // </svg>
    var elemLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    elemLine.setAttribute("id", "line");
    elemLine.setAttribute("class", "tabLine");
    return elemLine
}


function convertXpathsToHtmlElements(nodes: any) {
    let results: any = [];
    nodes.map((elem: any) => {
        results.push(document.evaluate(elem, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    });
    return results;
}

function getNodesXpaths(nodes: any) {
    // console.log("Inside getNodesXpaths");
    let tabXpaths: any = [];
    nodes.map((result: any) => {
        if (result != null) {
            // console.log("result.path.dom = "+result.path.dom);
            tabXpaths.push(result.path.dom);
        }
    });
    return tabXpaths;
}

async function goToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
}