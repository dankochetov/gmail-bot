import type { Configuration } from 'webpack';
import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsWebpackPlugin from 'tsconfig-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import Dotenv from 'dotenv-webpack';

const srcPath = path.resolve('src', 'ui');
const outPath = path.resolve('dist', 'ui');

const config: Configuration = {
    entry: ['react-hot-loader/patch', './index.tsx'],
    context: srcPath,
    output: {
        path: outPath,
    },
    devtool: 'inline-source-map',
    devServer: {
        hot: true,
    },
    plugins: [
        new Dotenv({
            safe: true,
            systemvars: true,
        }),
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new HtmlWebpackPlugin({
            template: '../../assets/index.ejs',
            inject: 'body',
            hash: true,
            minify: false,
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: '../../tsconfig.ui.json',
                mode: 'write-tsbuildinfo',
                diagnosticOptions: {
                    syntactic: false,
                    semantic: true,
                    declaration: false,
                    global: true,
                },
            },
        }),
        new WriteFilePlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    'source-map-loader',
                    {
                        loader: 'cache-loader',
                        options: {
                            cacheDirectory: path.resolve(
                                'node_modules',
                                '.cache',
                                'cache-loader',
                            ),
                        },
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: path.resolve(
                                'node_modules',
                                '.cache',
                                'babel-loader',
                            ),
                        },
                    },
                    {
                        loader: 'eslint-loader',
                        options: {
                            cache: false,
                            failOnError: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [
            new TsconfigPathsWebpackPlugin({
                configFile: 'tsconfig.ui.json',
            }),
        ],
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    stats: 'minimal',
};

export default config;
