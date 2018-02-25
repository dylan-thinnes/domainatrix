var debug = process.env.NODE_ENV !== "production";
if (!debug) console.log("production mode enabled.");
var webpack = require("webpack");
var nodeExternals = require("webpack-node-externals");
var fileLoader = require("file-loader");
var path = require("path");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

defaultConfig = {
    devtool: debug ? "inline-sourcemap" : false,
}
clientConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src/client"),
    target: "web",
    entry: ["./main.js", "./preload.js"],
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "dist/client")
    },
    module: {
        rules: [
            {
                test: /\.(js|es6)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["react", "es2015"]
                }
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.html$/,
                use: [
                    { loader: "file-loader", options: { name: "[name].[ext]" } },
                    "extract-loader",
                    "html-loader"
                ]
            }
        ]
    },
    plugins: debug ? [] : [
        new UglifyJsPlugin()
    ]
});
oldClientConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src/client/oldInterface"),
    target: "web",
    entry: "./pack.js",
    output: {
        filename: "./_pack-output.js",
        path: path.join(__dirname, "dist/client/old")
    },
    module: { rules: [ {
        test: /.(css|html|js)$/,
        exclude: /pack.js$/,
        loader: "file-loader",
        options: { name: "[name].[ext]" }
    } ] },
    plugins: debug ? [] : [
        new UglifyJsPlugin()
    ]
});
serverConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src"),
    target: "node",
    devtool: debug ? "inline-sourcemap" : false,
    entry: "./server/index.js",
    output: {
        filename: "index.js",
        path: path.join(__dirname, "dist/server")
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    module: { rules: [ {
        test: /.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
            presets: ["env"]
        }
    } ] },
    externals: [nodeExternals()]
});
module.exports = [
    clientConfig,
    oldClientConfig,
    serverConfig
]
