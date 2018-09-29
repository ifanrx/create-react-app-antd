const {injectBabelPlugin} = require('react-app-rewired')
const rewireLess = require('react-app-rewire-less')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = function override(config, env) {
  if (process.env.NODE_ENV_RELEASE === '1') {
    config.output.publicPath = 'https://dl.ifanr.cn/hydrogen/user-dash-static/'
    config.output.filename = '[name].js'
    let p = config.plugins.find(p => p instanceof ExtractTextPlugin)
    p.filename = '[name].css'
    p = config.plugins.find(p => p instanceof HtmlWebpackPlugin)
    p.options.template = path.join(__dirname, 'public', 'index.ifanrx.html')
  } else {
    config.output.publicPath = ''
  }

  config = injectBabelPlugin(
    ['import', {libraryName: 'antd', libraryDirectory: 'es', style: true}], // change importing css to less
    config
  )
  config = rewireLess.withLoaderOptions({
    modifyVars: {'@primary-color': '#128BF8'},
    javascriptEnabled: true
  })(config, env)
  return config
}
