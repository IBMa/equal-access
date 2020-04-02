#!/bin/bash

# -----------------------------------------------------------------------
# 	Travis After All (travisAfterAll.sh)
#
# 	Runs this script to simulate a travis after all to only deploy after
#   all matrix builds have finished and passed.
#
# -----------------------------------------------------------------------

# Extract the option
export TARGET=$1

echo "Running for: $TARGET"

# Get Repository path
REPOPATH="$(git rev-parse --show-toplevel)"

# Get repository name from path
REPONAME="$(basename ${REPOPATH})"

# Set initial value for RETURN_CODE
RETURN_CODE=0

# Only run if this is part of AFTER SUCCESS block
if [ "$TARGET" = "AFTER_SUCCESS" ];
then
    if [ ${TRAVIS_BRANCH} == "master" ] || [ ${TRAVIS_BRANCH} == "deploy-rules" ] || [ ${TRAVIS_BRANCH} == "prod-rules" ];
    then
        echo "Running on branch: \"$TRAVIS_BRANCH\" deploy prcess in affect"

        # Run the travis after all script to check and set the leading build
        node ${REPOPATH}/rule-server/scripts/travis/travis_after_all.js ${TRAVIS_API}

        # Extract the export variables from travis_after_all.js script that has run.
        export $(cat .to_export_back)

        # As part of this script do the following:
        #   - When this is a build leader and all the other builds have finised and passed and is a branch that needs to deploy
        #   - Setup the package for deployment
        #   - Check that the bluemix end point is alive
        #   - Set the required envs for the blue green deployment script based on github branch
        if [ "$BUILD_LEADER" = "YES" ]; then
            if [ "$BUILD_FORCE_DEPLOY" = "YES" ] || [ "$BUILD_AGGREGATE_STATUS" = "others_succeeded" ]; then
                if [ "$BUILD_AGGREGATE_STATUS" = "others_succeeded" ]; then
                    echo "All jobs succeeded! DEPLOYING..."
                else
                    echo "Failed builds, but forcing deploy. DEPLOYING..."
                fi

                echo "Start to setup the package for deployment"
                rm -rf node_modules
                rm -rf package-lock.json

                echo "Ensure that the BlueMix API endpoint is accessible"

                echo "BlueMix API Endpoint availability"
                curl --head https://api.ng.bluemix.net/v2/info

                echo "Set appropriate environment variables to configure the application."
                . ./scripts/bluemix/blueGreenDeploymentHelper.sh

                echo "Starting Blue Green Deployment Process"
                ./scripts/bluemix/deploy_to_bluemix.sh
                RETURN_CODE=$?
                echo "The return code value from deploy_to_bluemix.sh script: ${RETURN_CODE}"
            else
              echo "Some jobs failed"
              RETURN_CODE=-1
            fi
          fi
    else
        echo "NOT RUNNING DEPLOYMENT SINCE BRANCH IS: \"$TRAVIS_BRANCH\""
    fi
fi

echo "BRANCH: $TRAVIS_BRANCH"
echo "The return code value before exiting travisAfterAll.sh script: ${RETURN_CODE}"
exit ${RETURN_CODE}
