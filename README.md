# vuex-persistedstate

Persist [Vuex](http://vuex.vuejs.org/) state with [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage).

[![NPM version](https://img.shields.io/npm/v/vuex-persistedstate.svg)](https://www.npmjs.com/package/vuex-persistedstate)
[![Build Status](https://img.shields.io/travis/robinvdvleuten/vuex-persistedstate.svg)](https://travis-ci.org/robinvdvleuten/vuex-persistedstate)

## Requirements

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

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

## API

### `createPersistedState([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `key <String>`: The key to store the persisted state under. (default: __vuex__)
- `paths <Array>`: An array of any paths to partially persist the state. If no paths are given, the complete state is persisted. (default: __[]__)
- `reducer <Function>`: A function that will be called to reduce the state to persist based on the given paths. Defaults to include the values.
- `subscriber <Function>`: A function called to setup mutation subscription. Defaults to `store => handler => store.subscribe(handler)`

- `storage <Storage>`: Instead for (or in combination with) `getState` and `setState`. Defaults to localStorage.
- `getState <Function>`: A function that will be called to rehydrate a previously persisted state. Defaults to using `storage`.
- `setState <Function>`: A function that will be called to persist the given state. Defaults to using `storage`.
- `filter <Function>`: A function that will be called to filter any mutations which will trigger `setState` on storage eventually. Defaults to `() => true`

## Customization

If it's not ideal to have the state of the Vuex store inside localstorage. One can easily implement the functionality to use [cookies](https://github.com/js-cookie/js-cookie) for that (or any other you can think of);

```js
import { Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

const store = new Store({
  // ...
  plugins: [
    createPersistedState({
      getState: (key) => Cookies.getJSON(key),
      setState: (key, state) => Cookies.set(key, state, { expires: 3, secure: true })
    })
  ]
})
```

Alternatively, an object following the Storage protocol (getItem, setItem, removeItem, clear, etc) could be passed:

```js
createPersistedState({ storage: window.sessionStorage })
```

This is especially useful when you are using this plugin in combination with server-side rendering, where one could pass an instanceo of [dom-storage](https://www.npmjs.com/package/dom-storage).

## License

MIT © [Robin van der Vleuten](https://www.robinvdvleuten.nl)
