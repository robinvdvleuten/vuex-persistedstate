const createPersistedState = require('../dist/vuex-persistedstate')

describe('vuex-persistedstate', () => {
  let plugin
  let store

  it('replaces store\'s state and subscribes to changes when initializing', () => {
    window.localStorage.setItem('vuex', JSON.stringify({ persisted: 'json' }))
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = { original: 'state' }

    plugin = createPersistedState()
    plugin(store)

    expect(store.replaceState).toHaveBeenCalledWith({ original: 'state', persisted: 'json' })
    expect(store.subscribe).toHaveBeenCalled()
  })

  it('respects nested values when it replaces store\'s state on initializing', () => {
    window.localStorage.setItem('vuex', JSON.stringify({ nested: { persisted: 'json' }}))
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = { nested: { original: 'state' }}

    plugin = createPersistedState()
    plugin(store)

    expect(store.replaceState).toHaveBeenCalledWith({ nested: { persisted: 'json', original: 'state' }})
  })

  it('persist the changed parial state back to serialized JSON', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    plugin = createPersistedState({ paths: ['changed'] })
    plugin(store)

    const subscriber = store.subscribe.calls.argsFor(0)[0]
    subscriber('mutation', { changed: 'state' })

    const persisted = window.localStorage.getItem('vuex')
    expect(persisted).toEqual(jasmine.any(String))
    expect(JSON.parse(persisted)).toEqual({ changed: 'state' })
  })

  it('persist the changed partial state back to serialized JSON under a configured key', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    plugin = createPersistedState({ key: 'jasmine', paths: ['changed'] })
    plugin(store)

    const subscriber = store.subscribe.calls.argsFor(0)[0]
    subscriber('mutation', { changed: 'state' })

    const persisted = window.localStorage.getItem('jasmine')
    expect(persisted).toEqual(jasmine.any(String))
    expect(JSON.parse(persisted)).toEqual({ changed: 'state' })
  })

  it('persist the changed full state back to serialized JSON when no paths are given', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    plugin = createPersistedState()
    plugin(store)

    const subscriber = store.subscribe.calls.argsFor(0)[0]
    subscriber('mutation', { changed: 'state' })

    const persisted = window.localStorage.getItem('vuex')
    expect(persisted).toEqual(jasmine.any(String))
    expect(JSON.parse(persisted)).toEqual({ changed: 'state' })
  })

  it('rehydrates store\'s state through the configured getter', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    plugin = createPersistedState({ getState: () => ({ getter: 'item' }) })
    plugin(store)

    expect(store.replaceState).toHaveBeenCalledWith({ getter: 'item' })
  })

  it('persist the changed state back through the configured setter', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    plugin = createPersistedState({
      setItem: (key, state) => {
        expect(state).toEqual({ setter: 'item' })
      }
    })

    plugin(store)

    const subscriber = store.subscribe.calls.argsFor(0)[0]
    subscriber('mutation', { setter: 'item' })
  })

  it('uses the configured reducer when persisting the state', () => {
    store = jasmine.createSpyObj('store', ['replaceState', 'subscribe'])
    store.state = {}

    const customReducer = jasmine.createSpy()

    plugin = createPersistedState({ paths: ['custom'], reducer: customReducer })
    plugin(store)

    const subscriber = store.subscribe.calls.argsFor(0)[0]
    subscriber('mutation', { custom: 'value' })

    expect(customReducer).toHaveBeenCalledWith({ custom: 'value' }, ['custom'])
  })
})
