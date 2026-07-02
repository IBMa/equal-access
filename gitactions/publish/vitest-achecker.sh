#!/bin/bash

# /******************************************************************************
#      Copyright:: 2026- IBM, Inc
# 
#     Licensed under the Apache License, Version 2.0 (the "License");
#     you may not use this file except in compliance with the License.
#     You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
#     Unless required by applicable law or agreed to in writing, software
#     distributed under the License is distributed on an "AS IS" BASIS,
#     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#     See the License for the specific language governing permissions and
#     limitations under the License.
#   *****************************************************************************/

# Publish vitest-accessibility-checker to npm
if [ -n "${GITHUB_REF:10}" ]; then
    cd ./vitest-accessibility-checker/package;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    NPM_VERSION="${GITHUB_REF:10}";
    echo "Deploy vitest-accessibility-checker version ${NPM_VERSION}...";
    npm --no-git-tag-version version ${NPM_VERSION};
    if [[ "${NPM_VERSION}" =~ "-rc" ]]; then
        npm publish --tag next;
    else
        npm publish;
    fi;
fi
