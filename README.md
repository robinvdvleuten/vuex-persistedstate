# vuex-persistedstate

Persist [Vuex](http://vuex.vuejs.org/) state with [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage).

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
