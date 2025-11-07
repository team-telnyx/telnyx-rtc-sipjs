const path = require('path');

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
    colors: true,
    autoWatch: false,
    singleRun: true,
    listenAddress: '0.0.0.0',
    hostname: 'localhost',
    port: 9876,
    files: [{ pattern: 'src/**/*.spec.ts', watched: false }],
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          'sip.js$': path.resolve(__dirname, 'test/mocks/sip.ts'),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: path.resolve(__dirname, 'tsconfig.test.json'),
                },
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
    },
    webpackMiddleware: {
      stats: 'errors-only',
    },
    preprocessors: {
      'src/**/*.spec.ts': ['webpack', 'sourcemap'],
    },
  });
};
