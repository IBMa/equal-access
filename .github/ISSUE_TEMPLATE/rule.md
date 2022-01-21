---
name: Rule
about: Create new rule or update existing
title: '[Rule Rsch]: '
labels: 'engine'
assignees: ''
---

body:
  - type: markdown
    attributes:
    value: |
      Thanks for suggesting a rule change!
  - type: input
    id: description
    attributes:
      label: Rule Description
      description: Briefly describe the rule applicability
      placeholder: ex. This rule checks for the Persistent requirement of information displayed on hover. It applies to any content that through CSS is displayed as a result of :hover
      validations:
        required: false
