import TabMessaging from "../util/tabMessaging";

console.log("Content Script for drawing tab stops has loaded")

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS received in foreground")
    // console.log(message.tabStopsResults);
    
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
        }
        
        .highlightSVG{
            fill: blue;
        }

        .noHighlightSVGtriangle{
            fill: darkorange;
        }
        
        .highlightSVGtriangle{
            fill: yellow;
        }

        .textColorWhite{
            fill: white
        }

        .textColorBlack{
            fill: black
        }

        `
    );
    // position: absolute;
    // pointer-events: none;
    // z-index: 1000;
    // top: 0;
    // left: 0;
    // width: 100%;
    // height: 100%;
    // overflow: visible;

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

    // Create nodes for errors (that are not tabstops) -  We are using warning icons here
    //    1. To to this remove any regular tabstops from the errors list
    let errorsMisc = JSON.parse(JSON.stringify(message.tabStopsErrors));
    for (let index = 0; index < message.tabStopsErrors.length; index++) {
        const tabElem = message.tabStopsErrors[index];
        message.tabStopsResults.forEach((errorElem: any) => {
            if (tabElem.path.dom === errorElem.path.dom) {
                console.log(errorElem.path.dom)
                console.log(tabElem.path.dom)
                errorsMisc.splice(index, 1)
            }
        });
    }
    // console.log("regularTabstops " + regularTabstops)
    // console.log("regularTabstops " + regularTabstops.length)
    // console.log("errorTabstops " + errorTabstops)
    // console.log("errorTabstops " + errorTabstops.length)
    // console.log("errorsMisc " + errorsMisc)


    let regularTabstops: any = JSON.parse(JSON.stringify(message.tabStopsResults));
    for (let index = 0; index < message.tabStopsResults.length; index++) {
        const tabElem = message.tabStopsResults[index];
        let flagMatchFound = false;
        message.tabStopsErrors.forEach((errorElem: any) => {
            if (tabElem.path.dom === errorElem.path.dom) {
                console.log("============123===================")
                console.log(errorElem.path.dom)
                console.log(tabElem.path.dom)
                console.log("=============123==================")
                flagMatchFound = true;
            }
        });
        if (flagMatchFound) {
            regularTabstops[index].nodeHasError = true
        }
        else { 

        }


    }
    console.log("regularTabstops1" + regularTabstops)
    console.log(regularTabstops)


    console.log("===============================")
    console.log(message.tabStopsResults)
    console.log(message.tabStopsErrors)
    console.log("===============================")


    // JCH - this allows the web to scroll to the top before drawing occurs
    goToTop().then(function() {
        setTimeout(() => {
            draw(regularTabstops);
            drawErrors(errorsMisc);
        }, 1000)
        
    })
    // draw(regularTabstops);
    // drawErrors(errorsMisc);

    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw(regularTabstops);
        redrawErrors(errorsMisc)
    });
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

function getXPathForElement(element: any) {
    const idx: any = (sib: any, name: any) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
    const segs: any = (elm: any) => (!elm || elm.nodeType !== 1) ? [''] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

TabMessaging.addListener("HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS recieved in foreground");
    console.log(message);

    // Clearing any that are already highlighted
    document.querySelectorAll(".highlightSVG").forEach(e => e.classList.remove("highlightSVG"));
    // Highlighting any that are "clicked"
    document.getElementsByClassName("circleNumber" + message.tabStopId)[0].classList.add("highlightSVG");
    return true;
});

//@ts-ignore
TabMessaging.addListener("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS recieved in foreground")
    console.log(message)

    deleteDrawing(".deleteMe");
    return true;
});

function injectCSS(styleString: string) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

function draw(tabstops: any) {
    console.log("Inside draw")
    redraw(tabstops);
}

function drawErrors(tabStopsErrors: any) {
    // console.log("Inside drawErrors")
    redrawErrors(tabStopsErrors);
    return true;
}

function deleteDrawing(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}


function redrawErrors(tabStopsErrors: any) {
    // console.log("Inside redrawErrors")
    setTimeout(() => {
        console.log("tabbable error nodes = ", tabStopsErrors);
        let nodes = getNodesXpaths(tabStopsErrors);
        let nodeXpaths = nodes;
        nodes = convertXpathsToHtmlElements(nodes);
        
        // console.log("redrawErrors nodeXpaths = ", nodeXpaths);
        nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });
        let offset = 0;

        // console.log("nodes = ",nodes);
        for (let i = 0; i < nodes.length; i++) {
            
            if (nodeXpaths[i].includes("body")) { // JCH - much be within body
                let x = nodes[i].getBoundingClientRect().x - offset;
                let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                let y = nodes[i].getBoundingClientRect().y - offset;
                let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

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

                // makeIcon(xPlusWidth-6, y-6, "test");  // 12px icon on top right corner
                // makeIcon(x, y, "test");

                // Logic used from:  https://math.stackexchange.com/questions/1344690/is-it-possible-to-find-the-vertices-of-an-equilateral-triangle-given-its-center
                let triangleLegLength = 27;
                let triangleXShifted = x;  // Shift 1 px to center the ! we draw
                let triangleYShifted = y+1;
                makeTriangle(  
                            triangleXShifted, triangleYShifted - (Math.sqrt(3)/3)*triangleLegLength ,
                            triangleXShifted-triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                            triangleXShifted+triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                            "Error"+i.toString(), nodeXpaths[i])
                
                makeTextSmall(x, y, "?", "textColorBlack");
            }
        }
    }, 1);
}



function redraw(tabstops: any) {
    console.log("Inside redraw")
    setTimeout(() => { 
        let offset = 3;
        console.log("redraw tabstops = ", tabstops);
        let nodes = getNodesXpaths(tabstops);
        // console.log(tabstopErrors)
        let nodeXpaths = nodes;
        nodes = convertXpathsToHtmlElements(nodes);

        // JCH - need for last line to return to first node
        console.log("nodes.length = ", nodes.length);
        for (let i = 0; i < nodes.length; i++) { //Make lines between numbers
            // console.log("##########################");
            if (nodes[i] != null) {
                // console.log(tabstops[i])
                if (tabstops[i].hasOwnProperty("nodeHasError") && tabstops[i].nodeHasError) { // if this is true we should draw a triangle instead of a circle
                    
                    // console.log("+++++++++++++++++++")
                    if (i < nodes.length - 1) {
                        // drawSingleCircle(nodes, i, 20, nodeXpaths)
                        let slope = (nodes[i + 1].getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nodes[i + 1].getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)

                        makeLine(nodes[i].getBoundingClientRect().x - offset,
                            nodes[i].getBoundingClientRect().y - offset,
                            nodes[i + 1].getBoundingClientRect().x - offset,
                            nodes[i + 1].getBoundingClientRect().y - offset, ["line"]);

                        // Create white outline
                        if (Math.abs(slope) < 1) {  // Low slope move y
                            makeLine(nodes[i].getBoundingClientRect().x - offset,
                                nodes[i].getBoundingClientRect().y - offset - 1,
                                nodes[i + 1].getBoundingClientRect().x - offset,
                                nodes[i + 1].getBoundingClientRect().y - offset - 1, ["lineEmboss"]);

                            makeLine(nodes[i].getBoundingClientRect().x - offset,
                                nodes[i].getBoundingClientRect().y - offset + 1,
                                nodes[i + 1].getBoundingClientRect().x - offset,
                                nodes[i + 1].getBoundingClientRect().y - offset + 1, ["lineEmboss"]);

                        } else { // high slope move x
                            makeLine(nodes[i].getBoundingClientRect().x - offset - 1,
                                nodes[i].getBoundingClientRect().y - offset,
                                nodes[i + 1].getBoundingClientRect().x - offset - 1,
                                nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);

                            makeLine(nodes[i].getBoundingClientRect().x - offset + 1,
                                nodes[i].getBoundingClientRect().y - offset,
                                nodes[i + 1].getBoundingClientRect().x - offset + 1,
                                nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);
                        }

                    }
                        
                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    // Logic used from:  https://math.stackexchange.com/questions/1344690/is-it-possible-to-find-the-vertices-of-an-equilateral-triangle-given-its-center
                    let triangleLegLength = 27
                    let triangleXShifted = x
                    let triangleYShifted = y
                    // console.log("Make triangle with x= ",x,"   y= ",y);
                    makeTriangle(  
                                triangleXShifted, triangleYShifted - (Math.sqrt(3)/3)*triangleLegLength ,
                                triangleXShifted-triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                triangleXShifted+triangleLegLength/2, triangleYShifted+(Math.sqrt(3)/6)*triangleLegLength,
                                i.toString(), nodeXpaths[i])
                    
                    makeTextSmall(x, y, (i + 1).toString(), "textColorBlack");

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
                else { // This is the defalt case were we just draw a circle
                    // console.log("-------------------------")

                    // drawSingleCircle(nodes, i, offset, nodeXpaths)
                    if (i < nodes.length - 1) {
                        let slope = (nodes[i + 1].getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nodes[i + 1].getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)

                        makeLine(nodes[i].getBoundingClientRect().x - offset,
                            nodes[i].getBoundingClientRect().y - offset,
                            nodes[i + 1].getBoundingClientRect().x - offset,
                            nodes[i + 1].getBoundingClientRect().y - offset, ["line"]);

                        // Create white outline
                        if (Math.abs(slope) < 1) {  // Low slope move y
                            makeLine(nodes[i].getBoundingClientRect().x - offset,
                                nodes[i].getBoundingClientRect().y - offset - 1,
                                nodes[i + 1].getBoundingClientRect().x - offset,
                                nodes[i + 1].getBoundingClientRect().y - offset - 1, ["lineEmboss"]);

                            makeLine(nodes[i].getBoundingClientRect().x - offset,
                                nodes[i].getBoundingClientRect().y - offset + 1,
                                nodes[i + 1].getBoundingClientRect().x - offset,
                                nodes[i + 1].getBoundingClientRect().y - offset + 1, ["lineEmboss"]);

                        } else { // high slope move x
                            makeLine(nodes[i].getBoundingClientRect().x - offset - 1,
                                nodes[i].getBoundingClientRect().y - offset,
                                nodes[i + 1].getBoundingClientRect().x - offset - 1,
                                nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);

                            makeLine(nodes[i].getBoundingClientRect().x - offset + 1,
                                nodes[i].getBoundingClientRect().y - offset,
                                nodes[i + 1].getBoundingClientRect().x - offset + 1,
                                nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);
                        }

                    }
                    

                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    // if (i == 32) {
                    //     console.log("x y :", x, " ", y)
                    // }
                    // console.log("Make circle with x= ",x,"   y= ",y);
                    makeCircleSmall(x, y, i.toString(), 13, nodeXpaths[i]);
                    makeTextSmall(x, y, (i + 1).toString(),"textColorWhite");

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
    // If the circle is being drawn slighly off of the screen move it into the screen
    if (x1 >= -10 && x1 <= 6) {
        x1 = 12;
    }
    if (y1 >= -10 && y1 <= 6) {
        y1 = 12;
    }
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

// function createSVGErrorIconTemplate() {
//     // This is what we are creating:
//     // <svg class="svgIcon1" display = "none" xmlns = "http://www.w3.org/2000/svg" width = "12px" height = "12px" viewBox = "0 0 32 32" >
//     //     <defs>
//     //         <style> 
//     //            .cls-1 { fill: none; } 
//     //         </style>
//     //     </defs >
//     //     <path  class="cls-1" d = "M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z" style = "&#10;    fill: black;&#10;" />
//     //     <path d="M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z" style = "&#10;    fill: yellow;&#10;" />
//     //     <path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z" style = "&#10;    fill: black;&#10;" />
//     //     <rect data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width = "32" height = "32" />
//     // </svg>
//     var elemSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//     elemSvg.setAttribute("class", "svgIcon1");
//     elemSvg.setAttribute("display", "none");
//     elemSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//     elemSvg.setAttribute("width", "12px");
//     elemSvg.setAttribute("height", "12px");
//     elemSvg.setAttribute("viewBox", "0 0 32 32");

//     var elemDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

//     var elemStyle = document.createElement('style');
//     elemStyle.innerText = ".cls-1 { fill: none; }"

//     var elemPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     elemPath1.setAttribute("class", "cls-1");
//     elemPath1.setAttribute("d", "M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z");
//     elemPath1.setAttribute("style", "&#10;    fill: black;&#10;");

//     var elemPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     elemPath2.setAttribute("d", "M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z");
//     elemPath2.setAttribute("style", "&#10;    fill: yellow;&#10;");

//     var elemPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//     elemPath3.setAttribute("d", "M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z");
//     elemPath3.setAttribute("style", "&#10;    fill: black;&#10;");

//     var elemRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//     elemRect.setAttribute("data-name", "&lt;Transparent Rectangle&gt;");
//     elemRect.setAttribute("class", "cls-1");
//     elemRect.setAttribute("width", "32");
//     elemRect.setAttribute("height", "32");

//     elemDefs.appendChild(elemStyle);
//     elemSvg.appendChild(elemDefs);
//     elemSvg.appendChild(elemPath1);
//     elemSvg.appendChild(elemPath2);
//     elemSvg.appendChild(elemPath3);
//     elemSvg.appendChild(elemRect);
//     return elemSvg;
// }

function convertXpathsToHtmlElements(nodes: any) {
    let results: any = [];
    nodes.map((elem: any) => {
        results.push(document.evaluate(elem, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    });
    return results;
}

function getNodesXpaths(nodes: any) {
    console.log("Inside getNodesXpaths");
    let tabXpaths: any = [];
    nodes.map((result: any) => {
        if (result != null) {
            console.log("result.path.dom = "+result.path.dom);
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

// function getXPathForElement(element: any) {
//     const idx: any = (sib: any, name: any) => sib
//         ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
//         : 1;
//     const segs: any = (elm: any) => (!elm || elm.nodeType !== 1)
//         ? ['']
//         : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];


// function getXPathForElement(element) { // same function as above but without typescript for use on chrome console
//     const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
//     const segs: any = (elm: any) => (!elm || elm.nodeType !== 1) ? [''] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
//     return segs(element).join('/');
// }

// UNUSED xpath evaluation function:
// function getElementByXPath(path:any) { 
//     return (new XPathEvaluator()) 
//         .evaluate(path, document.documentElement, null, 
//                         XPathResult.FIRST_ORDERED_NODE_TYPE, null) 
//         .singleNodeValue; 
// } 
