var path = require('path');
var webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    'telnyx-rtc-sipjs': './src/telnyx-rtc-sipjs.js',
    'telnyx-rtc-sipjs.min': './src/telnyx-rtc-sipjs.js',
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'telnyx-rtc-sipjs',
    // names the amd module:
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      SIP: 'sip.js',
    }),
  ],
};
