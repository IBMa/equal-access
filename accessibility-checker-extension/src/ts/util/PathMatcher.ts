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

/**
 * Utility class for matching DOM paths.
 */
export class PathMatcher {
    /**
     * Check if a child path matches or is a descendant of a parent path.
     * 
     * @param childPath - The path to check (e.g., issue path from scanner)
     * @param parentPath - The parent path to match against (e.g., selected element path)
     * @returns true if childPath matches or is a descendant of parentPath
     */
    static matchesPath(childPath: string, parentPath: string): boolean {
        return childPath === parentPath || childPath.startsWith(parentPath + "/");
    }
}

