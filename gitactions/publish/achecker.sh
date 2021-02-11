if [ -n "${GITHUB_REF:10}" ]; then
    cd ./accessibility-checker/src;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    echo "Deploy accessibility-checker version ${GITHUB_REF:10}...";
    npm --no-git-tag-version version ${GITHUB_REF:10};
    npm publish;
fi