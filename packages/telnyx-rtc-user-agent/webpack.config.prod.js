const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    'user-agent.min': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'telnyx-rtc-sipjs-user-agent',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.webpack.json')
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
};
