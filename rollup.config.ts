import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.main, name: 'protoschema', format: 'umd', sourcemap: true },
		{ file: pkg.module, format: 'es', sourcemap: true },
	],
	plugins: [
		json(),
		typescript({ useTsconfigDeclarationDir: true }),
		commonjs(),
		resolve({
			mainFields: ['module', 'main', 'jsnext:main'],
		}),
		replace({
			ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			exclude: 'node_modules/**',
		}),
		(process.env.NODE_ENV === 'production'),
		sourceMaps(),
	],
	watch: {
		include: 'src/**',
	},
};
