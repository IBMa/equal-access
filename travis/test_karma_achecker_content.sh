cd karma-accessibility-checker;
npm install;
npm run setup;
sleep 10;
npm run build;
npm run installPlugin;

npx karma start karma.conf1.js;
