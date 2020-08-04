# vuex-persistedstate

Persist and rehydrate your [Vuex](http://vuex.vuejs.org/) state between page reloads.

<hr />

[![Build Status](https://img.shields.io/github/workflow/status/robinvdvleuten/vuex-persistedstate/test.svg)](https://github.com/robinvdvleuten/vuex-persistedstate/actions?query=workflow%3Atest)
[![NPM version](https://img.shields.io/npm/v/vuex-persistedstate.svg)](https://www.npmjs.com/package/vuex-persistedstate)
[![NPM downloads](https://img.shields.io/npm/dm/vuex-persistedstate.svg)](https://www.npmjs.com/package/vuex-persistedstate)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![MIT license](https://img.shields.io/github/license/robinvdvleuten/vuex-persistedstate.svg)](https://github.com/robinvdvleuten/vuex-persistedstate/blob/master/LICENSE)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Code Of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg)](https://github.com/robinvdvleuten/vuex-persistedstate/blob/master/.github/CODE_OF_CONDUCT.md)

<a href="https://webstronauts.com/">
    <img src="https://webstronauts.com/badges/sponsored-by-webstronauts.svg" alt="Sponsored by The Webstronauts" width="200" height="65">
</a>

## Requirements

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

## Install

```bash
npm install --save vuex-persistedstate
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/vuex-persistedstate/dist/vuex-persistedstate.umd.js"></script>
```

You can find the library on `window.createPersistedState`.

## Usage

```js
import createPersistedState from "vuex-persistedstate";

const store = new Vuex.Store({
  // ...
  plugins: [createPersistedState()],
});
```

Check out the example on [CodeSandbox](https://codesandbox.io).

[![Edit vuex-persistedstate](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/80k4m2598)

Or configured to use with [js-cookie](https://github.com/js-cookie/js-cookie).

[![Edit vuex-persistedstate with js-cookie](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xl356qvvkz)

Or configured to use with [secure-ls](https://github.com/softvar/secure-ls)

[![Edit vuex-persistedstate with secure-ls (encrypted data)](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vuex-persistedstate-with-secure-ls-encrypted-data-7l9wb?fontsize=14)

## Usage with Vuex modules

New plugin instances can be created in separate files, but must be imported and added to plugins object in the main Vuex file.

```js
/* module.js */
export const dataStore = {
  state: {
    data: []
  }
}

/* store.js */
import { dataStore } from './module'

const dataState = createPersistedState({
  paths: ['data']
})

export new Vuex.Store({
  modules: {
    dataStore
  },
  plugins: [dataState]
})
```

### Nuxt.js

It is possible to use vuex-persistedstate with Nuxt.js. It must be included as a NuxtJS plugin:

```javascript
// nuxt.config.js

...
plugins: [{ src: '~/plugins/localStorage.js', ssr: false }]
...
```

```javascript
// ~/plugins/localStorage.js

import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
  createPersistedState({
    key: 'yourkey',
    paths: [...]
    ...
  })(store)
}
```

## API

### `createPersistedState([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `key <String>`: The key to store the persisted state under. Defaults to `vuex`.
- `paths <Array>`: An array of any paths to partially persist the state. If no paths are given, the complete state is persisted. If an empty array is given, no state is persisted. Paths must be specified using dot notation. If using modules, include the module name. eg: "auth.user" Defaults to `undefined`.
- `reducer <Function>`: A function that will be called to reduce the state to persist based on the given paths. Defaults to include the values.
- `subscriber <Function>`: A function called to setup mutation subscription. Defaults to `store => handler => store.subscribe(handler)`.

- `storage <Object>`: Instead of (or in combination with) `getState` and `setState`. Defaults to localStorage.
- `getState <Function>`: A function that will be called to rehydrate a previously persisted state. Defaults to using `storage`.
- `setState <Function>`: A function that will be called to persist the given state. Defaults to using `storage`.
- `filter <Function>`: A function that will be called to filter any mutations which will trigger `setState` on storage eventually. Defaults to `() => true`.
- `overwrite <Boolean>`: When rehydrating, whether to overwrite the existing state with the output from `getState` directly, instead of merging the two objects with `deepmerge`. Defaults to `false`.
- `arrayMerger <Function>`: A function for merging arrays when rehydrating state. Defaults to `function (store, saved) { return saved }` (saved state replaces supplied state).
- `rehydrated <Function>`: A function that will be called when the rehydration is finished. Useful when you are using Nuxt.js, which the rehydration of the persisted state happens asynchronously. Defaults to `store => {}`
- `fetchBeforeUse <Boolean>`: A boolean indicating if the state should be fetched from storage before the plugin is used. Defaults to `false`.
- `assertStorage <Function>`: An overridable function to ensure storage is available, fired on plugins's initialization. Default one is performing a Write-Delete operation on the given Storage instance. Note, default behaviour could throw an error (like `DOMException: QuotaExceededError`).

## Customize Storage

If it's not ideal to have the state of the Vuex store inside localstorage. One can easily implement the functionality to use [cookies](https://github.com/js-cookie/js-cookie) for that (or any other you can think of);

[![Edit vuex-persistedstate with js-cookie](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xl356qvvkz?autoresize=1)

```js
import { Store } from "vuex";
import createPersistedState from "vuex-persistedstate";
import * as Cookies from "js-cookie";

const store = new Store({
  // ...
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => Cookies.get(key),
        // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
        setItem: (key, value) =>
          Cookies.set(key, value, { expires: 3, secure: true }),
        removeItem: (key) => Cookies.remove(key),
      },
    }),
  ],
});
```

In fact, any object following the Storage protocol (getItem, setItem, removeItem, etc) could be passed:

```js
createPersistedState({ storage: window.sessionStorage });
```

This is especially useful when you are using this plugin in combination with server-side rendering, where one could pass an instance of [dom-storage](https://www.npmjs.com/package/dom-storage).

### 🔐Encrypted Local Storage

If you need to use **Local Storage** (or you want to) but needs to protect the content of the data, you can [encrypt it]('https://github.com/softvar/secure-ls').

[![Edit vuex-persistedstate with secure-ls (encrypted data)](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vuex-persistedstate-with-secure-ls-encrypted-data-7l9wb?fontsize=14)

```js
import { Store } from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
var ls = new SecureLS({ isCompression: false });

// https://github.com/softvar/secure-ls

const store = new Store({
  // ...
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
});
```

### ⚠️ LocalForage ⚠️

As it maybe seems at first sight, it's not possible to pass a [LocalForage](https://github.com/localForage/localForage) instance as `storage` property. This is due the fact that all getters and setters must be synchronous and [LocalForage's methods](https://github.com/localForage/localForage#callbacks-vs-promises) are asynchronous.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://robinvdvleuten.nl"><img src="https://avatars3.githubusercontent.com/u/238295?v=4" width="100px;" alt=""/><br /><sub><b>Robin van der Vleuten</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Documentation">📖</a> <a href="#infra-robinvdvleuten" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/zweizeichen"><img src="https://avatars1.githubusercontent.com/u/654071?v=4" width="100px;" alt=""/><br /><sub><b>Sebastian</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zweizeichen" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zweizeichen" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/boris-graeff"><img src="https://avatars1.githubusercontent.com/u/3204379?v=4" width="100px;" alt=""/><br /><sub><b>Boris Graeff</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=boris-graeff" title="Code">💻</a></td>
    <td align="center"><a href="http://ciceropablo.github.io"><img src="https://avatars3.githubusercontent.com/u/174275?v=4" width="100px;" alt=""/><br /><sub><b>Cícero Pablo</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=ciceropablo" title="Documentation">📖</a></td>
    <td align="center"><a href="https://gatwal.com"><img src="https://avatars1.githubusercontent.com/u/7547554?v=4" width="100px;" alt=""/><br /><sub><b>Gurpreet Atwal</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gurpreetatwal" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://jcubed.me"><img src="https://avatars0.githubusercontent.com/u/43069023?v=4" width="100px;" alt=""/><br /><sub><b>Jakub Koralewski</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=JakubKoralewski" title="Code">💻</a></td>
    <td align="center"><a href="http://jankeesvw.com"><img src="https://avatars0.githubusercontent.com/u/167882?v=4" width="100px;" alt=""/><br /><sub><b>Jankees van Woezik</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jankeesvw" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://randomcodetips.com"><img src="https://avatars2.githubusercontent.com/u/8638243?v=4" width="100px;" alt=""/><br /><sub><b>Jofferson Ramirez Tiquez</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jofftiquez" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/DevoidCoding"><img src="https://avatars1.githubusercontent.com/u/21159634?v=4" width="100px;" alt=""/><br /><sub><b>Jordan Deprez</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=DevoidCoding" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/juanvillegas"><img src="https://avatars3.githubusercontent.com/u/773149?v=4" width="100px;" alt=""/><br /><sub><b>Juan Villegas</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=juanvillegas" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jrast.ch"><img src="https://avatars3.githubusercontent.com/u/146369?v=4" width="100px;" alt=""/><br /><sub><b>Jürg Rast</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jrast" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/antixrist"><img src="https://avatars3.githubusercontent.com/u/2387592?v=4" width="100px;" alt=""/><br /><sub><b>Kartashov Alexey</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=antixrist" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/LeonardPauli"><img src="https://avatars0.githubusercontent.com/u/1329834?v=4" width="100px;" alt=""/><br /><sub><b>Leonard Pauli</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=leonardpauli" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=leonardpauli" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/nelsliu9121"><img src="https://avatars2.githubusercontent.com/u/1268682?v=4" width="100px;" alt=""/><br /><sub><b>Nelson Liu</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/NLNicoo"><img src="https://avatars2.githubusercontent.com/u/6526666?v=4" width="100px;" alt=""/><br /><sub><b>Nico</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=NLNicoo" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=NLNicoo" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.qkdreyer.dev"><img src="https://avatars3.githubusercontent.com/u/717869?v=4" width="100px;" alt=""/><br /><sub><b>Quentin Dreyer</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=qkdreyer" title="Code">💻</a></td>
    <td align="center"><a href="http://raphaelsaunier.com"><img src="https://avatars2.githubusercontent.com/u/170256?v=4" width="100px;" alt=""/><br /><sub><b>Raphael Saunier</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=raphaelsaunier" title="Code">💻</a></td>
    <td align="center"><a href="http://rodneyrehm.de"><img src="https://avatars3.githubusercontent.com/u/186837?v=4" width="100px;" alt=""/><br /><sub><b>Rodney Rehm</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=rodneyrehm" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=rodneyrehm" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://wongyouth.github.io"><img src="https://avatars1.githubusercontent.com/u/944583?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Wang</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://atinux.com"><img src="https://avatars2.githubusercontent.com/u/904724?v=4" width="100px;" alt=""/><br /><sub><b>Sébastien Chopin</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=Atinux" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/zgayjjf"><img src="https://avatars1.githubusercontent.com/u/24718872?v=4" width="100px;" alt=""/><br /><sub><b>jeffjing</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zgayjjf" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/macarthuror"><img src="https://avatars0.githubusercontent.com/u/24395219?v=4" width="100px;" alt=""/><br /><sub><b>macarthuror</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=macarthuror" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/gangsthub"><img src="https://avatars2.githubusercontent.com/u/6775220?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Paul Melero</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/WTDuck"><img src="https://avatars0.githubusercontent.com/u/16686729?v=4" width="100px;" alt=""/><br /><sub><b>Guillaume da Silva</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=WTDuck" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SanterreJo"><img src="https://avatars2.githubusercontent.com/u/6465769?v=4" width="100px;" alt=""/><br /><sub><b>Jonathan Santerre</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=SanterreJo" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/fabiofdsantos/"><img src="https://avatars3.githubusercontent.com/u/8303937?v=4" width="100px;" alt=""/><br /><sub><b>Fábio Santos</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=fabiofdsantos" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/robertgr991"><img src="https://avatars0.githubusercontent.com/u/36689800?v=4" width="100px;" alt=""/><br /><sub><b>robertgr991</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robertgr991" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/YuraKolesnikov"><img src="https://avatars3.githubusercontent.com/u/28485518?v=4" width="100px;" alt=""/><br /><sub><b>JurijsKolesnikovs</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=YuraKolesnikov" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://davidsbond.github.io"><img src="https://avatars3.githubusercontent.com/u/6227720?v=4" width="100px;" alt=""/><br /><sub><b>David Bond</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=davidsbond" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
