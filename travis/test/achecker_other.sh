cd accessibility-checker-engine
npm install
npm run build
cd ..
cd accessibility-checker
npm install

npx mocha -R dot test/mocha/aChecker.Fast/**/*.test.js
