import TabMessaging from "../util/tabMessaging";

console.log("Content Script for drawing tab stops has loaded")

// var intervalTimer: any;
// var circleXpaths [] = "";

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS received in foreground")
    console.log(message.tabStopsResults);
    document.body.scrollTop = document.documentElement.scrollTop = 0;

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
            fill: green;
        }
        
        .highlightSVG{
            fill: blue !important;
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

    // JCH want there to be one function draw() which draws circles for tab stops with
    //     no errors and triangles for tab stops with errors

    // console.log("message.tabStopsResults" + message.tabStopsResults)
    // console.log("message.tabStopsResultslength" + message.tabStopsResults.length)
    // console.log("message.tabStopsErrors" + message.tabStopsErrors)
    // console.log("message.tabStopsErrorslength" + message.tabStopsErrors.length)

    // Create nodes for regular tabstops
    //    1. To to this remove any errors from full list - we are adding the normal tabstop icon here
    // let regularTabstops = JSON.parse(JSON.stringify(message.tabStopsResults));
    // let regularTabstops: any[] = []
    // for (let index = 0; index < message.tabStopsResults.length; index++) {
    //     const tabElem = message.tabStopsResults[index];
    //     let flagMatchFound = false;
    //     message.tabStopsErrors.forEach((errorElem: any) => {
    //         if (tabElem.path.dom === errorElem.path.dom) {
    //             // console.log(errorElem.path.dom)
    //             // console.log(tabElem.path.dom)
    //             flagMatchFound = true;
    //         }
    //     });
    //     if (flagMatchFound) {
    //         regularTabstops.splice(index, 1, null)
    //     }
    //     else (
    //         regularTabstops.push(tabElem)
    //     )

    // }

    // Create nodes for error tabstops - We are adding yellow triangles here
    // let errorTabstops: any[] = [];
    // for (let index = 0; index < message.tabStopsResults.length; index++) {
    //     const tabElem = message.tabStopsResults[index];
    //     let flagMatchFound = false;
    //     message.tabStopsErrors.forEach((errorElem: any) => {
    //         if (tabElem.path.dom === errorElem.path.dom) {
    //             // console.log(errorElem.path.dom)
    //             // console.log(tabElem.path.dom)
    //             flagMatchFound = true
    //         }
    //     });
    //     if (flagMatchFound) {
    //         errorTabstops.push(tabElem)
    //     }
    //     else {
    //         errorTabstops.push(null)
    //     }
    // }

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
                // console.log(errorElem.path.dom)
                // console.log(tabElem.path.dom)
                flagMatchFound = true;
            }
        });
        if (flagMatchFound) {
            // regularTabstops1.splice(index, 1, null)
            regularTabstops[index].nodeHasError = true
        }
        else { }
        // regularTabstops1.push(tabElem)


    }
    console.log("regularTabstops1" + regularTabstops)
    console.log(regularTabstops)



    draw(regularTabstops);
    drawErrors(errorsMisc);
    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw(regularTabstops);
        redrawErrors(errorsMisc)
    });
    // Tab key listener
    window.addEventListener('keydown', function (event) {
        console.log("keycode = ", event.code);
        let element = this.document.activeElement;
        console.log("element = ", element?.tagName);
        // Highlight circle
        //      When circles are made keep array of xpath and circle number
        //      for the active element find xpath that matches circle and get circle number
        let elementXpath = getXPathForElement(element);
        console.log("elementXpath = ", elementXpath);
        //      get circle with circle number
        let circle = this.document.querySelector('circle[xpath="' + elementXpath + '"]');
        console.log("circle xpath", circle?.getAttribute("xpath"));
        //      change fill color to highlight
        // setTimeout(() => {
        //     circle?.setAttribute("fill", "blue");
        // }, 0)
        console.log("circle fill", circle?.getAttribute("fill"));
        circle?.classList.remove("noHighlightSVG");
        circle?.classList.add("highlightSVG");
        console.log("circle fill", circle?.getAttribute("fill"));
        // Inspect active element
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
    console.log("Inside drawErrors")
    redrawErrors(tabStopsErrors);
}

function deleteDrawing(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}


function redrawErrors(tabStopsErrors: any) {
    console.log("Inside redrawErrors")
    setTimeout(() => {
        // console.log("tabbable error nodes = ", tabStopsErrors);
        let nodes = getNodesXpaths(tabStopsErrors);
        nodes = convertXpathsToHtmlElements(nodes);
        nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });
        let offset = 0;


        for (let i = 0; i < nodes.length; i++) {
            let x = nodes[i].getBoundingClientRect().x - offset;
            let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

            let y = nodes[i].getBoundingClientRect().y - offset;
            let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

            // makeCircleSmall(x, y, i, 7);
            // makeTextSmall(x, y, (i + 1).toString());


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
            makeIcon(x, y, "test");
        }
    }, 1)
}



