// import "./draw.css";
import TabMessaging from "../util/tabMessaging";


console.log("ALIwashereDRAW -------------")
console.log("ALIWASHERE! draw.ts")

TabMessaging.addListener("DAP_CACHED2", async (message: any) => {
    console.log("ALIWASHERE! message DAP_CACHED2 recieved in foreground")
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
    window.addEventListener('resize',function(){
        clearLines(".deleteMe");
        redraw();
    })


    return true;
});




// chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
//     if (msg.action == 'EnableDraw') {
//         console.log("EnableDraw")
//         draw();
//         window.addEventListener('resize',function(){
//             clearLines(".deleteMe");
//             redraw();
//         })
//     } else if (msg.action == 'DisableDraw') {
//         console.log("DisableDraw")
//         clearLines(".deleteMe");
//     }
// });

function clearLines(classToRemove:string) {
    document.querySelectorAll(classToRemove).forEach(e => e.remove());
}

function injectCSS(styleString:string) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

function draw() {
    console.log("Inside Draw")
    insertSVGIntoBody()
    redraw()
}

function redraw() {
    // setTimeout(() => {
    //     let nodes = getNodesToDrawBettween()
    //     console.log("Checking nodes")
    //     console.log(nodes)
    //     for (let i = 0; i < nodes.length - 1; i++) {
    //         let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width / 2
    //         let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height / 2

    //         let centerX2 = nodes[i + 1].getBoundingClientRect().x + nodes[i + 1].getBoundingClientRect().width / 2
    //         let centerY2 = nodes[i + 1].getBoundingClientRect().y + nodes[i + 1].getBoundingClientRect().height / 2

    //         // console.log(centerX1, centerY1, centerX2, centerY2);
    //         makeLine(centerX1, centerY1, centerX2, centerY2)
    //     }
    // }, 1)
    setTimeout(()=>{
        let nodes = getNodesToDrawBettween()

        // JCH - need for last line to return to first node
        for(let i = 0; i < nodes.length-1; i++){
            console.log(nodes[i])   
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width/2
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height/2
    
            let centerX2 = nodes[i+1].getBoundingClientRect().x + nodes[i+1].getBoundingClientRect().width/2
            let centerY2 = nodes[i+1].getBoundingClientRect().y + nodes[i+1].getBoundingClientRect().height/2
    
            console.log(centerX1, centerY1, centerX2, centerY2);
            makeLine(centerX1, centerY1, centerX2, centerY2);

        }

        for(let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width/2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height/2;

            makeCircle(centerX1, centerY1);
        }

        for(let i = 0; i < nodes.length; i++) {
            let centerX1 = nodes[i].getBoundingClientRect().x + nodes[i].getBoundingClientRect().width/2;
            let centerY1 = nodes[i].getBoundingClientRect().y + nodes[i].getBoundingClientRect().height/2;

            makeText(centerX1, centerY1, (i+1).toString());
        }

    }, 1)
}

function makeCircle(x1: number,y1: number) {
    let circle = document.getElementsByClassName('tabCircle')[0]
    var circleClone = circle.cloneNode(true);
    (circleClone as HTMLElement).classList.add("deleteMe");
    (circleClone as HTMLElement).setAttribute('cx',String(x1) );
    (circleClone as HTMLElement).setAttribute('cy',String(y1) );
    (circleClone as HTMLElement).setAttribute('r', String(15) );
    document.getElementById('svg1')?.appendChild(circleClone)
}

function makeText(x1: number,y1: number,n: string) {
    let text = document.getElementsByClassName('circleText')[0]
    var textClone = text.cloneNode(true);
    (textClone as HTMLElement).classList.add("deleteMe");
    (textClone as HTMLElement).setAttribute('x',String(x1-3) );
    (textClone as HTMLElement).setAttribute('y',String(y1+2) );
    (textClone as HTMLElement).innerHTML = n;
    document.getElementById('svg1')?.appendChild(textClone)
}

function makeLine(x1: number,y1: number,x2: number,y2: number) {
    let line = document.getElementsByClassName('tabLine')[0]
    var lineClone = line.cloneNode(true);
    (lineClone as HTMLElement).classList.add("deleteMe");
    (lineClone as HTMLElement).setAttribute('x1',String(x1));
    (lineClone as HTMLElement).setAttribute('y1',String(y1));
    (lineClone as HTMLElement).setAttribute('x2',String(x2));
    (lineClone as HTMLElement).setAttribute('y2',String(y2));
    document.getElementById('svg2')?.appendChild(lineClone);
}


// function makeLine(x1: number, y1: number, x2: number, y2: number) {
//     // TODO make a circle and then draw line
//     let line = document.getElementsByClassName('original')[0]
//     var lineClone = line.cloneNode(true);
//     (lineClone as HTMLElement).classList.add("deleteMe");
//     (lineClone as HTMLElement).setAttribute('x1', x1.toString());
//     (lineClone as HTMLElement).setAttribute('y1', y1.toString());
//     (lineClone as HTMLElement).setAttribute('x2', x2.toString());
//     (lineClone as HTMLElement).setAttribute('y2', y2.toString());
//     document.getElementById('svg')?.appendChild(lineClone);
// }


// function insertSVGIntoBody() {
//     console.log("insertSVGIntoBody")
//     if (document.getElementById("svg") == null) {
//         document.body.innerHTML += '<svg id="svg"><line id="line" class="line   original" stroke-dasharray="5, 5"/></svg>'
//     }
// }
function insertSVGIntoBody(){
    if (document.getElementById("svg2") == null) {
        document.body.innerHTML += '<svg id="svg2"><line id="line" class="tabLine"/></svg>'
    }

    if (document.getElementById("svg1") == null) {
    document.body.innerHTML += '<svg id="svg1"><circle id="circle" class="tabCircle" stroke="grey" stroke-width="1" fill="purple"/><text id="text" class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/></svg>'
    }

}

function getNodesToDrawBettween() { // Replace for isTabbable later TODO ask Tom if the return value if isTabbale ordered correctly for drawing 
    console.log("getNodesToDrawBettween")
    return document.querySelectorAll("a")
}

// function getNodesToDrawBettween(){ // Replace for isTabbable later TODO ask Tom if the return value if isTabbale ordered correctly for drawing 
//     tabStops = tabbable(document.body);
//     return tabStops;
// }