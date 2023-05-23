

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
    ibmcloud ce project select -n able-main
    ibmcloud ce app update --name rules-main
elif [[ "$TRAVIS_BRANCH" == "prod" ]]
then
    echo "Deploying :prod"
    docker build --tag rules:prod .
    docker tag rules:prod us.icr.io/able/rules:prod
    docker push us.icr.io/able/rules:prod
    ibmcloud ce project select -n able
    ibmcloud ce app update --name rules-prod
else
    echo "Deploying :sandbox"
    docker build --tag rules:sandbox .
    docker tag rules:sandbox us.icr.io/able/rules:sandbox
    docker push us.icr.io/able/rules:sandbox
    ibmcloud ce project select -n able-sandbox
    ibmcloud ce app update --name rules-sandbox
fi

# Note: This moves untagged image to the trash, where they will sit for 30 days
ibmcloud cr image-prune-untagged --force --restrict able
ibmcloud cr image-list
