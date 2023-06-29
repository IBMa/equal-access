# accessibility-checker-extension

Browser extensions integrated with the web developer tools that add automated accessibility checking, automated keyboard checking visualizations, and reporting capabilities

## Usage

The extensions have been deployed to the various stores so they can be easily downloaded and installed:

* [Chrome accessibility-checker-extension](https://chrome.google.com/webstore/detail/ibm-equal-access-accessib/lkcagbfjnkomcinoddgooolagloogehp) : web browser extension that integrates automated accessibility checking capabilities into the Chrome Developer Tools
* [Firefox accessibility-checker-extension](https://addons.mozilla.org/en-US/firefox/addon/accessibility-checker/) : web browser extension that integrates automated accessibility checking capabilities into the Firefox Web Developer Tools
  
## Requirements for building the extensions

* [Node Version 16](https://nodejs.org/en/download/).

### Install dependencies

1. Under the root `equal-access` directory

    ```bash
    npm install
    ```

### Build

There are several different modes that you can run with. These will build the extension to `accessibility-checker-extension/dist` (See loading into the browser below)

#### Run local extension with local rule server

1. Under the `rule-server` directory, `npm start`
2. Open [https://localhost:9445](https://localhost:9445) in your browser and accept any self-signed certs. In chrome you may need to type 'thisisunsafe', which will accept the cert (you will not actually see anywhere to type it). You should get "Cannot GET /".
3. On a new command line window, under the `accessibility-checker-extension` directory, `npm run build:watch:local`

#### Run local extension with production rule server

From the `accessibility-checker-extension` directory:

* To continuously build when changes occur, `npm run build:watch`
* To build once for development, `npm run build:dev`
* To build for production, `npm run build:prod`

## Loading into the browser developer tools

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

## Build the deployment package for Chrome and Firefox

```bash
npm run clean:all
npm install
npm run package:browser
```

The commands generate a `package/accessibility-checker-extension.zip` file. The zip package can be deployed into the Chrome or Firefox store. Test the package locally in the Firefox browser:

1. Go to: [**about:debugging**](about:debugging) in the Firefox browser
2. Select: "**This Firefox**"
3. Click on: "**Load Temporary Add-on…**"
4. Open the newly created package file "**accessibility-checker-extension.zip**" from the package folder.  

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Aextension-checker), tagged with `extension-checker`.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
