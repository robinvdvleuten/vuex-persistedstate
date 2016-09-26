const createPersistedState = require('../dist/vuex-persistedstate')

describe('vuex-persistedstate', function () {
  var plugin, store

  it('replaces store\'s state and subscribes to changes when initializing', function () {
    window.localStorage.setItem('vuex', JSON.stringify({ persisted: 'json' }))
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = { original: 'state' }

    plugin = createPersistedState()
    plugin(store)

    expect(store.replaceState).toHaveBeenCalledWith({ original: 'state', persisted: 'json' })
    expect(store.subscribe).toHaveBeenCalled()
  })
})
