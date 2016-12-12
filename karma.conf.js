var webpackConfig = require("./webpack.config.js")
var path = require("path");

// remove entry points
webpackConfig.entry = {};
webpackConfig.devtools = "inline-source-map";

module.exports = function(config) {
  config.set({
    autoWatch: true,
    singleRun: true,

    browsers: ["PhantomJS"],

    frameworks: ["jasmine"],

    files: [
      "./node_modules/phantomjs-polyfill/bind-polyfill.js",
      "./src/**/*.spec.js"
    ],

    preprocessors: {
      "./src/**/*.spec.js": ["webpack"],
      "./src/**/*.js": ["webpack", "sourcemap"]
    },

    plugins: [
      require("karma-jasmine"),
      require("karma-phantomjs-launcher"),
      require("karma-sourcemap-loader"),
      require("karma-webpack"),
    ],

    // webpack: webpackConfig,

    webpack: {
      entry: {
        "telnyx-rtc": "./src/telnyx-rtc.spec.js",
      },
      output: {
        filename: "bundle.js"
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel?presets[]=es2015',
            include: [/src/] }
        ]
      }
    },

    webpackMiddleware: {
      stats: "errors-only"
    },

    phantomjsLauncher: {
      exitOnResourceError: true
    }
  });
}
