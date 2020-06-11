import typescript from 'rollup-plugin-typescript'

module.exports = [{
	input: './src/index.ts',
	output: {
		format: 'umd',
		file: './dist/index.js',
		name: 'm-store',
	},
	plugins: [
		typescript(),
	]
}]