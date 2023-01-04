

curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
ibmcloud plugin install container-registry
ibmcloud plugin install code-engine
ibmcloud login --apikey "$CLOUD_PWD" -r "us-south"
ibmcloud cr login
ibmcloud target -g Accessibility_Enablement_prod
ibmcloud ce project select -n able

if [[ ( "${GITHUB_REF}" =~ "refs/heads/") ]]; then
    if [[ ( "${GITHUB_REF:11}" == "master" )]]; then
        echo "Deploying :main"
        docker build --tag rules:main .
        docker tag rules:main us.icr.io/able/rules:main
        docker push us.icr.io/able/rules:main
        ibmcloud ce app update --name rules-main
    else
        echo "Deploying :sandbox"
        docker build --tag rules:sandbox .
        docker tag rules:sandbox us.icr.io/able/rules:sandbox
        docker push us.icr.io/able/rules:sandbox
        ibmcloud ce app update --name rules-sandbox
    fi
elif [[ ( "${GITHUB_REF}" =~ "refs/pull/") ]]; then
    echo "Deploying :sandbox"
    docker build --tag rules:sandbox .
    docker tag rules:sandbox us.icr.io/able/rules:sandbox
    docker push us.icr.io/able/rules:sandbox
    ibmcloud ce app update --name rules-sandbox
elif [[ ( "${GITHUB_REF}" =~ "refs/tags/") ]]; then
    echo "Deploying :prod"
    docker build --tag rules:prod .
    docker tag rules:prod us.icr.io/able/rules:prod
    docker push us.icr.io/able/rules:prod
    ibmcloud ce app update --name rules-prod
fi
# Note: This moves untagged image to the trash, where they will sit for 30 days
ibmcloud cr image-prune-untagged --force --restrict able
ibmcloud cr image-list
