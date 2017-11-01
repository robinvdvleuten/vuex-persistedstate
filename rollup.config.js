const buble = require('rollup-plugin-buble')
const pkg = require('./package.json')

const banner =
  `/**
    * @license
    *
    * vuex-persistedstate v${pkg.version}
    *
    * (c) ${new Date().getFullYear()} Robin van der Vleuten <robin@webstronauts.co>
    *
    * For the full copyright and license information, please view the LICENSE
    * file that was distributed with this source code.
    */`

module.exports = {
  entry: 'src/plugin.js',
  moduleName: 'createPersistedState',
  dest: pkg.main,
  useStrict: false,
  format: 'umd',
  globals: {
    'lodash.merge': 'merge'
  },
  external: ['lodash.merge'],
  plugins: [buble()],
  banner
}
