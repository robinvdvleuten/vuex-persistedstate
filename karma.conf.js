module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['browserify', 'jasmine'],
    files: ['test/**/*.spec.js'],
    preprocessors: {
      'test/**/*.spec.js': ['browserify']
    },
    singleRun: true
  })
}
