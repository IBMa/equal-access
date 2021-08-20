// import "./draw.scss";
// import { TabsSkeleton } from 'carbon-components-react';
// import ContextScriptMessaging from "../util/contextScriptMessaging";
import TabMessaging from "../util/tabMessaging";
// import getAbsoluteXPath from "../util/xpath";
// import PanelMessaging from '../util/panelMessaging';


console.log("Content Script for drawing tab stops has loaded")

TabMessaging.addListener("DRAW_TABS_TO_CONTEXT_SCRIPTS", async (message: any) => {
    console.log("Message DRAW_TABS_TO_CONTEXT_SCRIPTS received in foreground")
    console.log(message)
    injectCSS(
        `#line {
                stroke-width: 1px;
                stroke: black;
            }`
    );
    injectCSS(
        `#svgCircle{
            position: absolute;
            top: 0;
            left: 0;
            overflow: visible;
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
        }
        .svgIconTest{
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            overflow: visible;
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
    window.addEventListener('resize', function () {
        deleteDrawing(".deleteMe");
        redraw(message.tabStopsResults);
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

function draw(tabStopsResults:any) {
    // console.log("Inside Draw function")
    insertSVGIntoBody();
    redraw(tabStopsResults);
}

function deleteDrawing(classToRemove: string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}

function redraw(tabStopsResults:any) {
    console.log("redraw");
    setTimeout(() => {
        // let nodes = getNodesToDrawBettween();
        let nodes = getNodesXpaths(tabStopsResults);
        let offset = 3;
        nodes = convertXpathsToHtmlElements(nodes);
        console.log("nodes = ", nodes);

        // JCH - need for last line to return to first node
        for (let i = 0; i < nodes.length - 1; i++) {
            makeLine(nodes[i].getBoundingClientRect().x-offset, nodes[i].getBoundingClientRect().y-offset, nodes[i+1].getBoundingClientRect().x-offset, nodes[i+1].getBoundingClientRect().y-offset);
        }

        // for (let i = 0; i < nodes.length; i++) {
        //     let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
        //     let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

        //     makeCircle(centerX1, centerY1, i);
        // }

        // for (let i = 0; i < nodes.length; i++) {
        //     let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
        //     let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

        //     makeText(centerX1, centerY1, (i + 1).toString());
        // }

        // for (let i = 0; i < nodes.length; i++) {
        //     let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2;
        //     let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2;

        //     makeIcons(centerX1, centerY1, null);
        // }

        for (let i = 0; i < nodes.length; i++) {
            let x = nodes[i].getBoundingClientRect().x - offset;
            let xPlusWidth = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width +  offset;

            let y = nodes[i].getBoundingClientRect().y - offset;
            let yPlusHeight = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height + offset;

            if(i == 32){
                console.log("x y :",x ," ",y)
            }
            makeCircleSmall(x, y, i);
            makeTextSmall(x, y, (i + 1).toString());

            // makeLine(x, y, x+10, y+10);


            makeLine(x, y, xPlusWidth, y);
            makeLine(x, y, x, yPlusHeight);
            makeLine(xPlusWidth, y, xPlusWidth, yPlusHeight);
            makeLine(x, yPlusHeight, xPlusWidth, yPlusHeight);
            // console.log("x2 y2 :",x2 ," ",y2)
            if(i == 32){
                console.log("x y try2:",x ," ",y)
            }

            // if(i>=1){
                
                
            //     let h = nodes[i].getBoundingClientRect().height;
            //     let w = nodes[i].getBoundingClientRect().width;

            //     let y1 = (nodes[i-1].getBoundingClientRect().y + nodes[i-1].getBoundingClientRect().height)/2; 
            //     let y2 = (nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height)/2;
                
            //     let x1 = (nodes[i-1].getBoundingClientRect().x + nodes[i-1].getBoundingClientRect().width)/2; 
            //     let x2 = (nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width)/2;
                
            //     let s = (y2-y1)/(x2-x1);
                
            //     let hh = h/2;
            //     let hw = w/2;

            //     var hsw = s * w / 2;
            //     var hsh = ( h / 2 ) / s;
            
    
            //     let intersection = "";
            //     // if( (-h/2 <= s*w/2) && (s*w/2 <= h/2) ){
            //     if(-hh <= hsw && hsw <= hh){
            //             if(x2 < x1){
            //             intersection = "rightEdge"
            //         }else if(x2 > x1){
            //             intersection = "leftEdge"
            //         }
            //     }
            //     // if((-w/2 <= s*(h/2)) && (s*(h/2) <= w/2)){
            //     if(-hw <= hsh && hsh <= hw){
            //             if(y2 < y1){
            //             intersection = "topEdge"
            //         }else if(y2 > y1){
            //             intersection = "bottomEdge"
            //         }
            //     }
            //     console.log("---------------")

            //     console.log("s: ",s)
            //     console.log("s*w/2: ",s*w/2)
            //     console.log("s*(h/2): ", s*(h/2))
            //     console.log("(-h/2 <= s*w/2) :",(-h/2 <= s*w/2))
            //     console.log("(s*w/2 <= h/2) :",(s*w/2 <= h/2))

            //     console.log("-w/2 <= s*(h/2) :", -w/2 <= s*(h/2))
            //     console.log("(s*(h/2) <= w/2) :",(s*(h/2) <= w/2))
            //     console.log("x1 y1 :",x1 ," ",y1)
            //     console.log("x2 y2 :",x2 ," ",y2)
            //     console.log("index ",i+1,": ",intersection)
            // }



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

// function makeIcon(x1: number, y1: number, iconName: string) {
//     iconName = iconName; // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."
//     let icon = document.getElementsByClassName('svgIcon1')[0]
//     var iconClone = icon.cloneNode(true);
//     (iconClone as HTMLElement).removeAttribute("display");
//     (iconClone as HTMLElement).classList.remove("svgIcon1");
//     (iconClone as HTMLElement).classList.add("svgIconTest");
//     (iconClone as HTMLElement).classList.add("deleteMe");
//     (iconClone as HTMLElement).style.position = "absolute";
//     (iconClone as HTMLElement).style.left = String(x1) + "px";
//     (iconClone as HTMLElement).style.top = String(y1) + "px";
//     (iconClone as HTMLElement).style.fill = "red";
//     document.getElementsByClassName('svgIcons')[0].appendChild(iconClone)
// }


function makeCircleSmall(x1: number, y1: number, circleNumber: number) {
    if(circleNumber == 32){
        console.log("x y circle:",x1 ," ",y1)
    }

    let circle = document.getElementsByClassName('tabCircle')[0]
    var circleClone = circle.cloneNode(true);
    // (circleClone as HTMLElement).id = "circle"+circleNumber;
    (circleClone as HTMLElement).classList.add("deleteMe");
    (circleClone as HTMLElement).classList.add("circleNumber" + circleNumber);
    (circleClone as HTMLElement).setAttribute('cx', String(x1));
    (circleClone as HTMLElement).setAttribute('cy', String(y1));
    (circleClone as HTMLElement).setAttribute('r', String(7));
    (circleClone as HTMLElement).onclick = () => {alert("You have found circle number: " + (circleNumber +1))};
    document.getElementById('svgCircle')?.appendChild(circleClone)
}

function makeTextSmall(x1: number, y1: number, n: string) {
    let text = document.getElementsByClassName('circleText')[0]
    var textClone = text.cloneNode(true);
    (textClone as HTMLElement).classList.add("deleteMe");
    (textClone as HTMLElement).classList.add("circleSmall");
    (textClone as HTMLElement).setAttribute('x', String(x1 - 3));
    (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
    (textClone as HTMLElement).innerHTML = n;
    document.getElementById('svgCircle')?.appendChild(textClone)
}


// function makeCircle(x1: number, y1: number, circleNumber: number) {
//     let circle = document.getElementsByClassName('tabCircle')[0]
//     var circleClone = circle.cloneNode(true);
//     (circleClone as HTMLElement).classList.add("deleteMe");
//     (circleClone as HTMLElement).classList.add("circleNumber" + circleNumber);
//     (circleClone as HTMLElement).setAttribute('cx', String(x1));
//     (circleClone as HTMLElement).setAttribute('cy', String(y1));
//     (circleClone as HTMLElement).setAttribute('r', String(10));
//     (circleClone as HTMLElement).onclick = () => {alert("You have found circle number: " + (circleNumber +1))};
//     document.getElementById('svgCircle')?.appendChild(circleClone)
// }

// function makeText(x1: number, y1: number, n: string) {
//     let text = document.getElementsByClassName('circleText')[0]
//     var textClone = text.cloneNode(true);
//     (textClone as HTMLElement).classList.add("deleteMe");
//     (textClone as HTMLElement).setAttribute('x', String(x1 - 3));
//     (textClone as HTMLElement).setAttribute('y', String(y1 + 2));
//     (textClone as HTMLElement).innerHTML = n;
//     document.getElementById('svgCircle')?.appendChild(textClone)
// }

function makeLine(x1: number, y1: number, x2: number, y2: number) {
    let line = document.getElementsByClassName('tabLine')[0]
    var lineClone = line.cloneNode(true);
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

function convertXpathsToHtmlElements(nodes:any){
    let results: any = [];
    nodes.map((elem: any) => {
        results.push(document.evaluate(elem, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    });
    return results;
}

function getNodesXpaths(nodes:any) {
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
