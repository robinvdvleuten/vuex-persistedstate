const buble = require('rollup-plugin-buble')
const cjs = require('rollup-plugin-commonjs')
const version = process.env.VERSION || require('../package.json').version

module.exports = {
  entry: 'src/index.js',
  dest: 'dist/vuex-persistedstate.js',
  format: 'umd',
  moduleName: 'VuexPersistedstate',
  plugins: [cjs(), buble()],
  banner:
`/**
 * vuex-persistedstate v${version}
 *
 * (c) ${new Date().getFullYear()} Robin van der Vleuten <robin@webstronauts.co>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */`
}
