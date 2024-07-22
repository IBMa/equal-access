   /******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

 const path = require('path');
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new webpack.BannerPlugin(fs.readFileSync('./LICENSEHEADER', 'utf8'))
    ],
    output: {
        filename: 'ace-node.js',
        path: path.resolve(__dirname, 'dist'),
        // library: 'ace',
        libraryTarget: 'commonjs2'
        //libraryTarget: 'umd'
    },
    watch: false
};