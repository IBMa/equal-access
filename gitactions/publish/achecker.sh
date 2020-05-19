if [ -n "$RELEASE_VERSION" ]; then
    cd ./accessibility-checker/src;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    echo "Deploy accessibility-checker version $RELEASE_VERSION...";
    npm --no-git-tag-version version $RELEASE_VERSION;
    npm publish;
fi