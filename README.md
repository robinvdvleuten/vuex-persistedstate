# vuex-persistedstate

Persist [Vuex](http://vuex.vuejs.org/) state with [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage).

[![NPM version](https://img.shields.io/npm/v/vuex-persistedstate.svg?style=flat-square)](https://www.npmjs.com/package/vuex-persistedstate)
[![Build Status](https://img.shields.io/travis/robinvdvleuten/vuex-persistedstate.svg?style=flat-square)](https://travis-ci.org/robinvdvleuten/vuex-persistedstate)

## Installation

```bash
$ npm install vuex-persistedstate
```

## Usage

```js
import createPersistedState from 'vuex-persistedstate'

const store = new Vuex.Store({
  // ...
  plugins: [createPersistedState()]
})
```

## License

[MIT](http://opensource.org/licenses/MIT)
