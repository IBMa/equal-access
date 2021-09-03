#!/bin/bash
#Script will help run local rule server this might take upto 12m.
#Wait until you see the url https://localhost:9445 
cd ../
npm install
cd rule-server
npm install
npm build
npm start 