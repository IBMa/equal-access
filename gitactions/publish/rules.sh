

curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
ibmcloud plugin install container-registry
ibmcloud plugin install code-engine
ibmcloud login --apikey "$CLOUD_PWD" -r "us-south"
ibmcloud cr login
ibmcloud target -g Accessibility_Enablement_prod

if [[ "$TRAVIS_BRANCH" == "master" ]]
then
    echo "Deploying :main"
    docker build --tag rules:main .
    docker tag rules:main us.icr.io/able/rules:main
    docker push us.icr.io/able/rules:main
    ibmcloud ce project select -n able
    ibmcloud ce app update --name rules-main
elif [[ "$TRAVIS_BRANCH" == "sandbox" ]]
then
    echo "Deploying :sandbox"
    docker build --tag rules:sandbox .
    docker tag rules:sandbox us.icr.io/able/rules:sandbox
    docker push us.icr.io/able/rules:sandbox
    ibmcloud ce project select -n able-sandbox
    ibmcloud ce app update --name rules-sandbox
elif [[ "$TRAVIS_BRANCH" == "prod" ]]
then
    echo "Deploying :prod"
    docker build --tag rules:prod .
    docker tag rules:prod us.icr.io/able/rules:prod
    docker push us.icr.io/able/rules:prod
    ibmcloud ce project select -n able-main
    ibmcloud ce app update --name rules-prod
fi

# Note: This moves untagged image to the trash, where they will sit for 30 days
ibmcloud cr image-prune-untagged --force --restrict able
ibmcloud cr image-list

if [[ "$TRAVIS_BRANCH" != "sandbox" ]]
then
    echo "Deploy CF rule server..."
    cd rule-server

    rm -rf node_modules
    rm -rf package-lock.json

    echo "Ensure that the BlueMix API endpoint is accessible"

    echo "BlueMix API Endpoint availability"
    curl --head https://api.ng.bluemix.net/v2/info

    echo "Set appropriate environment variables to configure the application."
    . ./scripts/bluemix/blueGreenDeploymentHelper.sh

    echo "Starting Blue Green Deployment Process"
    . ./scripts/bluemix/deploy_to_bluemix.sh
    RETURN_CODE=$?
    echo "The return code value from deploy_to_bluemix.sh script: ${RETURN_CODE}"
    exit ${RETURN_CODE}
fi