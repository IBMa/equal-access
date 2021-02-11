if [ -n "${GITHUB_REF:10}" ]; then
    cd ./cypress-accessibility-checker/package;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    echo "Deploy cypress-accessibility-checker version $RELEASE_VERSION...";
    npm --no-git-tag-version version $RELEASE_VERSION;
    npm publish;
fi