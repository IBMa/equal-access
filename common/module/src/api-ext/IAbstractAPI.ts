/******************************************************************************
    Copyright:: 2023- IBM, Inc

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

import { IBaselineReport, IBaselineResult } from "../engine/IReport";

/**
 * Interface for writing files
 */
export interface IAbstractAPI {
    /**
     * This method should ensure that the directory exists and write a file to the outputDir as specified by config.
     * @param filePath 
     * @param data 
     */
    writeFileSync(filePath: string, data: string | Buffer)
    prepFileSync(filePath: string) : string;
    
    loadBaseline(label: string): IBaselineReport | null;

    // Get the checker engine
    getChecker(): any

    info(...args: any[])

    log(...args: any[])

    error(...args: any[])

}