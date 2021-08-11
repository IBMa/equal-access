// import "./draw.scss";
// import { TabsSkeleton } from 'carbon-components-react';
import { tabbable } from 'tabbable';
import ContextScriptMessaging from "../util/contextScriptMessaging";
import TabMessaging from "../util/tabMessaging";
// import getAbsoluteXPath from "../util/xpath";
// import PanelMessaging from '../util/panelMessaging';


console.log("Content Script for drawing tab stops has loaded")

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS received in foreground")
    console.log(message)
    injectCSS(
        `#line {
                stroke-width: 5px;
                stroke: black;
            }`
    );
    injectCSS(
        `#svg1{
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
        }
        
        .highlightSVG{
            fill: blue
        }
        `
    );
    injectCSS(
        `#svg2{
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: visible;
        }
        .svgIconTest{
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            overflow: visible;
        }
        `
    );
    draw();
    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw();
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

function draw() {
    // console.log("Inside Draw function")
    insertSVGIntoBody()
    redraw()
}

function deleteDrawing(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}

function redraw() {
    console.log("redraw");
    setTimeout(() => {
        let nodes = getNodesToDrawBettween();
        console.log("nodes = ", nodes);

        // JCH - need for last line to return to first node
        for (let i = 0; i < nodes.length - 1; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2

            let centerX2 = nodes[i + 1].getBoundingClientRect().x + nodes[i + 1].getBoundingClientRect().width / 2
            let centerY2 = nodes[i + 1].getBoundingClientRect().y + nodes[i + 1].getBoundingClientRect().height / 2

            // console.log(centerX1, centerY1, centerX2, centerY2);
            makeLine(centerX1, centerY1, centerX2, centerY2);

        }

        for (let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

            makeCircle(centerX1, centerY1, i);
        }

        for (let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

            makeText(centerX1, centerY1, (i + 1).toString());
        }

        for (let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

            makeIcons(centerX1, centerY1, null);
        }


    }, 1)
}

function makeIcons(x1: number, y1: number, arrayOfIcons: any) {
    let numberOfIcons = 0; // TODO ALI Needs to be dynamically set, this the the array length of the icons that need to be shown should be set to arrayOfIcons.length
    let iconName = "" // TODO ALI Needs to be dynamically set, this is the name of the icon to draw  
    arrayOfIcons = arrayOfIcons // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."

    // Bias the icons to the center of the circles
    x1 = x1 + 15;
    y1 = y1 - 8;
    let iconBias = 16

    for (let i = 0; i < numberOfIcons; i++) {
        makeIcon(x1 + iconBias * i, y1, iconName);
    }

}

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

function makeCircle(x1: number, y1: number, circleNumber: number) {
    let circle = document.getElementsByClassName('tabCircle')[0]
    var circleClone = circle.cloneNode(true);
    (circleClone as HTMLElement).classList.add("deleteMe");
    (circleClone as HTMLElement).classList.add("circleNumber" + circleNumber);
    (circleClone as HTMLElement).setAttribute('cx', String(x1));
    (circleClone as HTMLElement).setAttribute('cy', String(y1));
    (circleClone as HTMLElement).setAttribute('r', String(15));
    document.getElementById('svg1')?.appendChild(circleClone)
}

