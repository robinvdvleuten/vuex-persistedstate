import Vue from 'vue'
import Vuex from 'vuex'
import Storage from 'dom-storage'
import {
  filterMutations,
  fromStorage,
  mergeState,
  partialState,
  persistedState,
  stringifyState,
} from './index'

// Do not show the production tip while running tests.
Vue.config.productionTip = false

Vue.use(Vuex)

it('can be created without any middleware', () => {
  expect(() => persistedState()).not.toThrow()
})

it("replaces store's state and subscribes to changes when initializing", () => {
  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }))

  const store = new Vuex.Store({ state: { original: 'state' } })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json',
  })

  expect(store.subscribe).toBeCalled()
})

it("does not replaces store's state when receiving invalid JSON", () => {
  const storage = new Storage()
  storage.setItem('vuex', '<invalid JSON>')

  const state = { nested: { original: 'state' } }

  const store = new Vuex.Store({ state })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith(state)
  expect(store.subscribe).toBeCalled()
})

it("does not replaces store's state when receiving null", () => {
  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify(null))

  const state = { nested: { original: 'state' } }

  const store = new Vuex.Store({ state })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith(state)
  expect(store.subscribe).toBeCalled()
})

it("respects nested values when it replaces store's state on initializing", () => {
  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }))

  const store = new Vuex.Store({ state: { original: 'state' } })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json',
  })
  expect(store.subscribe).toBeCalled()
})

it('should persist the changed parial state back to serialized JSON', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  const plugin = persistedState(
    mergeState(
      partialState(stringifyState(fromStorage({ storage })), ['changed'])
    )
  )
  plugin(store)

  store._subscribers[0]('mutation', { changed: 'state' })

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }))
})

it('persist the changed partial state back to serialized JSON under a configured key', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  const plugin = persistedState(
    mergeState(
      partialState(stringifyState(fromStorage({ storage, key: 'custom' })), [
        'changed',
      ])
    )
  )
  plugin(store)

  store._subscribers[0]('mutation', { changed: 'state' })

  expect(storage.getItem('custom')).toBe(JSON.stringify({ changed: 'state' }))
})

it('persist the changed full state back to serialized JSON when no paths are given', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  const plugin = persistedState(
    mergeState(partialState(stringifyState(fromStorage({ storage })), []))
  )
  plugin(store)

  store._subscribers[0]('mutation', { changed: 'state' })

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }))
})

it('persist the changed partial state back to serialized JSON under a nested path', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  const plugin = persistedState(
    mergeState(
      partialState(stringifyState(fromStorage({ storage })), ['foo.bar', 'bar'])
    )
  )
  plugin(store)

  store._subscribers[0]('mutation', { foo: { bar: 'baz' }, bar: 'baz' })

  expect(storage.getItem('vuex')).toBe(
    JSON.stringify({ foo: { bar: 'baz' }, bar: 'baz' })
  )
})

it('should not persist null values', () => {
  const storage = new Storage()
  const store = new Vuex.Store({
    state: { alpha: { name: null, bravo: { name: null } } },
  })

  const plugin = persistedState(
    mergeState(
      partialState(stringifyState(fromStorage({ storage })), [
        'alpha.name',
        'alpha.bravo.name',
      ])
    )
  )
  plugin(store)

  store._subscribers[0]('mutation', { charlie: { name: 'charlie' } })

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ alpha: { bravo: {} } }))
})

it('should merge array values when rehydrating by default', () => {
  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify({ persisted: ['json'] }))

  const store = new Vuex.Store({ state: { persisted: ['state'] } })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith({
    persisted: ['state', 'json'],
  })

  expect(store.subscribe).toBeCalled()
})

/* it('should not clone circular objects when rehydrating', () => {
  const circular = { foo: 'bar' }
  circular.foo = circular

  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify({ persisted: 'baz' }))

  const store = new Vuex.Store({ state: { circular } })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })))
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith({
    circular,
    persisted: 'baz',
  })

  expect(store.subscribe).toBeCalled()
}) */

it('should apply a custom arrayMerge function', () => {
  const storage = new Storage()
  storage.setItem('vuex', JSON.stringify({ persisted: [1, 2] }))

  const store = new Vuex.Store({ state: { persisted: [1, 2, 3] } })
  store.replaceState = jest.fn()
  store.subscribe = jest.fn()

  const plugin = persistedState(
    mergeState(stringifyState(fromStorage({ storage })), {
      arrayMerge: (stored, saved) => ['foo'],
    })
  )
  plugin(store)

  expect(store.replaceState).toBeCalledWith({
    persisted: ['foo'],
  })

  expect(store.subscribe).toBeCalled()
})

it("rehydrates store's state through the custom persistor function", () => {
  const store = new Vuex.Store({ state: {} })
  store.replaceState = jest.fn()

  const fromCustom = () => (mutation, state, store) => '{ "getter": "item" }'
  const plugin = persistedState(mergeState(stringifyState(fromCustom())))
  plugin(store)

  expect(store.replaceState).toBeCalledWith({ getter: 'item' })
})

it('persist the changed state back through the custom persistor function', () => {
  expect.assertions(1)

  const store = new Vuex.Store({ state: {} })
  const setter = jest.fn()

  const fromCustom = () => (mutation, state, store) => setter(state)
  const plugin = persistedState(mergeState(stringifyState(fromCustom())))
  plugin(store)

  store._subscribers[0]('mutation', { setter: 'item' })

  expect(setter).toBeCalledWith('{"setter":"item"}')
})

it('filters to specific mutations', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  const filter = mutation => ['filter'].indexOf(mutation) !== -1
  const plugin = persistedState(
    filterMutations(stringifyState(fromStorage({ storage })), filter)
  )
  plugin(store)

  store._subscribers[0]('mutation', { changed: 'state' })

  expect(storage.getItem('vuex')).toEqual('null')

  store._subscribers[0]('filter', { changed: 'state' })

  expect(storage.getItem('vuex')).toEqual('{"changed":"state"}')
})

it('uses the custom middleware function when persisting the state', () => {
  const storage = new Storage()
  const store = new Vuex.Store({ state: {} })

  let value

  const customReducer = next => (mutation, state, store) => {
    return (value = next(mutation, state, store))
  }

  const plugin = persistedState(
    mergeState(customReducer(stringifyState(fromStorage({ storage }))))
  )
  plugin(store)

  store._subscribers[0]('mutation', { custom: 'value' })

  expect(value).toEqual({ custom: 'value' })
})
