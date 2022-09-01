if [ -n "${GITHUB_REF:10}" ]; then
    cd ./accessibility-checker-engine/dist
    cp ../../rule-server/dist/static/archives.json ./
    cp ../../accessibility-checker/test-act/earlResult.json ./
    cp ../../accessibility-checker/test-act-w3/act-report-v2.json ./
    cp ../../accessibility-checker/test-act-w3/act-report-v2.txt ./
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    NPM_VERSION="${GITHUB_REF:10}";
    echo "Deploy accessibility-checker-engine version ${NPM_VERSION}...";
    npm --no-git-tag-version version ${NPM_VERSION};
    if [[ "${NPM_VERSION}" =~ "-rc" ]]; then
        npm publish --tag next;
    else
        npm publish;
        npm dist-tag add accessibility-checker-engine@${NPM_VERSION} next
    fi;
fi

