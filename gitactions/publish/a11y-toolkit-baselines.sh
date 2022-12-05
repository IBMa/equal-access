#!/bin/bash
echo "Test rules against test able"
cd a11y-rule-benchmark
echo "Installing achecker"
npm install --save-dev accessibility-checker
echo "Scanning list of urls from listofUls.txt with baselines"
npx achecker --ruleArchive preview --baslineFolder /baselines listofUls.txt