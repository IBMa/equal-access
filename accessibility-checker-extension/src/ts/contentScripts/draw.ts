// import { launch } from 'puppeteer';
// import "./draw.scss";
// import { TabsSkeleton } from 'carbon-components-react';
// import ContextScriptMessaging from "../util/contextScriptMessaging";
import TabMessaging from "../util/tabMessaging";
// import getAbsoluteXPath from "../util/xpath";
// import PanelMessaging from '../util/panelMessaging';


console.log("Content Script for drawing tab stops has loaded")

// var intervalTimer: any;

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
    draw(message.tabStopsResults);
    drawErrors(message.tabStopsErrors);
    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw(message.tabStopsResults);
        redrawErrors(message.tabStopsErrors)
        // clearInterval(intervalTimer)
    })

    // intervalTimer = setInterval(function () {
    //     let nodes = getNodesXpaths(message.tabStopsResults);
    //     nodes = convertXpathsToHtmlElements(nodes);
    //     nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
    //         return el != null;
    //     });

    //     for (let i = 0; i < nodes.length; i++) {
    //         let node = nodes[i]  //document.evaluate(message.tabStopsResults[i].path.dom, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    //         let line: any = document.getElementsByClassName('lineTop lineNumber'+i)[0]

    //         console.log("Evaluated noded",i," =", (node));
    //         console.log("Evaluated node: = ", (node as HTMLElement).getBoundingClientRect().y);
    //         console.log("Evaluated line y1: = ", line.y1.baseVal.value);

    //         if (Math.abs((node as HTMLElement).getBoundingClientRect().y - line.y1.baseVal.value) > 3) { // Set to 3 because the offset variable is set to 3
    //             deleteDrawing(".deleteMe");
    //             redraw(message.tabStopsResults);
    //             redrawErrors(message.tabStopsErrors)
    //             break;
    //         }

    //     }

    // }, 3000);



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
    redraw(tabStopsErrors);
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

            // makeCircleSmall(x, y, i, 7);
            // makeTextSmall(x, y, (i + 1).toString());


            // Make box around active component
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



function redraw(tabStopsResults: any) {
    console.log("Inside redraw")
    setTimeout(() => {
        // let nodes = getNodesToDrawBettween();
        let nodes = getNodesXpaths(tabStopsResults);
        let nodeXpaths = nodes;

        let offset = 3;
        nodes = convertXpathsToHtmlElements(nodes);
        nodes = nodes.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });
        nodeXpaths = nodeXpaths.filter(function (el: any) {  // Removing failure case of null nodes being sent
            return el != null;
        });

        console.log("tabbable nodes = ", nodes);

        // JCH - need for last line to return to first node
        for (let i = 0; i < nodes.length - 1; i++) { //Make lines between numbers
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


        for (let i = 0; i < nodes.length; i++) {
            let x = nodes[i].getBoundingClientRect().x - offset;
            let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width + offset;

            let y = nodes[i].getBoundingClientRect().y - offset;
            let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

            if (i == 32) {
                console.log("x y :", x, " ", y)
            }
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
    circleClone.setAttribute('cx', String(x1));
    circleClone.setAttribute('cy', String(y1));
    circleClone.setAttribute('pointer-events', "auto");
    circleClone.setAttribute('r', String(radius));
    circleClone.onclick = () => {
        TabMessaging.sendToBackground("TABSTOP_XPATH_ONCLICK", { xpath: xpath, circleNumber: circleNumber + 1 })
    };
    if (document.getElementById("svgCircle") == null) {
        const elemSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSVG.setAttribute("id", "svgCircle");
        document.body.appendChild(elemSVG);
    }
    document.getElementById('svgCircle')?.appendChild(circleClone)
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

function createSVGCircleTemplate() {
    // This is what we are creating:
    // <svg id="svgCircle">
    // THIS PART->     <circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/>
    //                 <text class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/>
    // </svg>
    var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    elemCircle.setAttribute("id", "circle");
    elemCircle.setAttribute("class", "tabCircle");
    elemCircle.setAttribute("stroke", "grey");
    elemCircle.setAttribute("stroke-width", "1");
    elemCircle.setAttribute("fill", "purple");
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
