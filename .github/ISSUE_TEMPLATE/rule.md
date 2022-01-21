---
name: Rule
about: Create new rule or update existing
title: '[Rule Rsch]: '
labels: 'engine'
assignees: ''
---

### Rule description

_briefly describe the rule applicability (e.g, This rule checks for the Persistent requirement of information displayed on hover. It applies to any content that through CSS is displayed as a result of :hover)_

#### Relevant requirement
_Link to WCAG SC_

#### Relevant ACT rules
_Link to any relevant at https://act-rules.github.io/rules/_

<-- issue opener, optionally stop here and submit issue -->

---

<-- the remaining information can be completed by Checker team -->

### Approach

#### High-level approach

_provide very high level summary of rule approach (e.g., “Detect any hover of a target and flag a Needs Review (PV) to the Accessibility Checker user”)_

#### Rule scoping

_In a short paragraph, summarize the scope and approach of the rule._

#### Suggested rule ID
_type_property_test_

<-- Use the above format, where TYPE is the distinguishing name of the rule file, PROPERTY is the thing being tested, and TEST is the thing that is tested for. See [Checker-New-Rules-IDs-final.xlsx](https://ibm.ent.box.com/file/717584034994?s=kldsplaifciighv1eh3o4fygjw59gk3f) for examples. -->

#### Ruleset and failure level

- _Add which rulesets are applicable (e.g., WCAG 2.0, WCAG 2.1, IBM)_
- _For each rulset, indicate the expected overall failure level (e.g., Violation, Potential Violations, Recommendation)_

##### Possible future iterations

_Any scoping constraints for this interation or future possible iterations can be mentioned briefly_

#### Failure cases

_numbered text steps of rule logic. Example below_

1. _Is :hover used? No, pass; Yes, proceed_
2. _Is display being altered in relation with hover? No, pass; Yes, proceed_
3. _Is the element affected by display a direct child of the trigger element (the one with hover) Yes, pass; No, PV_

### Further documentation

_provide a link to documentation_

< -- This [template](https://ibm.box.com/s/mii0m4jvpf5gruyukamxh4gi1xr40h8b) can be used to create an initial documentation file  -->

### Demonstration

_provide code samples, preferably including a link to a functional example_
