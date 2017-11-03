import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import fs from 'fs';

export default {
	entry: 'src/plugin.js',
	moduleName: 'createPersistedState',
	plugins: [
		resolve({
			jsnext: true,
      main: true
		}),
		commonjs(),
		buble()
	]
};
