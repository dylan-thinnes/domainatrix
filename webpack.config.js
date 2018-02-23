var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");
var nodeExternals = require("webpack-node-externals");
var fileLoader = require("file-loader");
var path = require("path");

defaultConfig = {
    devtool: debug ? "inline-sourcemap" : false,
}
clientConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src/client"),
    target: "web",
    entry: ["./js/main.js", "./js/preload.js"],
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
    }
});
oldClientConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src/client/oldInterface"),
    target: "web",
    entry: "./pack.js",
    output: {
        filename: "script.js",
        path: path.join(__dirname, "dist/client/old")
    },
    module: { rules: [ {
        test: /.(css|html)$/,
        loader: "file-loader",
        options: { name: "[name].[ext]" }
    } ] }
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
    externals: [nodeExternals()]
});
module.exports = [
    clientConfig,
    oldClientConfig,
    serverConfig
]
