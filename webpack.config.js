var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } });

module.exports = {
  entry: './demo/index.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'demo/dist'),
  },
  module: {
    loaders: [{
      test: /\.js[x]?$/,
      exclude: /node_modules/,
      loader: 'babel-loader?presets[]=es2015&presets[]=react',
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=512'
    }]
  },
  plugins: [
    uglifyJsPlugin
  ],
  devServer: {
    port: 7001,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // The local filesystem directory where static html files
    // should be placed.
    // Put your main static html page containing the <script> tag
    // here to enjoy 'live-reloading'
    // E.g., if 'contentBase' is '../views', you can
    // put 'index.html' in '../views/main/index.html', and
    // it will be available at the url:
    //   https://localhost:9001/main/index.html
    contentBase: path.resolve(__dirname, './'),
    // 'Live-reloading' happens when you make changes to code
    // dependency pointed to by 'entry' parameter explained earlier.
    // To make live-reloading happen even when changes are made
    // to the static html pages in 'contentBase', add
    // 'watchContentBase'
    watchContentBase: true,
  },
};
