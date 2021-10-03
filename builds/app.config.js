/* global require, module, __dirname */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const root = path.resolve(__dirname, '..');

module.exports = {
  entry: path.resolve(root, 'src/app.js'),
  output: {
    path: path.resolve(root, 'dist'),
    filename: 'app.js',
  },
  plugins: [new MiniCssExtractPlugin()],
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
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
  devServer: {
    static: {
      directory: path.join(root, 'dist'),
    },
    host: '0.0.0.0',
    port: 8080,
  },
};
