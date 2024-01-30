const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const ExtensionReloader = require('webpack-ext-reloader');
const locateContentScripts = require('./utils/locateContentScripts');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require("terser-webpack-plugin");

const sourceRootPath = path.join(__dirname, 'src');
const archivePath = path.join(__dirname, '..', 'rule-server', 'dist', 'static');
const contentScriptsPath = path.join(sourceRootPath, 'ts', 'contentScripts');
const distRootPath = path.join(__dirname, 'dist');
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const webBrowser = process.env.WEB_BROWSER ? process.env.WEB_BROWSER : 'chrome';

const contentScripts = locateContentScripts(contentScriptsPath);

// const extensionReloader = nodeEnv === "watch" || nodeEnv === "watch_local" ? new ExtensionReloader({
//     port: 9128,
//     reloadPage: true,
//     entries: {
//         background: 'background',
//         extensionPage: ['popup', 'options', 'devtools', 'devtoolsPanel', 'devtoolsSubpanel'],
//         contentScript: Object.keys(contentScripts),
//     }
// }) : () => { this.apply = () => { } };

const dotenv_path = nodeEnv === "production" ? ".env_production" : nodeEnv === "watch_local" ? "./.env_local" : "./.env_development";
console.log(`[INFO] Using environment ${dotenv_path}`);
module.exports = {
    watch: nodeEnv === 'watch' || nodeEnv === "watch_local",
    entry: {
        background: path.join(sourceRootPath, 'ts', 'background', 'index.ts'),
        options: path.join(sourceRootPath, 'ts', 'options', 'index.tsx'),
        popup: path.join(sourceRootPath, 'ts', 'popup', 'index.tsx'),
        devtools: path.join(sourceRootPath, 'ts', 'devtools', 'index.tsx'),
        devtoolsMain: path.join(sourceRootPath, 'ts', 'devtools', 'indexMain.tsx'),
        devtoolsElements: path.join(sourceRootPath, 'ts', 'devtools', 'indexElements.tsx'),
        viewKCM: path.join(sourceRootPath, 'ts', 'contentScripts', 'viewKCM.ts'),
        viewInspect: path.join(sourceRootPath, 'ts', 'contentScripts', 'viewInspect.ts'),
        usingAC: path.join(sourceRootPath, 'ts', 'docs', 'usingAC.tsx'),
        ...contentScripts,
        quickGuideAC: path.join(sourceRootPath, 'ts', 'docs', 'quickGuide.tsx'),
        ...contentScripts,
    },
    output: {
        path: distRootPath,
        filename: '[name].js',
    },
    optimization: nodeEnv.includes("watch") ? {
        minimize: false
    } : {
        splitChunks: {
            maxSize: 3500000,
            chunks(chunk) {
              return chunk.name !== "background" && chunk.name !== "viewKCM" && chunk.name !== "viewInspect"; // Don't chunk the background script. Chrome doesn't register the service_worker listeners if we do.
            }
        },
        minimizer: [new TerserPlugin({
            exclude: /view(Inspect|KCM)/,
        })]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json'],
    },
    module: {
        rules: [
            { test: /\.(js|ts|tsx)?$/, loader: "ts-loader", exclude: /node_modules/ },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
              }
        ]
    },
    plugins: [
        new Dotenv({
            path: dotenv_path
          }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'options.html'),
            inject: 'body',
            filename: 'options.html',
            title: 'Settings - IBM Accessibility Checker',
            chunks: ['options']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'popup.html'),
            inject: 'body',
            filename: 'popup.html',
            title: 'Accessibility Checker Extension - Popup Page',
            chunks: ['popup']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'devtools.html'),
            inject: 'body',
            filename: 'devtools.html',
            title: 'Accessibility Checker Extension',
            chunks: ['devtools']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'devtoolsMain.html'),
            inject: 'body',
            filename: 'devtoolsMain.html',
            title: 'Accessibility Checker Extension',
            chunks: ['devtoolsMain']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'devtoolsElements.html'),
            inject: 'body',
            filename: 'devtoolsElements.html',
            title: 'Accessibility Checker Extension',
            chunks: ['devtoolsElements']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'reports.html'),
            inject: 'body',
            filename: 'reports.html',
            title: 'Accessibility Checker Extension',
            chunks: ['reports']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'usingAC.html'),
            inject: 'body',
            filename: 'usingAC.html',
            title: 'User guide - IBM Accessibility Checker',
            chunks: ['usingAC']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'quickGuideAC.html'),
            inject: 'body',
            filename: 'quickGuideAC.html',
            title: 'Quick guide - IBM Accessibility Checker',
            chunks: ['quickGuideAC']
        }),
        new CopyWebpackPlugin({
            patterns: [
            {
                from: path.join(sourceRootPath, 'assets'),
                to: path.join(distRootPath, 'assets')
            },
            {
                from: path.join(sourceRootPath, 'manifest.json'),
                to: path.join(distRootPath, 'manifest.json'),
                toType: 'file',
            },
            {
                from: path.join(archivePath, "archives.json"),
                to: path.join(distRootPath, "archives.json"),
                toType: 'file'
            },
            {
                from: path.join(archivePath, "archives"),
                to: path.join(distRootPath, "archives"),
                globOptions: {
                    ignore: [
                        path.join("**", "ace-*.js")
                    ]
                }
            }
        ]}),
       
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify(nodeEnv),
            'WEB_BROWSER': JSON.stringify(webBrowser),
        }),
        // extensionReloader,
    ],
}

if (nodeEnv === 'production') {
    module.exports.plugins.push(new CleanWebpackPlugin({ verbose: true, dry: false }));
}
