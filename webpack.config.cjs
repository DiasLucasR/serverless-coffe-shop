const slsw = require('serverless-webpack');
const path = require('path');

module.exports = {
    target: 'node',
    entry: slsw.lib.entries,
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    node: false,
    optimization: {
        minimize: false,
    },
    output: {
        libraryTarget: 'module',
        path: path.resolve(__dirname, '.webpack'),
    },
    experiments: {
        outputModule: true,
      },
    devtool: 'inline-cheap-module-source-map'
};