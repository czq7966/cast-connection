const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const DtsPlugin = require('./src/dts/dts-webpack');
const webpack = require('webpack');

module.exports = env => {
    env = env ? env : {}; //环境变量
    const mode = env.production ? "production" : "development"; //开发或生产模式
    const devtool = env.production || env.nodevtool ? "" : "source-map"; //
    const entry = {}; 
    const plugins = [];
    const optimization = {};  //优化选项
    const minimizer = []; //优化选项：瘦身器
    const externals = {'../..': 'ADHOCCAST'};
    const libraryTarget = env.amd ? 'amd' : env.umd ? 'umd' :  env.cjs ? 'commonjs' : env.old ? 'umd' : 'commonjs';
    const libraryTargetPath =  env.amd ? 'amd' : env.umd ? 'umd' : env.cjs ? 'cjs' : env.old ? '' : 'cjs';
    const distDir = path.resolve(__dirname, 'dist', libraryTargetPath);
    const mainEntryName = env.production ? "adhoc-cast-connection.min" : "adhoc-cast-connection.dev";    
    entry[mainEntryName] = "./src/main/index.ts";
    optimization['minimizer'] = minimizer;  

    plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: "'" + mode  + "'",
                LIBRARY_TARGET: "'" + libraryTarget  + "'",
            }
        })
    );

    if (env.production) { //生产模式
        // plugins.push(new DtsPlugin({dtsDir: path.resolve(distDir, '../dts', 'src/main')}));    //生成dts文件        
        minimizer.push(
            new UglifyJsPlugin()
        )
    } 


    return {
        mode: mode,
        entry: entry,
        devtool: devtool,
        output: {
            path: distDir,
            libraryTarget: libraryTarget,
            filename: "[name].js"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    loader: "style-loader!css-loader",
                    exclude: /node_modules/
                },
            ]
        },
        plugins: plugins,
        optimization: optimization,
        plugins: plugins,
        externals: externals
    }
}

