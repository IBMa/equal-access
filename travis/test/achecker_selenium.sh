cd accessibility-checker-engine
npm install
npm run build
cd ..
cd accessibility-checker
npm install

npx mocha -R dot test/mocha/aChecker.Slow1/aChecker.Scans/**/*.test.js
res=$?;if [ $res != 0 ]; then exit $res; fi;
npx mocha -R dot test/mocha/aChecker.Slow1/aChecker.ObjectStructure/**/*.test.js
res=$?;if [ $res != 0 ]; then exit $res; fi;
