// import "./draw.scss";
// import { TabsSkeleton } from 'carbon-components-react';
// import ContextScriptMessaging from "../util/contextScriptMessaging";
import TabMessaging from "../util/tabMessaging";
// import getAbsoluteXPath from "../util/xpath";
// import PanelMessaging from '../util/panelMessaging';


console.log("Content Script for drawing tab stops has loaded")

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS received in foreground")
    console.log(message.tabStopsResults);
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
        `
    );
    injectCSS(
        `#svgCircle{
            position: absolute;
            top: 0;
            left: 0;
            overflow: visible;
            pointer-events: none;
            z-index: 2147483646 !important;
        }
        
        .highlightSVG{
            fill: blue
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
            position: absolute;
            top: 0;
            left: 0;
            overflow: visible;
            pointer-events: none;
            z-index: 2147483646 !important;
        }
        .svgIconTest{
            position: absolute;
            overflow: visible;
            pointer-events: none;
            z-index: 2147483646 !important;
        }
        .circleText{
            pointer-events: none;
        }

        .circleSmall{
            font-size: 7px;
        }
        `
    );
    draw(message.tabStopsResults);
    drawErrors(message.tabStopsErrors);
    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw(message.tabStopsResults);
        redrawErrors(message.tabStopsErrors)
    })


    return true;
});

TabMessaging.addListener("HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS", async (message: any) => {
    // console.log("Message HIGHLIGHT_TABSTOP_TO_CONTEXT_SCRIPTS recieved in foreground");
    // console.log(message);

    // Clearing any that are already highlighted
    document.querySelectorAll(".highlightSVG").forEach(e => e.classList.remove("highlightSVG"));
    // Highlighting any that are "clicked"
    document.getElementsByClassName("circleNumber" + message.tabStopId)[0].classList.add("highlightSVG");
    return true;
});

//@ts-ignore
TabMessaging.addListener("DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    // console.log("Message DELETE_DRAW_TABS_TO_CONTEXT_SCRIPTS recieved in foreground")
    // console.log(message)

    deleteDrawing(".deleteMe");
    return true;
});

function injectCSS(styleString: string) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

function draw(tabStopsErrors: any) {
    console.log("Inside draw")
    insertSVGIntoBody();
    redraw(tabStopsErrors);
}

function drawErrors(tabStopsErrors: any) {
    console.log("Inside drawErrors")
    // insertSVGIntoBody();
    redrawErrors(tabStopsErrors);
}

function deleteDrawing(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}


function redrawErrors(tabStopsErrors: any) {
    console.log("Inside redrawErrors")
    setTimeout(() => {
        console.log("tabbable error nodes = ", tabStopsErrors);
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

            if (i == 32) {
                console.log("x y :", x, " ", y)
            }
            // makeCircleSmall(x, y, i);
            // makeTextSmall(x, y, (i + 1).toString());
            
            
            // Make box around active component
            makeLine(x, y, xPlusWidth, y, "lineError");
            makeLine(x, y, x, yPlusHeight, "lineError");
            makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, "lineError");
            makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, "lineError");

            // Make white stroke around active component outline
            makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, "lineEmbossError");
            makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, "lineEmbossError");
            makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, "lineEmbossError");
            makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, "lineEmbossError");

            // Make white stroke inside active component outline
            makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, "lineEmbossError");
            makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, "lineEmbossError");
            makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, "lineEmbossError");
            makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, "lineEmbossError");

            makeIcon(xPlusWidth-6, y-6, "test");

        }



    }, 1)
}



function redraw(tabStopsResults: any) {
    console.log("Inside redraw")
    setTimeout(() => {
        // let nodes = getNodesToDrawBettween();
        let nodes = getNodesXpaths(tabStopsResults);
        let offset = 3;
        nodes = convertXpathsToHtmlElements(nodes);
        nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });

        console.log("tabbable nodes = ", nodes);

        // JCH - need for last line to return to first node
        for (let i = 0; i < nodes.length - 1; i++) { //Make lines between numbers
            let slope = (nodes[i + 1].getBoundingClientRect().y - offset - nodes[i].getBoundingClientRect().y - offset) / (nodes[i + 1].getBoundingClientRect().x - offset - nodes[i].getBoundingClientRect().x - offset)

            makeLine(nodes[i].getBoundingClientRect().x - offset,
                nodes[i].getBoundingClientRect().y - offset,
                nodes[i + 1].getBoundingClientRect().x - offset,
                nodes[i + 1].getBoundingClientRect().y - offset, "line");

            // Create white outline
            if (Math.abs(slope) < 1) {  // Low slope move y
                makeLine(nodes[i].getBoundingClientRect().x - offset,
                    nodes[i].getBoundingClientRect().y - offset - 1,
                    nodes[i + 1].getBoundingClientRect().x - offset,
                    nodes[i + 1].getBoundingClientRect().y - offset - 1, "lineEmboss");

                makeLine(nodes[i].getBoundingClientRect().x - offset,
                    nodes[i].getBoundingClientRect().y - offset + 1,
                    nodes[i + 1].getBoundingClientRect().x - offset,
                    nodes[i + 1].getBoundingClientRect().y - offset + 1, "lineEmboss");

            } else { // high slope move x
                makeLine(nodes[i].getBoundingClientRect().x - offset - 1,
                    nodes[i].getBoundingClientRect().y - offset,
                    nodes[i + 1].getBoundingClientRect().x - offset - 1,
                    nodes[i + 1].getBoundingClientRect().y - offset, "lineEmboss");

                makeLine(nodes[i].getBoundingClientRect().x - offset + 1,
                    nodes[i].getBoundingClientRect().y - offset,
                    nodes[i + 1].getBoundingClientRect().x - offset + 1,
                    nodes[i + 1].getBoundingClientRect().y - offset, "lineEmboss");
            }
        }


        for (let i = 0; i < nodes.length; i++) {
            let x = nodes[i].getBoundingClientRect().x - offset;
            let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

            let y = nodes[i].getBoundingClientRect().y - offset;
            let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

            if (i == 32) {
                console.log("x y :", x, " ", y)
            }
            makeCircleSmall(x, y, i);
            makeTextSmall(x, y, (i + 1).toString());

            // Make box around active component
            makeLine(x, y, xPlusWidth, y, "line");
            makeLine(x, y, x, yPlusHeight, "line");
            makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight, "line");
            makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight, "line");

            // Make white stroke around active component outline
            makeLine(x - 1, y - 1, xPlusWidth + 1, y - 1, "lineEmboss");
            makeLine(x - 1, y - 1, x - 1, yPlusHeight + 1, "lineEmboss");
            makeLine(xPlusWidth + 1, y - 1, xPlusWidth + 1, yPlusHeight + 1, "lineEmboss");
            makeLine(x - 1, yPlusHeight + 1, xPlusWidth + 1, yPlusHeight + 1, "lineEmboss");

            // Make white stroke inside active component outline
            makeLine(x + 1, y + 1, xPlusWidth - 1, y + 1, "lineEmboss");
            makeLine(x + 1, y + 1, x + 1, yPlusHeight - 1, "lineEmboss");
            makeLine(xPlusWidth - 1, y + 1, xPlusWidth - 1, yPlusHeight - 1, "lineEmboss");
            makeLine(x + 1, yPlusHeight - 1, xPlusWidth - 1, yPlusHeight - 1, "lineEmboss");
        }


    }, 1)
}

// function makeIcons(x1: number, y1: number, arrayOfIcons: any) {
//     let numberOfIcons = 0; // TODO ALI Needs to be dynamically set, this the the array length of the icons that need to be shown should be set to arrayOfIcons.length
//     let iconName = "" // TODO ALI Needs to be dynamically set, this is the name of the icon to draw  
//     arrayOfIcons = arrayOfIcons // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."

//     // Bias the icons to the center of the circles
//     x1 = x1 + 15;
//     y1 = y1 - 8;
//     let iconBias = 16

//     for (let i = 0; i < numberOfIcons; i++) {
//         makeIcon(x1 + iconBias * i, y1, iconName);
//     }

// }

function makeIcon(x1: number, y1: number, iconName: string) {
    iconName = iconName; // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."
    let icon = document.getElementsByClassName('svgIcon1')[0]
    var iconClone = icon.cloneNode(true);
    (iconClone as HTMLElement).removeAttribute("display");
    (iconClone as HTMLElement).classList.remove("svgIcon1");
    (iconClone as HTMLElement).classList.add("svgIconTest");
    (iconClone as HTMLElement).classList.add("deleteMe");
    (iconClone as HTMLElement).style.position = "absolute";
    (iconClone as HTMLElement).style.left = String(x1) + "px";
    (iconClone as HTMLElement).style.top = String(y1) + "px";
    (iconClone as HTMLElement).style.fill = "red";
    document.getElementsByClassName('svgIcons')[0].appendChild(iconClone)
}


function makeCircleSmall(x1: number, y1: number, circleNumber: number) {

    // TODO: Find possible better way to deal with this (Talk to design)
    // If the circle is being drawn slighly off of the screen move it into the screen
    if (x1 >= -10 && x1 <= 6) {
        x1 = 7;
    }
    if (y1 >= -10 && y1 <= 6) {
        y1 = 7;
    }

    let circle = document.getElementsByClassName('tabCircle')[0]
    var circleClone = circle.cloneNode(true);
    // (circleClone as HTMLElement).id = "circle"+circleNumber;
    (circleClone as HTMLElement).classList.add("deleteMe");
    (circleClone as HTMLElement).classList.add("circleNumber" + circleNumber);
    (circleClone as HTMLElement).setAttribute('cx', String(x1));
    (circleClone as HTMLElement).setAttribute('cy', String(y1));
    (circleClone as HTMLElement).setAttribute('pointer-events', "auto");
    (circleClone as HTMLElement).setAttribute('r', String(7));
    (circleClone as HTMLElement).onclick = () => { alert("You have found circle number: " + (circleNumber + 1)) };
    document.getElementById('svgCircle')?.appendChild(circleClone)
}

function makeTextSmall(x1: number, y1: number, n: string) {

    // TODO: Find possible better way to deal with this (Talk to design)
    // If the circle is being drawn slighly off of the screen move it into the screen
    if (x1 >= -10 && x1 <= 6) {
        x1 = 7;
    }
    if (y1 >= -10 && y1 <= 6) {
        y1 = 7;
    }

    let text = document.getElementsByClassName('circleText')[0]
    var textClone = text.cloneNode(true);
    (textClone as HTMLElement).classList.add("deleteMe");
    (textClone as HTMLElement).classList.add("circleSmall");

    if (n.length >= 3) { // If number has 3+ digits shift it a few more px to center it
        (textClone as HTMLElement).setAttribute('x', String(x1 - 6));
        (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
    } else if (n.length == 2) { // number has 2 digits
        (textClone as HTMLElement).setAttribute('x', String(x1 - 4));
        (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
    } else { // number has 1 digit
        (textClone as HTMLElement).setAttribute('x', String(x1 - 2));
        (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
    }
    (textClone as HTMLElement).innerHTML = n;
    document.getElementById('svgCircle')?.appendChild(textClone)
}

function makeLine(x1: number, y1: number, x2: number, y2: number, CSSclass?: string) {
    let line = document.getElementsByClassName('tabLine')[0]
    var lineClone = line.cloneNode(true);
    if (CSSclass) {
        (lineClone as HTMLElement).classList.add(CSSclass);
    }
    (lineClone as HTMLElement).classList.add("deleteMe");
    (lineClone as HTMLElement).setAttribute('x1', String(x1));
    (lineClone as HTMLElement).setAttribute('y1', String(y1));
    (lineClone as HTMLElement).setAttribute('x2', String(x2));
    (lineClone as HTMLElement).setAttribute('y2', String(y2));
    document.getElementById('svgLine')?.appendChild(lineClone);
}


function insertSVGIntoBody() {
    if (document.getElementById("svgLine") == null) {
        document.body.innerHTML += '<svg id="svgLine"><line id="line" class="tabLine"/></svg>'
    }

    if (document.getElementById("svgCircle") == null) {
        document.body.innerHTML += '<svg id="svgCircle"><circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/><text id="text" class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/></svg>'
    }

    if (document.getElementById("svgIcon1") == null) {
        document.body.innerHTML += '<svg class="svgIcon1" display="none" xmlns="http://www.w3.org/2000/svg" id="icon" width="12px" height="12px" viewBox="0 0 32 32"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path id="inner-path" class="cls-1" d="M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z" style="&#10;    fill: black;&#10;"/> <path d="M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z" style="&#10;    fill: yellow;&#10;"/> <path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z" style="&#10;    fill: black;&#10;"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>'
    }


    if (document.getElementById("svgIcons") == null) {
        document.body.innerHTML += '<div class="svgIcons"> </div>'
    }

}

function convertXpathsToHtmlElements(nodes: any) {
    let results: any = [];
    nodes.map((elem: any) => {
        results.push(document.evaluate(elem, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    });
    return results;
}

function getNodesXpaths(nodes: any) {
    let tabXpaths: any = [];
    nodes.map((result: any) => {
        tabXpaths.push(result.path.dom);
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
//     return segs(element).join('/');
// }

// UNUSED xpath evaluation function:
// function getElementByXPath(path:any) { 
//     return (new XPathEvaluator()) 
//         .evaluate(path, document.documentElement, null, 
//                         XPathResult.FIRST_ORDERED_NODE_TYPE, null) 
//         .singleNodeValue; 
// } 
