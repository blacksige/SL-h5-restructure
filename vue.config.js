const webpack = require('webpack');

module.exports = {
  publicPath: '/',
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => {
        options.limit = 8192;
        return options;
      });
  }
};
