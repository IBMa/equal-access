## Environment
* Node 12.13.0

## Quick Start
* Install dependencies in both `accessibility-checker-extension` and `report-react`
```
npm install
```

* Transpile the code:
  * Build for dev: `npm run build:dev`
  * Build for dev and watch for changes: `npm run build:watch`
  * Build for production: `npm run build:prod`

## Watch against local rule server
* In rule-server:
```
npm start
```
* In browser-extension:
```
npm run build:watch:local
```

## Loading into the browser:
### In Chrome web browser
1. Go to: [**chrome://extensions**](chrome://extensions)
2. Toggle: "**developer mode**" on.
3. Click on: "**Load unpacked**"
4. Select the newly created folder "**dist**" from the project folder.

### In Firefox web browser
1. Go to: [**about:debugging**](about:debugging) in the Firefox browser
2. Select: "**This Firefox**"
3. Click on: "**Load Temporary Add-on…**"
4. Open the newly created folder "**dist**" from the project folder, and choose the "**manifest.json**" file.

## Build the deployment package for Chrome and Firefox browsers:
```
npm run clean:all
npm install
npm run package:browser
```
The commands generate a package/accessibility-checker-extension.zip file. The zip package can be deployed into the Chrome or Firefox store. You can test the package locally in the Firefox browser (though not in the Chrome browser):
1. Go to: [**about:debugging**](about:debugging) in the Firefox browser
2. Select: "**This Firefox**"
3. Click on: "**Load Temporary Add-on…**"
4. Open the newly created package file "**accessibility-checker-extension.zip**" from the package folder.
   
## License
Apache 2.0

## Bugs and Issues

All bugs or issues related to the karma-accessibility-checker code can be created in [GitHub Issues](https://github.com/IBMa/equal-access/issues).