const path = require('path');

module.exports = {
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|vuex-persistedstate)/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [['env', { es2015: { modules: false } }]]
        }
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    contentBase: __dirname,
    port: 3000
  }
};
