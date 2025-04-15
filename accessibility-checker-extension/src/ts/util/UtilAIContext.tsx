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

interface MyObject {
    [key: string]: string; //  Any property with a string key will be a number
}

export class UtilAIContext {
    public static text_contrast_sufficient_Context(issue: IIssue) : {} | undefined {
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
            return jsonObject;
        } else {
            console.log("Error: cannot form text_contrast_sufficient_Context");
            return ("Error: cannot form text_contrast_sufficient_Context");
        }   
    }

    public static toBase64(file: File) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          // @ts-ignore
          reader.onload = () => resolve(reader.result?.split(',')[1]); // Extracts the Base64 part
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
    }

    public static async fetchFile(url: string): Promise<File> {
        console.log("fetchFile: START");
        try {
            const response = await fetch(url);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const blob = await response.blob();
            const fileName = this.getFileNameFromUrl(url) || 'downloaded_file';
            const file = new File([blob], fileName, { type: blob.type });
            console.log("imageFile fetched: ",file);
            console.log("toBase64 = ", this.toBase64(file));
            console.log("fetchFile: RETURN");
            return file;
        } catch (error) {
            console.error("Error fetching file:", error);
            throw error;
        }
    }
    
    public static getFileNameFromUrl(url: string): string | null {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1];
    }
    
      

    public static image_alt_valid_Context(issue: IIssue) : {} | undefined {
        let inputValues = issue.messageArgs; // ["ai-Context", imgSrc] note: first arg ignored

        const keys = ["isBase64", "image"];
        
        // Example usage:
        // const imagePath = chrome.runtime.getURL(inputValues[1]);
        const imageURL = "https://altoromutual.12mc9fdq8fib.us-south.codeengine.appdomain.cloud" + inputValues[1];
        console.log("imageURL = ", imageURL);

        let imageFile = this.fetchFile(imageURL);
        console.log("File = ", imageFile);

        let jsonObject : MyObject = {};
        if (issue.messageArgs.length > 1) { // want 2nd value
            jsonObject[keys[0]] = "false"; 
            // @ts-ignore
            jsonObject[keys[1]] = imageURL;
            return jsonObject;
        } else {
            console.log("Error: cannot form text_contrast_sufficient_Context");
            return ("Error: cannot form text_contrast_sufficient_Context");
        }
    }
    
}