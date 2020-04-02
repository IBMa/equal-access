echo "Deploy karma-accessibility-checker version $TRAVIS_TAG..."
cd ./karma-accessibility-checker/src
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc
npm version $TRAVIS_TAG
npm publish