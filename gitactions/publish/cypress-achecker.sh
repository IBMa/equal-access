if [ -n "${GITHUB_REF:10}" ]; then
    cd ./cypress-accessibility-checker/package;
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc;
    NPM_VERSION="${GITHUB_REF:10}";
    echo "Deploy cypress-accessibility-checker version ${NPM_VERSION}...";
    npm --no-git-tag-version version ${NPM_VERSION};
    if [[ "${NPM_VERSION}" =~ "-rc" ]]; then
        npm publish --tag next;
    else
        npm publish;
    fi;
fi
