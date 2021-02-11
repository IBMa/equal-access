if [ -n "${GITHUB_REF:10}" ]; then
    cd ./karma-accessibility-checker/src;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    echo "Deploy karma-accessibility-checker version ${GITHUB_REF:10}...";
    npm --no-git-tag-version version ${GITHUB_REF:10};
    npm publish;
fi