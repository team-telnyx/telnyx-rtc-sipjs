var path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadless'],
    transports: ['websocket', 'polling'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-sourcemap-loader',
    ],
    phantomjsLauncher: {
      exitOnResourceError: true,
    },
    colors: true,
    autoWatch: true,
    singleRun: true,
    // logLevel: config.LOG_ERROR,
    listenAddress: '0.0.0.0',
    hostname: 'localhost',
    port: 9877,
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      { pattern: 'src/**/*.spec.js', watched: false },
    ],
    webpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
            exclude: /(node_modules)/,
          },
        ],
      },
    },
    webpackMiddleware: {
      stats: 'errors-only',
    },
    preprocessors: {
      './src/**/*.js': ['webpack', 'sourcemap'],
    },
  });
};
