const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const deps = require('../package.json').dependencies;

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, '../build'),
    },
    devServer: {
        open: true,
        host: 'localhost',
        port: 8081,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: path.resolve(__dirname, '../public'), to: 'public' },
        ]),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
        }),
        new ModuleFederationPlugin({
            name: 'towerdefense',
            filename: 'remoteEntry.js',
            exposes: {
                './App': './src/App',
            }
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '~': path.resolve(__dirname, '../src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            },
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            },
        ],
    },
};
