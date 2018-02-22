var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");
var path = require("path");

module.exports = {
    context: path.join(__dirname, "src"),
    devtool: debug ? "inline-sourcemap" : false,
    entry: "./js/client.js",
    output: {
        path: __dirname + "/dist/",
        filename: "client.min.js"
    }
}
