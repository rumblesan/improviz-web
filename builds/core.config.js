/* global require, module, __dirname */

const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  entry: path.resolve(root, 'src/core.js'),
  output: {
    path: path.resolve(root, 'core'),
    filename: 'core.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve(root, 'node_modules'),
          path.resolve(root, 'codemirror'),
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
        include: [path.resolve(root, 'src/textures')],
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
