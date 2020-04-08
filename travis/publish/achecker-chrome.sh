if [ -n "$TRAVIS_TAG" ]; then
    if [[ $TRAVIS_TAG =~ ([^ ]+)\#([^ ]+) ]]; then
        cd ./accessibility-checker-extension/src;
        NPM_VERSION="${BASH_REMATCH[1]}";
        EXT_VERSION="${BASH_REMATCH[2]}";
        echo "Deploy accessibility-checker for Chrome version $NPM_VERSION / $EXT_VERSION...";
    fi
fi