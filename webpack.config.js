var webpack = require("webpack");

module.exports = {
  entry: {
    // compile both unminified and minified dist files from same source
    "telnyx-rtc": "./src/telnyx-rtc.js",
    "telnyx-rtc.min": "./src/telnyx-rtc.js"
//     // Make bundles with all deps included
//     // "telnyx-rtc.bundle": ["./src/telnyx-rtc.js", "./node_modules/sip.js/src/SIP.js"],
//     // "telnyx-rtc.bundle.min": ["./src/telnyx-rtc.js", "./node_modules/sip.js/src/SIP.js"],
  },
  output: {
    path: "./dist",
    filename: "[name].js",
    libraryTarget: "umd",
    library: "telnyx-rtc",
    // names the amd module:
    umdNamedDefine: true
  },

  // resolve: {
  //   // needed for sip.js to load correctly with webpack:
  //   packageAlias: "browser"
  // },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader?presets[]=es2015',
        include: [/src/],
        exclude: [/node_modules/]

      },
      // needed for sip.js to load correctly with webpack:
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      "SIP": "sip.js"
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
