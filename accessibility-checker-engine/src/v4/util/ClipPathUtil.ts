/******************************************************************************
  Copyright:: 2022- IBM, Inc
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

import { CacheUtil } from "./CacheUtil";
import { CSSUtil } from "./CSSUtil";

export class ClipPathUtil {
    
    private static THRESHOLD : number = 5;  // 5px
    /**
     * This function is responsible for checking if the node that is visually hidden by css clip-path:
     *
     * Note 1: If either current node or any of the parent nodes are visually hidden then this
     *          function will return true (node is not visually hidden).
     *
     * Note 2: nodes with CSS properties clip-path, the content is not considered hidden to an AT. Text hidden with these methods 
     *      can still be reedable by screen readers. 
     * Note 3: if a link, form control, or other focusable element is given this style, the element would be focusable but not visible, 
     *      keyboard users might be confused.    
     * 
     * @parm {Node} node The node which should be checked if it is visually hidden or not.
     * @return {bool} true if the node is visually hidden, false otherwise
     *
     * @memberOf VisUtil
     */
    public static isNodeVisuallyHiddenByClipPath(node: Node) : boolean {
        if (!node || node.nodeType !== 1) return false;
        
        let elem = node as HTMLElement;
        
        const hidden = CacheUtil.getCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", undefined);
        if (hidden !== undefined)
            return hidden;
            
        const style = CSSUtil.getComputedStyle(elem);
        const width = parseInt(style.width);  //always in px
        const height = parseInt(style.height); //always in px

        let path = style['clip-path']; 
        if (!path || path.trim() === 'none' || path.trim() === '')  {
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
            return false;
        }
        
        path = path.trim().replace(/\s+/g, ' ').toLowerCase();
        
        let index = path.indexOf("inset(");
        if (index !== -1) { 
            let round_index = path.indexOf("round");
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            if (round_index !== -1)
                str = path.substring(path.indexOf("(")+1, round_index);
            
            let numbers = str.trim().split(" ");
            // When one value is specified, it applies the same inset to all four sides
            if (numbers.length === 1)  {
                const ret = ClipPathUtil.isClippedByInset(elem, numbers[0], numbers[0], numbers[0], numbers[0]);
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", ret);
                return ret;
            }

            // When two values are specified, the first value applies to the top and bottom, the second to the left and right.
            if (numbers.length === 2) { 
                const ret = ClipPathUtil.isClippedByInset(elem, numbers[0], numbers[1], numbers[0], numbers[1]);
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", ret);
                return ret;         
            }

            // When three values are specified, the first applies to the top, the second to the right and left, the third to the bottom.
            if (numbers.length === 3) {
                const ret = ClipPathUtil.isClippedByInset(elem, numbers[0], numbers[1], numbers[1], numbers[2]); 
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", ret);
                return ret; 
            }

            // When four values are specified, the values apply to the top, right, bottom, and left in that order (clockwise).
            if (numbers.length === 4) {
                const ret = ClipPathUtil.isClippedByInset(elem, numbers[0], numbers[1], numbers[2], numbers[3]); 
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", ret);
                return ret;
            }     

        }
        
        index = path.indexOf("rect(");
        if (index !== -1) {
            let round_index = path.indexOf("round");
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            if (round_index !== -1)
                str = path.substring(path.indexOf("(")+1, round_index);

            let numbers = str.trim().split(" ");
            
            /**
             * The first (top) and third (bottom) values are distances from the top edge of the containing block, 
             * and the second (right) and fourth (left) values are distances from the left edge of the containing block. 
             * The second (right) and third (bottom) values are clamped by the fourth (left) and first (top) values, respectively, 
             *
             * If auto is used for the first (top) or fourth (left) value, the value of auto is 0, 
             * and if used for the second (right) or third (bottom) value, the value of auto is 100%.
            */
            if (numbers[0]==='auto') numbers[0] = '0px';
            if (numbers[3]==='auto') numbers[3] = '0px';
            if (numbers[1]==='auto') numbers[1] = '100%';
            if (numbers[2]==='auto') numbers[2] = '100%';

            // to prevent the bottom edge from crossing over the top edge and right edge from crossing over the left edge. 
            // for example, rect(10px 0 0 20px) is clamped to rect(10px 20px 10px 20px)
            if (numbers[2] < numbers[0] ) numbers[2] = numbers[0];
            if (numbers[1] < numbers[3] ) numbers[1] = numbers[3];
            
            let top = parseInt(numbers[0]);
            if (isNaN(top)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[0].endsWith("%"))
                top = top * height/100;
            else {
                let pair = CSSUtil.getValueUnitPair(top);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                top = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            } 
            if (top >= height) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }
            
            let left = parseInt(numbers[3]);
            if (isNaN(left)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }
            
            if (numbers[3].endsWith("%"))
                left = left * width/100;
            else {
                let pair = CSSUtil.getValueUnitPair(left);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                left = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            if (left >= width) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            let right = parseInt(numbers[1]);
            if (isNaN(right)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[1].endsWith("%"))
                right = right * width/100;
            else {
                let pair = CSSUtil.getValueUnitPair(right);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                right = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            
            let bottom = parseInt(numbers[2]);
            if (isNaN(bottom)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[2].endsWith("%"))
                bottom = bottom * height/100;
            else {
                let pair = CSSUtil.getValueUnitPair(bottom);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                bottom = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            
            if ((bottom - top) <= ClipPathUtil.THRESHOLD  || (right - left) <= ClipPathUtil.THRESHOLD) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                return true;
            }
            
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
            return false;                
        }

        index = path.indexOf("xywh(");
        if (index !== -1) {
            let round_index = path.indexOf("round");
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            if (round_index !== -1)
                str = path.substring(path.indexOf("(")+1, round_index);

            let numbers = str.trim().split(" ");

            let x = parseInt(numbers[0]);
            if (isNaN(x)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[0].endsWith("%"))
                x = x * width/100;
            else {
                let pair = CSSUtil.getValueUnitPair(top);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                x = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            if (x >= width) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }
            
            let y = parseInt(numbers[1]);
            if (isNaN(y)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }
            
            if (numbers[1].endsWith("%"))
                y = y * height/100;
            else {
                let pair = CSSUtil.getValueUnitPair(y);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                scrollY = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            if (y >= height) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            let w = parseInt(numbers[2]);
            if (isNaN(w)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[2].endsWith("%"))
                w = w * width/100;
            else {
                let pair = CSSUtil.getValueUnitPair(w);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                w = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            if (w <= ClipPathUtil.THRESHOLD) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                return true;
            }
            
            let h = parseInt(numbers[3]);
            if (isNaN(h)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[3].endsWith("%"))
                h = h * height/100;
            else {
                let pair = CSSUtil.getValueUnitPair(h);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                h = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }
            
            if (h <= ClipPathUtil.THRESHOLD) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                return true;
            }
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
            return false;                
        }

        index = path.indexOf("circle(");
        if (index !== -1) {
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            let numbers = str.trim().split(" ");
            
            let radius = parseInt(numbers[0]);
            if (isNaN(radius)) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            if (numbers[0].endsWith("%")) {
                let short = width > height ? height : width;
                radius = radius * short/100;
            } else {
                const pair = CSSUtil.getValueUnitPair(radius);
                if (!pair) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }
                radius = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
            }

            if (radius <= ClipPathUtil.THRESHOLD) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                return true;
            }
            
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
            return false;  
        }    
        
        index = path.indexOf("ellipse(");
        if (index !== -1) {
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            let numbers = str.trim().split(" ");

            // ellipse(closest-side farthest-side at 30% 40%);
            if (numbers.length > 3 && numbers[0] === 'closest-side' && numbers[1] === 'farthest-side' && numbers[2] === 'at') {
                let radius = parseInt(numbers[3]);
                if (numbers.length === 4) {
                    if (numbers[3].endsWith("%")) {
                        let value = width > height ? height : width;
                        radius = radius * value/100;
                    } else {
                        const pair = CSSUtil.getValueUnitPair(radius);
                        if (!pair) {
                            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                            return false;
                        }
                        radius = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
                    }
                    if (radius <= ClipPathUtil.THRESHOLD) {
                        CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                        return true;
                    }
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                             
                } else if (numbers.length === 5) {
                    for (let i=3; i < numbers.length; i++) {
                        let radius = parseInt(numbers[i]);
                        if (numbers[i].endsWith("%")) {
                            let value = (i === 3) ? width : height;
                            radius = radius * value/100;
                        } else {
                            const pair = CSSUtil.getValueUnitPair(radius);
                            if (!pair) {
                                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                                return false;
                            }
                            radius = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
                        }
                        if (radius <= ClipPathUtil.THRESHOLD) {
                            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                            return true;
                        }
                        
                        CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                        return false;
                    }           
                }     
                
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            // ellipse(40% 50% at left);
            let at_index = path.indexOf("at");
            str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            if (at_index !== -1)
                str = path.substring(path.indexOf("(")+1, at_index);

            numbers = str.trim().split(" ");
            if (numbers.length !== 2) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }

            for (let i=0; i < numbers.length; i++) {
                let radius = parseInt(numbers[i]);
                if (numbers[i].endsWith("%")) {
                    let value = (i === 0) ? width : height;
                    radius = radius * value/100;
                } else {
                    const pair = CSSUtil.getValueUnitPair(radius);
                    if (!pair) {
                        CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                        return false;
                    }
                    radius = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
                }
                if (radius <= ClipPathUtil.THRESHOLD) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
                    return true;
                }
                
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }            
           
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
            return false;
        }

        index = path.indexOf("polygon(");
        if (index !== -1) {
            let str = path.substring(path.indexOf("(")+1, path.indexOf(")"));
            let numbers = str.trim().split(",");
            
            // polygon(nonzero|evenodd, 0% 0%, 50% 50%, 0% 100%)
            if (numbers[0] === 'nonzero' || numbers[0] === 'evenodd')
                numbers.shift();

            let y = 0;
            let x = 0;
            let changed_x = false;
            let changed_y = false;
            for (let i=0; i < numbers.length; i++) {
                let coordinates = numbers[i].trim().split(" ");
                if (coordinates.length != 2 ) {
                    CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                    return false;
                }

                let coordinate_xy = [0, 0];
                for (let i =0; i < 2; i++) {
                    let value = parseInt(coordinates[i]);
                    if (isNaN(value)) return false;

                    if (coordinates[i].endsWith("%"))
                        coordinate_xy[i] = (i === 0) ? value * width/100 : value * height/100;
                    else {
                        const pair = CSSUtil.getValueUnitPair(coordinates[i]);
                        if (!pair) return false;
                        coordinate_xy[i] = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
                    }
                }
                if (i === 0) {
                    x = coordinate_xy[0];
                    y = coordinate_xy[1];
                } 

                if (Math.abs(coordinate_xy[0] - x) >= ClipPathUtil.THRESHOLD) 
                    changed_x = true;
                if (Math.abs(coordinate_xy[1] - y) >= ClipPathUtil.THRESHOLD) 
                    changed_y = true;
            }
            if (changed_x && changed_y) {
                CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
                return false;
            }  
            CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", true);
            return true;
        }      

        CacheUtil.setCache(elem, "PT_NODE_VISUALLY_HIDDEN_CLIPPATH", false);
        return false;
    }

    private static isClippedByInset(elem, top, right = '0px', bottom = '0px', left = '0px') {
        const style = CSSUtil.getComputedStyle(elem);
        const width = parseInt(style.width);  //always in px
        const height = parseInt(style.height); //always in px
        
        // top
        let top_value = parseInt(top);
        if (isNaN(top_value)) return false;

        if (top.endsWith("%"))
            top_value = top_value * height/100;
        else {
            const pair = CSSUtil.getValueUnitPair(top);
            if (!pair) return false;
            top_value = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
        }

        //inset outside of the container
        if (top_value > height) return false;

        // right
        let right_value = parseInt(right);
        if (isNaN(right_value)) return false;

        if (right.endsWith("%"))
            right_value = right_value * width/100;
        else {
            const pair = CSSUtil.getValueUnitPair(right);
            if (!pair) return false;
            right_value = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
        }
        //inset outside of the container
        if (right_value > width) return false;

        // bottom
        let bottom_value = parseInt(bottom);
        if (isNaN(bottom_value)) return false;

        if (bottom.endsWith("%"))
            bottom_value = bottom_value * height/100;
        else {
            const pair = CSSUtil.getValueUnitPair(bottom);
            if (!pair) return false;
            bottom_value = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
        }
        //inset outside of the container
        if (bottom_value > height) return false;

        // left
        let left_value = parseInt(left);
        if (isNaN(left_value)) return false;

        if (left.endsWith("%"))
            left_value = left_value * width/100;
        else {
            const pair = CSSUtil.getValueUnitPair(left);
            if (!pair) return false;
            left_value = CSSUtil.convertValue2Pixels(pair[0], pair[1], elem);
        }
        //inset outside of the container
        if (left_value > width) return false;

        if (height - (top_value + bottom_value) <= ClipPathUtil.THRESHOLD  || width - (right_value + left_value) <= ClipPathUtil.THRESHOLD) 
            return true;
        
        return false;
    }
}