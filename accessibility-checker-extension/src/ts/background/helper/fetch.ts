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

export default class Fetch {
    public static async json(filename: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            let oXHR = new XMLHttpRequest();
            oXHR.onreadystatechange = function() {
                if (oXHR.readyState === 4) {
                    if (oXHR.status === 200) {
                        try {
                            resolve(JSON.parse(this.responseText));
                        } catch (e) {
                            reject(e);
                        }
    
                    } else {
                        reject(this.responseText);
                    }
                }
            };
            oXHR.open("GET", filename);
            oXHR.setRequestHeader("Pragma", "Cache-Control: no-cache");
            oXHR.send();    
        })
    }

    public static async content(filename: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(this.responseText);
                } else {
                    reject(this.responseText);
                }
            });

            oReq.addEventListener("error", function() {
                reject("error: failed to load files from the rules server.");
            });

            oReq.open("GET", filename);
            oReq.setRequestHeader("Pragma", "Cache-Control: no-cache");
            oReq.send();
        });
    }
}