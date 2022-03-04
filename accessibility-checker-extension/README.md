[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

# accessibility-checker-extension
A web browser extensions that adds automated accessibility checking capabilities

## Getting started

* [Node Version 16](https://nodejs.org/en/download/).

### Install dependencies

1. Under the root `equal-access` directory 

    ```
    npm install
    ```

### Build

There are several different modes that you can run with. These will build the extension to `accessibility-checker-extension/dist` (See loading into the browser below)

**Run local extension with local rule server**
1. Under the `rule-server` directory, `npm start`
2. Open https://localhost:9445 in your browser and accept any self-signed certs. In chrome you may need to type 'thisisunsafe', which will accept the cert (you will not actually see anywhere to type it). You should get "Cannot GET /".
3. On a new command line window, under the `accessibility-checker-extension` directory, `npm run build:watch:local`

**Run local extension with production rule server**

From the `accessibility-checker-extension` directory:
* To continuously build when changes occur, `npm run build:watch`
* To build once for development, `npm run build:dev`
* To build for production, `npm run build:prod`

## Loading into the browser:
### In Chrome web browser
1. Go to: [**chrome://extensions**](chrome://extensions)
2. Toggle: "**developer mode**" on.
3. Click on: "**Load unpacked**"
4. Select the newly created folder "**dist**" ```equal-access/accessibility-checker-extension/dist``` from the project folder.

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

## Bugs and Issues

All bugs or issues related to the karma-accessibility-checker code can be created in [GitHub Issues](https://github.com/IBMa/equal-access/issues).
