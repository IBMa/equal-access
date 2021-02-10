if [ -n "${GITHUB_REF:10}" ]; then
    cd ./cypress-accessibility-checker/package;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    echo "Deploy cypress-accessibility-checker version ${GITHUB_REF:10}...";
    ls -alh .
fi