---
name: 'Rule'
about: Create new rule or update existing
title: ''
labels: 'engine'
assignees: ''
---


<!-- Use this template if you want to create a new rule or add to an
existing rule.

If you are reporting a bug or problem, please use the bug template instead.

Replace italicized text -->

### Rule Description

**Purpose and goal:** _one-line description of rule applicability (e.g., “This rule applies to any content that through CSS is displayed as a result of :hover”)_

**Relevent requirement:** _Link to WCAG SC_

**Rule ID:** _type_property_test_
<!--
Use the above format, where:
•	type is the distinguishing name of the rule file where this rule ID is located. e.g. for a rule in rpt-aria-rules.ts file, the type is 'aria'.
•	property is the thing being tested, e.g. alt, label, structure, captions, on_click, color_use, summary, contrast, and
•	test is the thing that is tested for, e.g. exists? valid? grouped? related? unique? consistent? misuse? or review? (often used in some of the more general 'needs review' rules). 
•	See [Checker-New-Rules-IDs-final.xlsx](https://ibm.ent.box.com/file/717584034994?s=kldsplaifciighv1eh3o4fygjw59gk3f) for examples. Such as img_alt_exists, img_alt_misuse, figure_label_exists, etc.]
-->

### Approach

#### High-level approach

_provide very high level summary of rule approach (e.g., “Detect any hover of a target and flag a Needs Review (PV) to the Accessibility Checker user”)_

#### Proposed rule

_In a short paragraph, summary the scope and approach of the rule._

##### Possible iterations

Any scoping constraints for this interation or future possible iterations can be mentioned briefly_

#### Pseudo code

_numbered text steps of rule logic. Example below_

<!--
1.	Is :hover used? No, pass; Yes, proceed
1.	Is display being altered in relation with hover? No, pass; Yes, proceed
1.	Is the element affected by display a direct child of the trigger element (the one with hover) Yes, pass; No, PV
-->

### Further documentation

<!-- A boxnote for investigation is normally located at https://ibm.box.com/s/eep2on2xxyumeollzi4u3z0ji9auqyzf 

This [template](https://ibm.box.com/s/mii0m4jvpf5gruyukamxh4gi1xr40h8b) can be used to start documentation  -->

### Demonstration

_provide code samples, preferably including a link to a functional example_



<!-- Provide as much useful information as you can -->
