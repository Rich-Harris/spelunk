import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'

let defaultConfig = [{
  input: 'src/spelunk.js',
  plugins: [
    resolve({
      extensions: ['.js'],
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    buble()
  ],
  output: [
    {
      file: './dist/spelunk.js',
      format: 'cjs'
    }
  ]
}]

export default commandLineArgs => {
  return defaultConfig
}