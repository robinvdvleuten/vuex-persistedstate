import test from 'ava'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import sinon from 'sinon'
import createPersistedState from '../dist/vuex-persistedstate'

Vue.use(Vuex)

test('replaces store\'s state and subscribes to changes when initializing', t => {
  window.localStorage.clear()
  window.localStorage.setItem('vuex', JSON.stringify({ persisted: 'json' }))

  const store = new Store({ state: { original: 'state' } })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState()
  plugin(store)

  t.true(store.replaceState.calledWith({ original: 'state', persisted: 'json' }))
  t.true(store.subscribe.called)
})

test('respects nested values when it replaces store\'s state on initializing', t => {
  window.localStorage.clear()
  window.localStorage.setItem('vuex', JSON.stringify({ nested: { persisted: 'json' }}))

  const store = new Store({ state: { nested: { original: 'state' } }})
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState()
  plugin(store)

  t.true(store.replaceState.calledWith({ nested: { persisted: 'json', original: 'state' }}))
  t.true(store.subscribe.called)
})

test('persist the changed parial state back to serialized JSON', t => {
  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState({ paths: ['changed'] })
  plugin(store)

  const subscriber = store.subscribe.getCall(0).args[0]
  subscriber('mutation', { changed: 'state' })

  t.is(window.localStorage.getItem('vuex'), JSON.stringify({ changed: 'state' }))
})

test('persist the changed partial state back to serialized JSON under a configured key', t => {
  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState({ key: 'custom', paths: ['changed'] })
  plugin(store)

  const subscriber = store.subscribe.getCall(0).args[0]
  subscriber('mutation', { changed: 'state' })

  t.is(window.localStorage.getItem('custom'), JSON.stringify({ changed: 'state' }))
})

test('persist the changed full state back to serialized JSON when no paths are given', t => {
  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState()
  plugin(store)

  const subscriber = store.subscribe.getCall(0).args[0]
  subscriber('mutation', { changed: 'state' })

  t.is(window.localStorage.getItem('vuex'), JSON.stringify({ changed: 'state' }))
})

test('rehydrates store\'s state through the configured getter', t => {
  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState({ getState: () => ({ getter: 'item' }) })
  plugin(store)

  t.true(store.replaceState.calledWith({ getter: 'item' }))
})

test('persist the changed state back through the configured setter', t => {
  t.plan(1)

  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const plugin = createPersistedState({
    setState: (key, state) => {
      t.deepEqual(state, { setter: 'item' })
    }
  })

  plugin(store)

  const subscriber = store.subscribe.getCall(0).args[0]
  subscriber('mutation', { setter: 'item' })
})

test('uses the configured reducer when persisting the state', t => {
  window.localStorage.clear()

  const store = new Store({ state: {} })
  sinon.spy(store, 'replaceState')
  sinon.spy(store, 'subscribe')

  const customReducer = sinon.spy()

  const plugin = createPersistedState({ paths: ['custom'], reducer: customReducer })
  plugin(store)

  const subscriber = store.subscribe.getCall(0).args[0]
  subscriber('mutation', { custom: 'value' })

  t.true(customReducer.calledWith({ custom: 'value' }, ['custom']))
})
