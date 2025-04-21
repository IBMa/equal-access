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

interface MyObject {
    [key: string]: string; //  Any property with a string key will be a number
}

export class UtilAIContext {
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

    

   
    public static async getImageFile(imageURL: string): Promise<string> {

        const response = await axios.get(imageURL, { responseType: 'arraybuffer', });
        const imgBase64 = Buffer.from(response.data, 'binary').toString('base64');

        return imgBase64;
    }
    
      

    public static async image_alt_valid_Context(issue: IIssue) : Promise<string> {
        let inputValues = issue.messageArgs; // ["ai-Context", imgSrc] note: first arg ignored

        // const keys = ["isBase64", "image"];
        
        // Example usage:
        // const imagePath = chrome.runtime.getURL(inputValues[1]);
        const imageURL = "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud" + inputValues[1];
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
    
}