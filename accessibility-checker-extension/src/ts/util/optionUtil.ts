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

import { IArchiveDefinition } from '../background/helper/engineCache';


export default class OptionUtil {

    public static getRuleSetDate = (selected_archive_id: string | null, archives: IArchiveDefinition[] | null) => {

        if (selected_archive_id == null) {
            return null;
        }

        if (selected_archive_id == "latest") {
            var latestArchive = archives?.find((archive: any) => {
                return archive.latest == true;
            });

            return (
                latestArchive?.name.substring(
                    0,
                    latestArchive.name.indexOf("Deployment")
                ) + " Deployment"
            );
        } else if (selected_archive_id == "preview") {
            return "Preview (TBD)";
        } else {
            let selected_archive = archives?.find((archive: any) => {
                return archive.id == selected_archive_id;
            });

            return selected_archive?.name.substring(
                0,
                selected_archive.name.indexOf("Deployment")
            );
        }
    };

}
