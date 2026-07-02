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
     * Returns true if the issue element is the selected element or a descendant
     * of it — i.e. the issue path equals the selected path or starts with it.
     *
     * Ancestor matching (selectedPath.startsWith(issuePath)) is intentionally
     * excluded: when the user selects a specific element they only want to see
     * issues on that element and its children, not on its ancestors.
     *
     * @param issuePath    - The DOM path of the issue (from the scanner result)
     * @param selectedPath - The DOM path of the currently selected element
     */
    static matchesPath(issuePath: string, selectedPath: string): boolean {
        return issuePath === selectedPath
            || issuePath.startsWith(selectedPath + "/");
    }
}

