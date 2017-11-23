import fs from 'fs';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
	input: './index.js',
	useStrict: false,
	sourcemap: true,
	plugins: [
		buble(),
		resolve({
			jsnext: true,
      main: true
		}),
		commonjs()
	],
	output: [
		{ file: pkg.main, format: 'cjs' },
		{ file: pkg.module, format: 'es' },
		{ file: pkg['umd:main'], format: 'umd', name: 'createPersistedState' }
	]
};
