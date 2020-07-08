import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

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
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        // Required for TypeORM migrations
                        keep_classnames: true,
                    },
                }),
            ],
        },
    };
}

export = config;
