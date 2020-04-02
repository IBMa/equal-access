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

window.__aChecker__ = window.__aChecker__ || {};
window.__aChecker__['JSONObjectStructureVerification.html'] = {
    "reports": [
        {
            "frameIdx": 0,
            "frameTitle": "Hello World",
            "issues": [
                {
                    "severityCode": "eISHigh",
                    "messageCode": "rpt.g377.elemUniqueId",
                    "ruleId": "377",
                    "help": "idhi_accessibility_check_g377.html",
                    "msgArgs": [
                        "div",
                        "firstDiv"
                    ],
                    "bounds": {
                        "left": 999,
                        "top": 999,
                        "height": 999,
                        "width": 999
                    },
                    "level": "violation",
                    "xpath": "/html[1]/body[1]/div[2]/div[2]",
                    "snippet": "<div id=\"firstDiv\">",
                    "ignored": false
                }
            ]
        }
    ],
    "summary": {
        "counts": {
            "violation": 1,
            "potentialviolation": 0,
            "recommendation": 0,
            "potentialrecommendation": 0,
            "manual": 0,
            "ignored": 0
        },
        "scanTime": 999,
        "policies": [
            "IBM_Accessibility"
        ],
        "reportLevels": [
            "violation",
            "potentialviolation",
            "recommendation",
            "potentialrecommendation",
            "manual"
        ],
        "startScan": 99999999999
    },
    "scanID": "uuid",
    "toolID": "karma-ibma",
    "label": "JSONObjectStructureVerification.html"
}