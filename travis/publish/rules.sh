#!/bin/bash
echo "Deploy rule server..."

rm -rf node_modules
rm -rf package-lock.json

echo "Ensure that the BlueMix API endpoint is accessible"

echo "BlueMix API Endpoint availability"
curl --head https://api.ng.bluemix.net/v2/info

echo "Set appropriate environment variables to configure the application."
. ../../rule-server/scripts/bluemix/blueGreenDeploymentHelper.sh

echo "Starting Blue Green Deployment Process"
. ../../rule-server/scripts/bluemix/deploy_to_bluemix.sh
RETURN_CODE=$?
echo "The return code value from deploy_to_bluemix.sh script: ${RETURN_CODE}"
exit ${RETURN_CODE}