function redraw(tabstops: any) {
    console.log("Inside redraw")
    setTimeout(() => {
        let offset = 3;
        let nodes = getNodesXpaths(tabstops);
        // console.log(tabstopErrors)
        let nodeXpaths = nodes;
        nodes = convertXpathsToHtmlElements(nodes);

        // let nodesErrors = getNodesXpaths(tabstopErrors);
        // console.log(tabstopErrors)
        // let nodeXpathsErrors = nodesErrors;
        // nodesErrors = convertXpathsToHtmlElements(nodesErrors);

        // nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
        //     return el != null;
        // });
        // nodeXpaths = nodeXpaths.filter(function (el: any) {  // Removing failure case of null nodes being sent
        //     return el != null;
        // });

        // console.log("tabbable nodes = ", nodes);

        // JCH - need for last line to return to first node
        for (let i = 0; i < nodes.length-1; i++) { //Make lines between numbers

            if (nodes[i] != null) {
                console.log(tabstops[i])
                if (tabstops[i].hasOwnProperty("nodeHasError") && tabstops[i].nodeHasError) {
                    console.log("+++++++++++++++++++")
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

                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    // if (i == 32) {
                    //     console.log("x y :", x, " ", y)
                    // }

                    // makeCircleSmall(x, y, i, 13, nodeXpaths[i]);
                    let triangleXShifted = x
                    let triangleYShifted = y
                    let triangleSize = 12
                    makeTriangle( triangleXShifted,triangleYShifted-triangleSize ,triangleXShifted+triangleSize,triangleYShifted+triangleSize,  triangleXShifted-triangleSize,triangleYShifted+triangleSize,1,nodeXpaths[i])
        
                    makeTextSmall(x, y, (i + 1).toString());

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
                else {
                    console.log("-------------------------")

                    // drawSingleCircle(nodes, i, offset, nodeXpaths)
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

                    let x = nodes[i].getBoundingClientRect().x - offset;
                    let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

                    let y = nodes[i].getBoundingClientRect().y - offset;
                    let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

                    // if (i == 32) {
                    //     console.log("x y :", x, " ", y)
                    // }
                    makeCircleSmall(x, y, i, 13, nodeXpaths[i]);
                    makeTextSmall(x, y, (i + 1).toString());

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
            // else if (nodesErrors[i] != null) {
            //     console.log("ALI WAS HERE")
            //     drawSingleCircle(nodesErrors, i, offset, nodeXpathsErrors)

            // }
            // else {
            //     //Skip
            // }
        }

    }, 1)
}

// function drawSingleCircle(nodes: any[], i: any, offset: any, nodeXpaths: any) {
//     let slope = (nodes[i + 1].getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nodes[i + 1].getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)

//     makeLine(nodes[i].getBoundingClientRect().x - offset,
//         nodes[i].getBoundingClientRect().y - offset,
//         nodes[i + 1].getBoundingClientRect().x - offset,
//         nodes[i + 1].getBoundingClientRect().y - offset, ["line"]);

//     // Create white outline
//     if (Math.abs(slope) < 1) {  // Low slope move y
//         makeLine(nodes[i].getBoundingClientRect().x - offset,
//             nodes[i].getBoundingClientRect().y - offset - 1,
//             nodes[i + 1].getBoundingClientRect().x - offset,
//             nodes[i + 1].getBoundingClientRect().y - offset - 1, ["lineEmboss"]);

//         makeLine(nodes[i].getBoundingClientRect().x - offset,
//             nodes[i].getBoundingClientRect().y - offset + 1,
//             nodes[i + 1].getBoundingClientRect().x - offset,
//             nodes[i + 1].getBoundingClientRect().y - offset + 1, ["lineEmboss"]);

//     } else { // high slope move x
//         makeLine(nodes[i].getBoundingClientRect().x - offset - 1,
//             nodes[i].getBoundingClientRect().y - offset,
//             nodes[i + 1].getBoundingClientRect().x - offset - 1,
//             nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);

//         makeLine(nodes[i].getBoundingClientRect().x - offset + 1,
//             nodes[i].getBoundingClientRect().y - offset,
//             nodes[i + 1].getBoundingClientRect().x - offset + 1,
//             nodes[i + 1].getBoundingClientRect().y - offset, ["lineEmboss"]);
//     }

//     let x = nodes[i].getBoundingClientRect().x - offset;
//     let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

//     let y = nodes[i].getBoundingClientRect().y - offset;
//     let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

//     // if (i == 32) {
//     //     console.log("x y :", x, " ", y)
//     // }
//     makeCircleSmall(x, y, i, 13, nodeXpaths[i]);
//     makeTextSmall(x, y, (i + 1).toString());

//     // Make box around active component
//     makeLine(x, y, xPlusWidth, y, ["line", "lineTop", "lineNumber" + i]);
//     makeLine(x, y, x, yPlusHeight, ["line", "lineLeft", "lineNumber" + i]);
//     makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, ["line", "lineRight", "lineNumber" + i]);
//     makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, ["line", "lineBottom", "lineNumber" + i]);


//     // Make white stroke around active component outline
//     makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, ["lineEmboss"]);
//     makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, ["lineEmboss"]);
//     makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);
//     makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, ["lineEmboss"]);

//     // Make white stroke inside active component outline
//     makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, ["lineEmboss"]);
//     makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, ["lineEmboss"]);
//     makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
//     makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, ["lineEmboss"]);
// }


function makeIcon(x1: number, y1: number, iconName: string) {
    iconName = iconName; // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."
    var iconClone = createSVGErrorIconTemplate();
    iconClone.removeAttribute("display");
    iconClone.classList.remove("svgIcon1");
    iconClone.classList.add("svgIconTest");
    iconClone.classList.add("deleteMe");
    iconClone.style.position = "absolute";
    iconClone.style.left = String(x1) + "px";
    iconClone.style.top = String(y1) + "px";
    // (iconClone as HTMLElement).style.fill = "red";
    // (iconClone as HTMLElement).onclick = () => { alert("You have found an warning icon") };

    if (document.getElementById("svgIcons") == null) {
        var elemDIV = document.createElement('div');
        elemDIV.setAttribute("class", "svgIcons");
        document.body.appendChild(elemDIV);
    }
    document.getElementsByClassName('svgIcons')[0].appendChild(iconClone)
}


function makeCircleSmall(x1: number, y1: number, circleNumber: number, radius: number, xpath: string) {

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
    // circleClone.classList.add("dynamic");
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
    document.getElementById('svgCircle')?.appendChild(circleClone)
}

function makeTriangle(x1: number, y1: number, x2: number, y2: number,x3: number, y3: number, circleNumber: number, xpath: string) {
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

    // triangleClone.setAttribute('x1', String(x1));
    // triangleClone.setAttribute('y1', String(y1));
    // triangleClone.setAttribute('x2', String(x2));
    // triangleClone.setAttribute('y2', String(y2));
    // triangleClone.setAttribute('x3', String(x3));
    // triangleClone.setAttribute('y3', String(y3));
    triangleClone.setAttribute('pointer-events', "auto");
    triangleClone.onclick = () => {
        TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: xpath, circleNumber: circleNumber + 1 })
    };
    if (document.getElementById("svgCircle") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgCircle");
        document.body.appendChild(elemSVG);
    }
    document.getElementById('svgCircle')?.appendChild(triangleClone)
}



function makeTextSmall(x1: number, y1: number, n: string) {

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
    console.log("Inject triangle");
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
    // elemCircle.setAttribute("class", "tabTriangle");
    elemCircle.setAttribute("stroke", "grey");
    elemCircle.setAttribute("stroke-width", "1");
    elemCircle.setAttribute("fill", "yellow");
    return elemCircle
}


function createSVGCircleTemplate() {
    // console.log("Inject circle");
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
    // elemCircle.setAttribute("fill", "purple");
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

function createSVGErrorIconTemplate() {
    // This is what we are creating:
    // <svg class="svgIcon1" display = "none" xmlns = "http://www.w3.org/2000/svg" width = "12px" height = "12px" viewBox = "0 0 32 32" >
    //     <defs>
    //         <style> 
    //            .cls-1 { fill: none; } 
    //         </style>
    //     </defs >
    //     <path  class="cls-1" d = "M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z" style = "&#10;    fill: black;&#10;" />
    //     <path d="M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z" style = "&#10;    fill: yellow;&#10;" />
    //     <path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z" style = "&#10;    fill: black;&#10;" />
    //     <rect data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width = "32" height = "32" />
    // </svg>
    var elemSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    elemSvg.setAttribute("class", "svgIcon1");
    elemSvg.setAttribute("display", "none");
    elemSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    elemSvg.setAttribute("width", "12px");
    elemSvg.setAttribute("height", "12px");
    elemSvg.setAttribute("viewBox", "0 0 32 32");

    var elemDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    var elemStyle = document.createElement('style');
    elemStyle.innerText = ".cls-1 { fill: none; }"

    var elemPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    elemPath1.setAttribute("class", "cls-1");
    elemPath1.setAttribute("d", "M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z");
    elemPath1.setAttribute("style", "&#10;    fill: black;&#10;");

    var elemPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    elemPath2.setAttribute("d", "M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z");
    elemPath2.setAttribute("style", "&#10;    fill: yellow;&#10;");

    var elemPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    elemPath3.setAttribute("d", "M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z");
    elemPath3.setAttribute("style", "&#10;    fill: black;&#10;");

    var elemRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    elemRect.setAttribute("data-name", "&lt;Transparent Rectangle&gt;");
    elemRect.setAttribute("class", "cls-1");
    elemRect.setAttribute("width", "32");
    elemRect.setAttribute("height", "32");

    elemDefs.appendChild(elemStyle);
    elemSvg.appendChild(elemDefs);
    elemSvg.appendChild(elemPath1);
    elemSvg.appendChild(elemPath2);
    elemSvg.appendChild(elemPath3);
    elemSvg.appendChild(elemRect);
    return elemSvg;
}

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
            tabXpaths.push(result.path.dom);
        }
    });
    return tabXpaths;
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
