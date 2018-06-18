const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ImageminPlugin = require('imagemin-webpack-plugin').default;

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
            },
            {
                test: /\.(png|jpg|gif|svg|bmp|eot|woff|woff2|ttf)$/,
                loader: {
                    loader: 'url-loader',
                    options: {
                        limit: 5 * 1024, // 图片大小 > limit 使用file-loader, 反之使用url-loader
                        outputPath: 'img/'// 指定打包后的图片位置
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.(html|html)$/,
                use: 'html-withimg-loader',
                include: __dirname + "/app/src",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        alias: {
            node_modules : __dirname + '/node_modules',
            _vue: __dirname + '/node_modules/vue/dist/vue.esm.js',
            _axios: __dirname + '/node_modules/axios/dist/axios.js'
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name]-[hash].css",
            chunkFilename: "[id].css"
        }),
        new webpack.BannerPlugin('author by andyp'),
        new HtmlWebpackPlugin({
            template: __dirname + "/app/src/html/index.html"
        }), 
        new CleanWebpackPlugin(['app/build/*'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            disabled: process.env.NODE_ENV !== 'production',
            pngquant: {
                quality: '75-80'
            }
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