function makeText(x1: number, y1: number, n: string) {
    let text = document.getElementsByClassName('circleText')[0]
    var textClone = text.cloneNode(true);
    (textClone as HTMLElement).classList.add("deleteMe");
    (textClone as HTMLElement).setAttribute('x', String(x1 - 3));
    (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
    (textClone as HTMLElement).innerHTML = n;
    document.getElementById('svg1')?.appendChild(textClone)
}

function makeLine(x1: number, y1: number, x2: number, y2: number) {
    let line = document.getElementsByClassName('tabLine')[0]
    var lineClone = line.cloneNode(true);
    (lineClone as HTMLElement).classList.add("deleteMe");
    (lineClone as HTMLElement).setAttribute('x1', String(x1));
    (lineClone as HTMLElement).setAttribute('y1', String(y1));
    (lineClone as HTMLElement).setAttribute('x2', String(x2));
    (lineClone as HTMLElement).setAttribute('y2', String(y2));
    document.getElementById('svg2')?.appendChild(lineClone);
}


function insertSVGIntoBody() {
    if (document.getElementById("svg2") == null) {
        document.body.innerHTML += '<svg id="svg2"><line id="line" class="tabLine"/></svg>'
    }

    if (document.getElementById("svg1") == null) {
        document.body.innerHTML += '<svg id="svg1"><circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/><text id="text" class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/></svg>'
    }

    // if (document.getElementById("svgIcon1") == null) {
    //     document.body.innerHTML += '<svg class="svgIcon1" display="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path d="M28,17v5H4V6H15V4H4A2,2,0,0,0,2,6V22a2,2,0,0,0,2,2h8v4H8v2H24V28H20V24h8a2,2,0,0,0,2-2V17ZM18,28H14V24h4Z" transform="translate(0 0)"/> <path d="M29,14H17a1,1,0,0,1-.8574-1.5144l6-10a1,1,0,0,1,1.7154,0l6,10A1,1,0,0,1,29,14ZM18.7661,12h8.4678L23,4.9436Z" transform="translate(0 0)"/> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"/> </svg>'
    // }

    if (document.getElementById("svgIcon1") == null) {
        document.body.innerHTML += '<svg class="svgIcon1" display="none" version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve"> <style type="text/css"> .st0{fill:none;} .st1{opacity:0;fill-opacity:0;} </style> <rect id="_Transparent_Rectangle_" class="st0" width="32" height="32"/> <path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9 l5.4,5.4L21.4,9l1.6,1.6L17.6,16l5.4,5.4L21.4,23z"/> <path id="inner-path" class="st1" d="M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9l5.4,5.4L21.4,9l1.6,1.6L17.6,16 l5.4,5.4L21.4,23z"/> </svg>'
    }

    if (document.getElementById("svgIcons") == null) {
        document.body.innerHTML += '<div class="svgIcons"> </div>'
    }

}

// TODO: JCH this funciton should get its data from tabStopsResults
// so need to message tabStopsResults from Panel to Background to Content script
// also you do not need to process xpaths anymore in that the xpaths in tabStopsResults
// are fully qualified Chrome xpaths
function getNodesToDrawBettween() {
    console.log("getNodesToDrawBettween");
    let tabStops = tabbable(document.body);

    console.log(tabStops);

    let xpathArray = [];
    for (let i = 0; i < tabStops.length; i++) {
        let singleXPath: any = {};
        singleXPath.xpath = getXPathForElement(tabStops[i])
        singleXPath.innerHTML = tabStops[i].innerHTML
        singleXPath.tagName = tabStops[i].tagName
        if (tabStops[i].children.length > 0) {
            singleXPath.name = tabStops[i].children[0].innerHTML
        } else {
            singleXPath.name = tabStops[i].innerHTML
        }
        // singleXPath.innerHTML = tabStops[i].innerHTML

        if (tabStops[i].tagName.toLowerCase() == "a") {
            singleXPath.role = "link"
        } else if (tabStops[i].tagName.toLowerCase() == "button") {
            singleXPath.role = "button"
        } else if (tabStops[i].tagName.toLowerCase() == "link") {
            singleXPath.role = "link"
        } else if (tabStops[i].tagName.toLowerCase() == "input") {
            singleXPath.role = "textbox"
        } else if (tabStops[i].tagName.toLowerCase() == "select") {
            singleXPath.role = "listbox"
        } else if (tabStops[i].tagName.toLowerCase() == "textarea") {
            singleXPath.role = "textbox"
        } else {
            singleXPath.role = ""
        }

        xpathArray[i] = singleXPath;
    }

    console.log("In the contentScripts and I am SEND_TABBING_DATA_TO_BACKGROUND");
    // TODO: JCH this is not needed anymore
    ContextScriptMessaging.sendToBackground("SEND_TABBING_DATA_TO_BACKGROUND", {tabStopsData: xpathArray})

    return tabStops;
}

function getXPathForElement(element: any) {
    const idx: any = (sib: any, name: any) => sib
        ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
        : 1;
    const segs: any = (elm: any) => (!elm || elm.nodeType !== 1)
        ? ['']
        : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

// UNUSED xpath evaluation function:
// function getElementByXPath(path:any) { 
//     return (new XPathEvaluator()) 
//         .evaluate(path, document.documentElement, null, 
//                         XPathResult.FIRST_ORDERED_NODE_TYPE, null) 
//         .singleNodeValue; 
// } 
