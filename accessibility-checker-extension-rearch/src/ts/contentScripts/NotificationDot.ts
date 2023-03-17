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

export default class NotificationDot {
    // JCH - now we are working towards changing the Triangle to a Notification Dot
    public static makeNotificationDot(x1: number, y1: number, iconName: string) {
        // console.log("Function: NotificationDot.makeNotificationDot *********************");
        iconName = iconName; // TODO delete this line later. Added to remove typescript error "is declared but its value is never read."
        var iconClone = this.notificationDotTemplate();
        iconClone.removeAttribute("display");
        iconClone.classList.remove("svgIcon1");
        iconClone.classList.add("svgNotificationDot");
        iconClone.classList.add("deleteMe");
        iconClone.style.position = "absolute";
        iconClone.style.left = String(x1) + "px";
        iconClone.style.top = String(y1) + "px";

        if (document.getElementById("svgIcons") == null) {
            var elemDIV = document.createElement('div');
            elemDIV.setAttribute("class", "svgIcons");
            document.body.appendChild(elemDIV);
        }
        document.getElementsByClassName('svgIcons')[0].appendChild(iconClone)
    }

    private static notificationDotTemplate() {
        // This is what we are creating:
        // <svg class="svgNotificationDot deleteMe" xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 32 32" 
        //      stroke="#525252" stroke-width="1" style="position: absolute; left: 29px; top: 254px;"><circle id="circle" class="tabCircle dynamic" 
        //      stroke="black" stroke-width="1" r="12" fill="#FF8389"></circle>
        // </svg>
        var elemSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elemSvg.setAttribute("class", "svgIcon1");
        elemSvg.setAttribute("display", "none");
        elemSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        elemSvg.setAttribute("width", "12px");
        elemSvg.setAttribute("height", "12px");
        elemSvg.setAttribute("viewBox", "0 0 32 32"); // JCH how does viewBox affect off page
        elemSvg.setAttribute("stroke", "#525252");
        elemSvg.setAttribute("stroke-width", "1");
    
        var elemDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
        var elemStyle = document.createElement('style');
        elemStyle.innerText = ".cls-1 { fill: none; }"
    
        elemDefs.appendChild(elemStyle);
        
        var elemCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        elemCircle.setAttribute("id", "circle");
        elemCircle.setAttribute("class", "tabCircle");
        elemCircle.classList.add("dynamic");
        elemCircle.setAttribute("stroke", "black");
        elemCircle.setAttribute("stroke-width", "1");
        elemCircle.setAttribute('r', String("12"));
        elemCircle.setAttribute('fill','#FF8389');
        elemSvg.appendChild(elemCircle);
        return elemSvg;
    }
}