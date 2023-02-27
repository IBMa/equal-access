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

import TabMessaging from "../util/tabMessaging";

export default class TabStopCircle {

    // This is what we are making:
    //  <circle class="tabCircle dynamic deleteMe circleNumber0 nohighlightSVGcircle" stroke="#D9BFFF" stroke-width="3" 
    //          pointer-events="auto" cx="15" cy="15" r="13" xpath="/html[1]/body[1]/div[1]/header[1]/a[1]">
    //  </circle>
    public static makeCircle(x1: number, y1: number, circleNumber: string, radius: number, xpath: string, errorStatus: boolean) {
        var circleClone = this.circleTemplate();
        circleClone.classList.add("circleNumber" + circleNumber);
        circleClone.setAttribute('cx', String(x1));
        circleClone.setAttribute('cy', String(y1));
        circleClone.setAttribute('r', String(radius));
        circleClone.setAttribute('xpath', xpath);
        if (errorStatus === true) {
            circleClone.classList.add("error");
            circleClone.classList.add("nohighlightSVGerrorCircle");
        } else {
            circleClone.classList.add("nohighlightSVGcircle");
        }
       
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
    
    private static circleTemplate() {
        // This is what we are creating:
        //     <circle id="circle" class="tabCircle" stroke="black" stroke-width="1" fill="purple"/>
        var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        elemCircle.setAttribute("class", "tabCircle");
        elemCircle.classList.add("dynamic");
        elemCircle.setAttribute("stroke", "#D9BFFF");
        elemCircle.setAttribute("stroke-width", "3");
        elemCircle.setAttribute('pointer-events', "auto");
        elemCircle.classList.add("deleteMe");
        return elemCircle
    }

}

















