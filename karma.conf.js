var path = require('path');

module.exports = function (config) {
  config.set({
    autoWatch: true,
    singleRun: true,

    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],

    preprocessors: {
      './src/**/*.js': ['webpack', 'sourcemap'],
    },

    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      { pattern: 'src/**/*.spec.js', watched: false },
    ],

    webpack: {
      // module: {
      //   loaders: [
      //     {
      //       test: /\.js$/,
      //       loader: 'babel-loader',
      //       include: [/src/],
      //       options: {
      //         presets: ['@babel/preset-env'],
      //       },
      //     },
      //   ],
      // },
    },

    webpackMiddleware: {
      stats: 'errors-only',
    },

    phantomjsLauncher: {
      exitOnResourceError: true,
    },
  });
};
