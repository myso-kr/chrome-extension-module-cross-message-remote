const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: { path: path.resolve('./app'), filename: 'bundle.js' },
  module: {
    rules: [{
      test: /\.jsx?$/, loader: 'babel-loader',
      options: {
        presets: [
          ['env', { targets: { browsers: ['last 2 versions', '> 5% in KR'] }, modules: false }], // 브라우저일 경우만
          ['stage-2']
        ],
      },
      exclude: ['/node_modules'],
    }],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true, compress: { warnings: false, drop_console: true }, output: { comments: false } }),
  ],
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.css'],
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
};