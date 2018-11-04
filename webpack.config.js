const path = require("path");

module.exports = {
  mode: "none",
  devtool: "source-map",
  entry: "./build-framework/build-babel/index.js",
  output: {
    filename: "framework.js",
    path: path.resolve(__dirname, "build/js"),
    library: "flux",
    libraryTarget: "amd"
  }
};
