#!/bin/bash

# -----------------------------------------------------------------------
# 	BLUEMIX DEPLOYMENT CONFIGURATIONS (blueGreenDeploymentHelper.sh)
#
# 	Configures the environment for Blue-Green deployment with the
# 	Service Engage BlueMix deployment script based on GitHub branches.
#
# -----------------------------------------------------------------------

# --- BlueMix Environment Settings --------------------------------------
export CF_ID=${BLUEMIX_USERID}
export CF_PWD=${BLUEMIX_PASS}
export CF_TARGET=https://api.ng.bluemix.net

export CF_ORG=Accessibility_Enablement

# --- Settings Override Based on GitHub Branch --------------------------
if [[ "$TRAVIS_BRANCH" == "master" ]]
then
    export CF_SPACE=AAT_dev
    export APP_MANIFEST_PATH=${PWD}/manifest-dev.yml
    export APP_POSTFIX=-dev
elif [ ${TRAVIS_BRANCH} == "prod" ]
then
    export CF_SPACE=AAT_prod
    export APP_MANIFEST_PATH=${PWD}/manifest-prod.yml
    export APP_POSTFIX=
fi

echo "Configuring BlueMix deployment..."
echo "CF_TARGET: $CF_TARGET"
echo "CF_ORG: $CF_ORG"
echo "CF_SPACE: $CF_SPACE"
echo "APP_MANIFEST_PATH: $APP_MANIFEST_PATH"