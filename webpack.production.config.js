const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
    entry:  __dirname + "/app/src/js/main.js",
    output: {
        path: __dirname + "/app/build",
        filename: "bundle-[hash].js"
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,  // replace ExtractTextPlugin.extract({..})
                    "css-loader"
                ]
            }
        ]
    },
    resolve: {
        alias: {
            node_modules : __dirname + '/node_modules',
            _vue: __dirname + '/node_modules/vue/dist/vue.runtime.esm.js',
            _axios: __dirname + '/node_modules/axios/dist/axios.js'
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "css/[name]-[hash].css",
            chunkFilename: "css/[id].css"
        }),
        new webpack.BannerPlugin('author by andyp'),
        new HtmlWebpackPlugin({
            template: __dirname + "/app/src/html/index.html"
        }), 
        new CleanWebpackPlugin(['app/build/*.*','app/build/css/*.*'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new webpack.HotModuleReplacementPlugin()  // 热加载插件
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: true
                }
            })
        ]
    }
}