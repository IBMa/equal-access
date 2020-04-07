if [ -n "$TRAVIS_TAG" ]; then
    if [[ $TRAVIS_TAG =~ ([^ ]+)\#([^ ]+) ]]; then
        cd ./accessibility-checker/src;
        echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
        NPM_VERSION="${BASH_REMATCH[1]}";
        EXT_VERSION="${BASH_REMATCH[2]}";
        echo "Deploy accessibility-checker version $NPM_VERSION...";
        npm --no-git-tag-version $NPM_VERSION;
        npm publish;
    fi
fi