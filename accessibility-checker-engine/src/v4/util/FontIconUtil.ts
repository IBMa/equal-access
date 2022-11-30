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

import axios from "axios";

export class FontIconUtil {
    // only google material design icons for now
    public static url = "https://raw.githubusercontent.com/google/material-design-icons/master/font/MaterialIcons-Regular.codepoints";
    public static icon_names = [];
    // return a list of icon names from google's Material Design Icons     
    public static getFontIcons() { 
        if (FontIconUtil.icon_names.length === 0) { console.log("FontIconUtil.icon_names=" + FontIconUtil.icon_names);
            //let response = axios.get(FontIconUtil.url, { responseType: "text" });
            //console.log("response=" + response);
            axios.get(FontIconUtil.url, { responseType: "text", timeout: 2000 })
                 .then((response) => response);//{ 
                    /**console.log("response=" + response.status);
                    const data = response.data; 
                    if (data) { console.log("data=" + data);
                        for (let icon in data)
                            FontIconUtil.icon_names.push(icon);
                    }
                }).catch ((err) => {
                    console.log("error=" + err);
                });*/
        }
        return FontIconUtil.icon_names;
    }
}    

