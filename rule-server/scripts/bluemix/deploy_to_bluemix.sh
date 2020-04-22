#!/usr/bin/env bash

#   This script is for blue-green deployment to Cloud Foundry.

#   CF_ID                   The Cloud Foundry ID to authenticate with.
#   CF_PWD                  The Cloud Foundry password to authenticate with.
#   CF_TARGET               The Bluemix API endpoint; defaults to https://api.ng.bluemix.net
#   CF_TIMEOUT              The Cloud Foundry deploy timeout.  Default to 180 (max).
#   CF_ORG?                 The Cloud Foundry organization to deploy into.
#   CF_SPACE?               The Cloud Foundry space to deploy into.
#   APP_MANIFEST_PATH       The application manifest file path
#   CF_ENV_PREFIX?          The prefix of exported environment variables for Cloud Foundry application.
#   CF_SERVICE_PREFIX?      The prefix of bind service names for Cloud Foundry application.

## Limitation

# * the manifest file should not contain services nor environment variables section

REQUIRED=("CF_ID" "CF_PWD" "CF_ORG" "CF_SPACE")
for name in ${REQUIRED[*]}; do
    if [ -z "${!name}" ]; then
        echo "The '${name}' environment variable is required."
        exit 1
    fi
done

APP_DEPLOY_NAME="rules-server${APP_POSTFIX}-next"

install-cf-cli() {
    # install cf CLI
    if [ -z "$(which cf)" ]; then
        #curl -sLO http://go-cli.s3-website-us-east-1.amazonaws.com/releases/v6.13.0/cf-linux-amd64.tgz
        #[ -f /usr/bin/sudo ] && sudo tar -xzf cf-linux-amd64.tgz -C /usr/bin

        # Download and extract Linux 64-bit binary
        curl -L "https://packages.cloudfoundry.org/stable?release=linux64-binary&version=6.44.1" | tar -zx
        # Move it to /usr/local/bin or a location you know is in your $PATH
        sudo mv cf /usr/bin
        # Copy tab completion file on Ubuntu (takes affect after re-opening your shell)
        sudo curl -o /usr/share/bash-completion/completions/cf https://raw.githubusercontent.com/cloudfoundry/cli/master/ci/installers/completion/cf
        # Confirm your cf CLI version
        cf --version

        # TODO handle env without sudo
        rm -rf cf-linux-amd64.tgz
    else
        echo "found cf command, skipping install"
    fi
}

cf-login() {
    echo "Logging into $CF_TARGET"
    cf login -a "${CF_TARGET:-https://api.ng.bluemix.net}" -u $CF_ID -p "$CF_PWD" \
    -o ${CF_ORG:-$CF_ID} -s ${CF_SPACE:-dev}
}

push2cf() {
    local APP_MANIFEST

    if [ -d "${APP_MANIFEST_PATH}" ]; then
        APP_MANIFEST=${APP_MANIFEST_PATH}/manifest.yml
    elif [ -f "${APP_MANIFEST_PATH}" ]; then
        APP_MANIFEST=${APP_MANIFEST_PATH}
    fi

    GIT_REVISION=$(git rev-parse HEAD)
    if [ $? == 0 ]; then
        echo "Detected git revision ${GIT_REVISION}"
        APP_VERSION="${GIT_REVISION}"
    fi

    local RETURN_CODE=0

    echo "using manifest file: ${APP_MANIFEST}"

    # setup services
    if [ -n "${CF_SERVICE_PREFIX}" ]; then
        cat <<EOT >> ${APP_MANIFEST}
  services:
EOT
        for cf_service in $(compgen -e | grep "${CF_SERVICE_PREFIX}"); do
            cat <<EOT >> ${APP_MANIFEST}
    - ${!cf_service}
EOT
        done
    fi

    # setup env variables
    cat <<EOT >> ${APP_MANIFEST}
  env:
    APP_VERSION: ${APP_VERSION}
    NODE_ENV: production
EOT

    if [ -n "${CF_ENV_PREFIX}" ]; then
        for cfg in $(compgen -e | grep ${CF_ENV_PREFIX}); do
            cat <<EOT >> ${APP_MANIFEST}
    ${cfg}: ${!cfg}
    ${cfg#${CF_ENV_PREFIX#^}}: ${!cfg}
EOT
        done
    fi

    # login
    cf-login
    cf push -f ${APP_MANIFEST} -t ${CF_TIMEOUT:-180}
    RETURN_CODE=$?

    if [ "$RETURN_CODE" -ne 0 ]; then
        echo "cf logs ${APP_DEPLOY_NAME}:"
        cf logs ${APP_DEPLOY_NAME} --recent
        echo "Could not deploy the application"
    fi
    return ${RETURN_CODE}
}

run-integration-tests() {
    echo "run integration test against ${APP_URL}"
    local RETURN_CODE=0

    if [ "$SKIP_NPM_INSTALL" != "true" ]; then
        echo "running npm install"
        npm install
    fi
    npm run-script integration

    RETURN_CODE=$?

    return ${RETURN_CODE}
}

remove-app() {
    if [ -n "${1}" ]; then
        cf stop "${1}"
        cf delete "${1}" -f -r
    else
        echo "missing application name, failed to remove app."
    fi
}

dump-logs-app() {
    if [ -n "${1}" ]; then
        cf logs "${1}" --recent
    else
        echo "missing application name, failed to get app logs."
    fi
}

promote2prod() {
    cf delete -f rules-server${APP_POSTFIX}-old
    sleep 5
    cf rename rules-server${APP_POSTFIX} rules-server${APP_POSTFIX}-old
    sleep 5
    cf stop rules-server${APP_POSTFIX}-old
    sleep 5
    cf rename rules-server${APP_POSTFIX}-next rules-server${APP_POSTFIX}
}

# workflow
install-cf-cli
push2cf

RETURN_CODE=$?
echo "The return code value after cf push command: ${RETURN_CODE}"

if [ "$RETURN_CODE" -eq 0 ]; then
    run-integration-tests
    RETURN_CODE=$?
fi

if [ "$RETURN_CODE" -eq 0 ]; then
    promote2prod
else
    dump-logs-app "${APP_DEPLOY_NAME}"
    remove-app "${APP_DEPLOY_NAME}"
fi

cf logout

echo "The return code value before exiting: ${RETURN_CODE}"

exit ${RETURN_CODE}