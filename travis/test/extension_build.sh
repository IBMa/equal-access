# Ensure prod build with no build errors
cd report-react
npm install
cd ../accessibility-checker-extension
npm install
npm run build:prod
