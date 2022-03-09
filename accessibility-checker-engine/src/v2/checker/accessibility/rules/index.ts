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

import { Rule, RuleDetails, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual } from "../../../api/IEngine";
import { a11yRulesCanvas } from "./rpt-canvas-rules";
import { a11yRulesFrame } from "./rpt-frame-rules";
import { a11yRulesMeta } from "./rpt-meta-rules";
import { a11yRulesColor } from "./rpt-color-rules";
import { a11yRulesHeading } from "./rpt-heading-rules";
import { a11yRulesCombobox } from "./rpt-combobox-rules";
import { a11yRulesHier } from "./rpt-hierarchy-rules";
import { a11yRulesObject } from "./rpt-object-rules";
import { a11yRulesElem } from "./rpt-elem-rules";
import { a11yRulesScript } from "./rpt-script-rules";
import { a11yRulesEmbed } from "./rpt-embed-rules";
import { a11yRulesImg } from "./rpt-img-rules";
import { a11yRulesSelect } from "./rpt-select-rules";
import { a11yRulesAria } from "./rpt-aria-rules";
import { a11yRulesFieldset } from "./rpt-fieldset-rules";
import { a11yRulesInput } from "./rpt-input-rules";
import { a11yRulesStyle } from "./rpt-style-rules";
import { a11yRulesLabeling } from "./rpt-ariaLabeling-rules";
import { a11yRulesFig } from "./rpt-figure-rules";
import { a11yRulesLabel } from "./rpt-label-rules";
import { a11yRulesTable } from "./table-rules";
import { a11yRulesFocus } from "./rpt-focus-rules";
import { a11yRulesList } from "./rpt-list-rules";
import { a11yRulesText } from "./rpt-text-rules";
import { a11yRulesBlockquote } from "./rpt-blockquote-rules";
import { a11yRulesFont } from "./rpt-font-rules";
import { a11yRulesMarquee } from "./rpt-marquee-rules";
import { a11yRulesTitle } from "./rpt-title-rules";
import { a11yRulesBody } from "./rpt-body-rules";
import { a11yRulesForm } from "./rpt-form-rules";
import { a11yRulesMedia } from "./rpt-media-rules";
import { a11yRulesVideo } from "./rpt-video-rules";

let a11yRules: Rule[] = [].concat(
    a11yRulesCanvas
    , a11yRulesFrame
    , a11yRulesMeta
    , a11yRulesColor
    , a11yRulesHeading
    , a11yRulesCombobox
    , a11yRulesHier
    , a11yRulesObject
    , a11yRulesElem
    , a11yRulesScript
    , a11yRulesEmbed
    , a11yRulesImg
    , a11yRulesSelect
    , a11yRulesAria
    , a11yRulesFieldset
    , a11yRulesInput
    , a11yRulesStyle
    , a11yRulesLabeling
    , a11yRulesFig
    , a11yRulesLabel
    , a11yRulesTable
    , a11yRulesFocus
    , a11yRulesList
    , a11yRulesText
    , a11yRulesBlockquote
    , a11yRulesFont
    , a11yRulesMarquee
    , a11yRulesTitle
    , a11yRulesBody
    , a11yRulesForm
    , a11yRulesMedia
    , a11yRulesVideo
);

export { a11yRules }
