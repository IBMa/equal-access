const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const ExtensionReloader = require('webpack-ext-reloader');
const locateContentScripts = require('./utils/locateContentScripts');
const Dotenv = require('dotenv-webpack');

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
        devtoolsPanel: path.join(sourceRootPath, 'ts', 'devtoolsPanel', 'index.tsx'),
        devtoolsSubpanel: path.join(sourceRootPath, 'ts', 'devtoolsSubpanel', 'index.tsx'),
        draw: path.join(sourceRootPath, 'ts', 'contentScripts', 'index.ts'),
        tabListeners: path.join(sourceRootPath, 'ts', 'tab', 'tabListeners.ts'),
        usingAC: path.join(sourceRootPath, 'ts', 'usingAC', 'index.tsx'),
        ...contentScripts,
        quickGuideAC: path.join(sourceRootPath, 'ts', 'quickGuideAC', 'index.tsx'),
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
            chunks: "all"
        }
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
            title: 'Accessibility Checker Extension - Options Page',
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
            template: path.join(sourceRootPath, 'html', 'devtoolsPanel.html'),
            inject: 'body',
            filename: 'devtoolsPanel.html',
            title: 'Accessibility Checker Extension',
            chunks: ['devtoolsPanel']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'devtoolsSubpanel.html'),
            inject: 'body',
            filename: 'devtoolsSubpanel.html',
            title: 'Accessibility Checker Extension',
            chunks: ['devtoolsSubpanel']
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
            title: 'Accessibility Checker Extension - User Guide',
            chunks: ['usingAC']
        }),
        new HtmlWebpackPlugin({
            template: path.join(sourceRootPath, 'html', 'quickGuideAC.html'),
            inject: 'body',
            filename: 'quickGuideAC.html',
            title: 'Accessibility Checker Extension - Quick Guide',
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
                to: path.join(distRootPath, "archives")
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
