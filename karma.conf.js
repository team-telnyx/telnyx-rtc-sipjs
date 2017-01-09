var path = require("path");

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
      "./src/**/*.js": ["webpack", "sourcemap"]
    },

    files: [
      {pattern: "src/**/*.spec.js", watched: false}
    ],

    webpack: {
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [/src/],
            options: {
              presets: ['es2015']
            }
          }
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
