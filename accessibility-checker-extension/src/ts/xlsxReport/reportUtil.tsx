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


export default class ReportUtil {

    public static download_file(download_file_blob: any, download_file_name: string) {

        //object url for blob object
        const url = URL.createObjectURL(download_file_blob);

        var temp_element = document.createElement("a");
        temp_element.href = url;
        temp_element.download = download_file_name;

        const clickHandler = () => {
            setTimeout(() => {
              URL.revokeObjectURL(url);
              removeEventListener('click', clickHandler);
            }, 150);
          };

        
        temp_element.addEventListener('click', clickHandler, false);

        var mouse_event = document.createEvent('MouseEvents');
        mouse_event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        temp_element.dispatchEvent(mouse_event);
    };

    public static single_page_report_file_name(tab_title: string){

        var tab_title_substring = tab_title ? tab_title.substring(0, 50) : "";
        var file_name = "IBM_Equal_Access_Accessibility_Checker_Report_for_Page---" + tab_title_substring + ".xlsx";

        //replace illegal characters in file name
        file_name = file_name.replace(/[/\\?%*:|"<>]/g, '-');

        return file_name;
    }

}




