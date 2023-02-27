export default class TabStopLine {
    public static makeLine(x1: number, y1: number, x2: number, y2: number, CSSclass?: string[]) {
        // console.log("Inject line");
        // let line = document.getElementsByClassName('tabLine')[0]
        var lineClone = this.lineTemplate()//line.cloneNode(true);
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

    private static lineTemplate() {
        // This is what we are creating:
        // <line class="tabLine line deleteMe" x1="15" y1="15" x2="64" y2="62"></line>
        var elemLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        elemLine.setAttribute("id", "line");
        elemLine.setAttribute("class", "tabLine");
        return elemLine
    }
    
}