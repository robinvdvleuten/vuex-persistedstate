const buble = require('rollup-plugin-buble')

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: ['test/**/*.spec.js'],
    preprocessors: {
      'test/**/*.spec.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [buble()],
      format: 'iife',
      sourceMap: 'inline'
    },
    reporters: ['spec'],
    singleRun: true
  })
}
