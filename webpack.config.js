var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");
var nodeExternals = require("webpack-node-externals");
var fileLoader = require("file-loader");
var path = require("path");

defaultConfig = {
    devtool: debug ? "inline-sourcemap" : false,
}
clientConfig = Object.assign({}, defaultConfig, {
    context: path.join(__dirname, "src"),
    target: "web",
    entry: "./client/main.js",
    output: {
        filename: "main.min.js",
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
                    { loader: "file-loader", options: { name: "[name].css"} },
                    { loader: "extract-loader" },
                    { loader: "css-loader" },
                    { loader: "sass-loader" }
                ]
            },
            {
                test: /\.html$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            }
        ]
    }
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
    serverConfig
]
