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

import { Bounds } from "../interfaces/interfaces";

export class ElementUtils {
    static getBounds(node: Node, forScreenShot: boolean) : Bounds | null {
        if (node && node.nodeType === 1 /*Node.ELEMENT_NODE*/) {
            let adjustment = 1;
            if (forScreenShot && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.devicePixelRatio) {
                adjustment = node.ownerDocument.defaultView.devicePixelRatio;
            }
            let bounds = (node as Element).getBoundingClientRect();

            // Do a check whether bounds has value as we use different tool (htmlUnit, browser) to call this function
            if (bounds) {
                return {
                    "left": Math.ceil(bounds.left * adjustment)+window.scrollX,
                    "top": Math.ceil(bounds.top * adjustment)+window.scrollY,
                    "height": Math.ceil(bounds.height * adjustment),
                    "width": Math.ceil(bounds.width * adjustment)
                };
            }
        }

        return null;
    }
}