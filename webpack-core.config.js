/* global require, module, __dirname */

const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/core.js'),
  output: {
    path: path.resolve(__dirname, 'core'),
    filename: 'core.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'codemirror'),
        ],
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
      {
        test: /\.html$|\.ico$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.ya?ml$/,
        loader: 'js-yaml-loader',
      },
      {
        test: /\.bmp$|\.png$/,
        loader: 'file-loader',
        include: [path.resolve(__dirname, 'src/textures')],
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.obj$/,
        use: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.html'],
  },
};
