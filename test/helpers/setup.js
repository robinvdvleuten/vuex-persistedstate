const browserEnv = require('browser-env')
const Storage = require('dom-storage')

browserEnv(['window'])
window.localStorage = new Storage()
