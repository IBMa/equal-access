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

import { IIssue } from '../interfaces/interfaces';
import axios from 'axios';
import { Buffer } from 'buffer';
// import { getBGController } from '../background/backgroundController';



interface MyObject {
    [key: string]: string; //  Any property with a string key will be a number
}

export class UtilAIContext {

    /*
     *  AI Rule 1: text_contrast_sufficient
     *
     *             For this rule we used the existing rule context for the ai context
     */
    public static text_contrast_sufficient_Context(issue: IIssue) : any {
        let inputValues = issue.messageArgs; // ['2.93', 32, 400, '#9188ff', '#ffffff', false, false]
        // don't need first entry in array
        inputValues.shift();
        // inputValues now [32, 400, '#9188ff', '#ffffff', false, false]
        const stringInputValues = inputValues.map(String); // ["32", "400", "#9188ff", "#ffffff", "false", "false"]

        const keys = ["fontSize", "fontWeight", "fgColor", "bgColor", "hasBGImage", "hasGradient"];
        
        let jsonObject : MyObject = {};
        if (issue.messageArgs.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                jsonObject[keys[i]] = stringInputValues[i];
            }
            // let jsonString = JSON.stringify(jsonObject)
            return jsonObject;
        } else {
            console.log("Error: cannot form text_contrast_sufficient_Context");
            return ("Error: cannot form text_contrast_sufficient_Context");
        }   
    }

    /*
     *  AI Rule 2: image_alt_valid
     *
     *             JOHO added ai context to this rule to provide the url of the image.
     */    

    public static async getImageFile(imageURL: string): Promise<string> {

        const response = await axios.get(imageURL, { responseType: 'arraybuffer', });
        const imgBase64 = Buffer.from(response.data, 'binary').toString('base64');

        return imgBase64;
    }
    
      

    public static async image_alt_valid_Context(issue: IIssue) : Promise<any> {
        let inputValues = issue.messageArgs; // ["ai-Context", imgSrc] note: first arg ignored

        // const keys = ["isBase64", "image"];
        
        // Example usage:
        // const imagePath = chrome.runtime.getURL(inputValues[1]);
        const imageURL = inputValues[1];
        console.log("imageURL = ", imageURL);

        // get file extension
        let extension = inputValues[1].substring(inputValues[1].lastIndexOf('.') + 1);
        console.log('File extension:', extension);

        let imageBase64 = "";
        let imageBase64Config = "data:image/" + extension + ";base64,";
        console.log("imageBase64Config = ", imageBase64Config.toString());
        
        await this.getImageFile(imageURL).then(result => {
            console.log("*** result *** = \n",result);
            imageBase64 = imageBase64Config + result;
            console.log("imageBase64Config + result = \n", imageBase64);
            imageBase64 = JSON.stringify(imageBase64);
            console.log("imageBase64 = \n", imageBase64);
        });
        if (issue.messageArgs.length > 1) { // want 2nd value
            let jsonString = `{"isBase64": true, "image": ${imageBase64} }`;
            console.log("jsonString = ", jsonString);
            let jsonObject = Object.assign({}, JSON.parse(jsonString));
            console.log("***** jsonObject ***** = \n", jsonObject);
            // let aiContext = JSON.stringify(jsonObject);
            // console.log("***** aiContext string ***** =\n", aiContext);
            return jsonObject;
        } else {
            console.log("Error: cannot form text_contrast_sufficient_Context");
            return ("Error: cannot form text_contrast_sufficient_Context");
        }
    }

    /*
     *  AI Rule 3: element_tabbable_role_valid
     *
     *             There is no rule or ai context for this rule unless we find that we 
     *             can improve the accuracy or time by adding some.
     */  

    /*
     *  AI Rule 4: svg_graphics_labelled
     *
     *             There is no rule or ai context for this rule unless we find that we 
     *             can improve the accuracy or time by adding some.
     */

    /*
     *  AI Rule 5: a_text_purpose
     *
     *             Hyperlink has no link text, label or image with a text alternative
     *             
     *             
     */
    public static a_text_purpose_Context(issue: IIssue) : any {
        let inputValues = issue.messageArgs; // ['ai-Context', linkURL]
        
        console.log("inputValues = ", inputValues);
        const linkURL = inputValues[1];
        console.log("linkURL = ", linkURL);
        
        if (issue.messageArgs.length > 1) { // want 2nd value
            let jsonString = `{ "linkURL": "${linkURL}" }`;
            console.log("jsonString = ", jsonString);
            let jsonObject = Object.assign({}, JSON.parse(jsonString));
            console.log("***** jsonObject ***** = \n", jsonObject);
            // let aiContext = JSON.stringify(jsonObject);
            // console.log("***** aiContext string ***** =\n", aiContext);
            return jsonObject;
        } else {
            console.log("Error: cannot form a_text_purpose_Context");
            return ("Error: cannot form a_text_purpose_Context");
        }
    }
    

    /*
     *  AI Rule 6: html_lang_exists
     *
     *             Page detected as HTML, but does not have a 'lang' attribute
     *             
     *             We are going to start with to AI context items:
     *             1. the code snippet for the HTML element, i.e., the opening tag and
     *                its properties which will show the missing 'lang' attribute
     *             2. all the text content will be extracted into a string that can be
     *                analyzed by the 
     */
    public static html_lang_exists_Context() {
        // we need to send AI model all the text on the page to determine the language
        console.log("Func: html_lang_exists_Context");
        
        let pageText: string;
        let jsonObject: any;

        return new Promise ((resolve, _reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                const currentTab = tabs[0];
                chrome.scripting.executeScript({
                    //@ts-ignore
                    target: { tabId: currentTab.id },
                    func: () => {
                        return document.documentElement.innerText;
                    }
                }).then (results => {
                    if (results && results[0] && results[0].result) {
                        pageText = results[0].result;
                        // console.log("pageText = \n", pageText);
                        pageText = pageText.replace(/\s+/g, ' ');
                        pageText = UtilAIContext.limitWords(pageText);
                        // console.log("pageText = \n", pageText);
                        let jsonString = `{"pageText": "${pageText}" }`;
                        jsonObject = Object.assign({}, JSON.parse(jsonString));
                        console.log("***** jsonObject ***** = \n", jsonObject);
                        resolve(jsonObject); 
                        console.log("jsonObject done");
                    }
                });
            });
        });
    }
       

    public static limitWords(str: string) {
        const words = str.trim().split(/\s+/);
        if (words.length > 1000) {
          return words.slice(0, 1000).join(" ");
        }
        return str;
    }    
    


    /*
     *  AI Rule 7: aria_content_in_landmark
     *
     *             Page detected as HTML, but 'lang' attribute not valid
     *             
     *             There is no rule or ai context for this rule unless we find that we 
     *             can improve the accuracy or time by adding some.
     */
    

    // other violation rules in demo:
    //      aria_widget_labelled
    //      Rpt_Aria_InvalidTabindexForActivedescendant
    //      Rpt_Aria_ValidIdRef
    
}