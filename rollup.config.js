import fs from 'fs';
import buble from 'rollup-plugin-buble';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

export default {
	input: './index.js',
	useStrict: false,
	sourcemap: true,
	plugins: [
		buble(),
	],
	external: [
		'deepmerge',
		'shvl'
	],
	globals: {
		deepmerge: 'merge',
		shvl: 'shvl'
	},
	output: [
		{ file: pkg.main, format: 'cjs' },
		{ file: pkg.module, format: 'es' },
		{ file: pkg['umd:main'], format: 'umd', name: 'createPersistedState' }
	]
};
