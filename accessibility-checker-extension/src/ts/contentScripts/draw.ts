// import "./draw.scss";
// import { TabsSkeleton } from 'carbon-components-react';
import { tabbable } from 'tabbable';
import ContextScriptMessaging from "../util/contextScriptMessaging";
import TabMessaging from "../util/tabMessaging";
// import getAbsoluteXPath from "../util/xpath";
// import PanelMessaging from '../util/panelMessaging';


// console.log("Content Script for drawing tab stops has loaded")

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS recieved in foreground")
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
        }`
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
        }`
    );
    draw();
    window.addEventListener('resize', function () {
        clearLines(".deleteMe");
        redraw();
    })


    return true;
});

function clearLines(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}

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

function redraw() {
    setTimeout(() => {
        let nodes = getNodesToDrawBettween()

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

            makeCircle(centerX1, centerY1);
        }

        for (let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

            makeText(centerX1, centerY1, (i + 1).toString());
        }

    }, 1)
}

function makeCircle(x1: number, y1: number) {
    let circle = document.getElementsByClassName('tabCircle')[0]
    var circleClone = circle.cloneNode(true);
    (circleClone as HTMLElement).classList.add("deleteMe");
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

}


function getNodesToDrawBettween() {
    let tabStops = tabbable(document.body);

    console.log(chrome)

    let xpathArray = [];
    for (let i = 0; i < tabStops.length; i++){
        let singleXPath:any = {};
        singleXPath.xpath = getXPathForElement(tabStops[i])
        singleXPath.innerHTML = tabStops[i].innerHTML
        singleXPath.tagName = tabStops[i].tagName
        if (tabStops[i].children.length > 0) {
            singleXPath.name = tabStops[i].children[0].innerHTML
        }else{
            singleXPath.name = tabStops[i].innerHTML
        }
        // singleXPath.innerHTML = tabStops[i].innerHTML

        if(tabStops[i].tagName.toLowerCase() == "a"){
            singleXPath.role = "link"
        }else if(tabStops[i].tagName.toLowerCase() == "button"){
            singleXPath.role = "button"
        }else if(tabStops[i].tagName.toLowerCase() == "link"){
            singleXPath.role = "link"
        }else if(tabStops[i].tagName.toLowerCase() == "input"){
            singleXPath.role = "textbox"
        }else if(tabStops[i].tagName.toLowerCase() == "select"){
            singleXPath.role = "listbox"
        }else if(tabStops[i].tagName.toLowerCase() == "textarea"){
            singleXPath.role = "textbox"
        }else{
            singleXPath.role = ""
        }

        xpathArray[i] = singleXPath;
    }

    ContextScriptMessaging.sendToBackground("SEND_TABBING_DATA_TO_BACKGROUND", {tabStopsData: xpathArray})

    return tabStops;
}

function getXPathForElement(element:any) {
    const idx:any = (sib:any, name:any) => sib 
        ? idx(sib.previousElementSibling, name||sib.localName) + (sib.localName == name)
        : 1;
    const segs:any = (elm:any) => (!elm || elm.nodeType !== 1) 
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


