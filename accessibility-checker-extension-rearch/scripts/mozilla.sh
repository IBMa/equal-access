pushd report-react
npm install
popd

pushd accessibility-checker-extension
npm install

pushd node_modules/exceljs/dist
sed -i'.old' -e "s/[\"|']use strict[\"|']//g" ./exceljs.js
sed -i'.old' -e "s/[\"|']use strict[\"|']//g" ./exceljs.min.js
popd

cp -f ./manifest_Firefox.json ./src/manifest.json

pushd src
sed -i'.old' -e 's/"version": "3.0.0"/"version": "'"${RELEASE_VERSION}"'"/g' ./manifest.json
rm manifest.json.old
popd

npm run package:browser
popd