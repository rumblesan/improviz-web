/* global require, module, __dirname */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  plugins: [new MiniCssExtractPlugin()],
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
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    host: '0.0.0.0',
    port: 8080,
  },
};
