import webpack, { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import StartServerWebpackPlugin from 'start-server-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

function config(options: Configuration): Configuration {
    return {
        ...options,
        entry: ['webpack/hot/poll?100', options.entry as string],
        watch: true,
        externals: [
            nodeExternals({
                whitelist: ['webpack/hot/poll?100'],
            }),
        ],
        plugins: [
            ...(options.plugins ?? []),
            new CleanWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
            new StartServerWebpackPlugin({
                name: options.output!.filename as string,
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
