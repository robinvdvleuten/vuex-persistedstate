const buble = require('rollup-plugin-buble')
const pkg = require('../package.json')

module.exports = {
  entry: 'src/plugin.js',
  dest: pkg['main'],
  format: 'umd',
  plugins: [buble()],
  moduleName: 'createPersistedState',
  banner:
`/**
 * vuex-persistedstate v${process.env.VERSION || pkg.version}
 *
 * (c) ${new Date().getFullYear()} Robin van der Vleuten <robin@webstronauts.co>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */`
}
