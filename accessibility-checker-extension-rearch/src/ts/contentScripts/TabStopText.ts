/******************************************************************************
  Copyright:: 2020- IBM, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*****************************************************************************/
export default class TabStopText {
    public static makeText(x1: number, y1: number, n: string, n2: string, textColorClassName?: string) {

        // TODO: Find possible better way to deal with this (Talk to design)
        // If the circle is being drawn slighly off of the screen move it into the screen
        if (x1 >= -10 && x1 <= 6) {
            x1 = 12;
        }
        if (y1 >= -10 && y1 <= 6) {
            y1 = 12;
        }
    
        // let text = document.getElementsByClassName('circleText')[0]
        var textClone = this.textTemplate();//text.cloneNode(true);
        textClone.removeAttribute("id");
        textClone.classList.add("deleteMe");
        textClone.classList.add("circleSmall");
        textClone.classList.add("noHighlightSVGText");
        textClone.classList.add("circleNumber"+n2)
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

    private static textTemplate() {
        // This is what we are creating:
        // <text class="circleText" font-family="helvetica"  font-size="10" font-weight="normal" fill="white"/>
        var elemText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        elemText.setAttribute("class", "circleText");
        elemText.setAttribute("font-family", "helvetica");
        elemText.setAttribute("font-size", "10");
        elemText.setAttribute("font-weight", "normal");
        elemText.setAttribute("fill", "white");
        return elemText
    }
}