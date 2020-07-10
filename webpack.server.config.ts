import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

function config(options: Configuration): Configuration {
    return {
        ...options,
        externals: [nodeExternals()],
        plugins: [
            ...(options.plugins ?? []),
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false,
            }),
        ],
        optimization: {
            ...options.optimization,
            minimize: false,
        },
    };
}

export = config;
