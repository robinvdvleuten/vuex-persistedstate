import buble from 'rollup-plugin-buble';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
	entry: 'src/plugin.js',
	useStrict: false,
	sourceMap: false,
	plugins: [
		buble()
	],
	globals: {
    'lodash.merge': 'merge'
  },
  external: ['lodash.merge'],
};
