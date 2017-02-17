import merge from 'lodash.merge'
import objectPath from 'object-path'

const defaultReducer = (state, paths) => (
  paths.length === 0 ? state : paths.reduce((substate, path) => {
    objectPath.set(substate, path, objectPath.get(state, path))
    return substate
  }, {})
)

const defaultStorage = (() => {
  const hasLocalStorage = typeof window !== 'undefined' && window.localStorage
  if (hasLocalStorage) {
    return window.localStorage
  }

  class InternalStorage {
    setItem(key, item) {
      this[key] = item
      return item
    }
    getItem(key) {
      return this[key]
    }
    removeItem(key) {
      delete this[key]
    }
    clear() {
      Object.keys(this).forEach(key => delete this[key])
    }
  }

  return new InternalStorage()
})()

export default function createPersistedState({
  key = 'vuex',
  paths = [],
  getState = (key, storage) => {
    const value = storage.getItem(key)
    return value ? JSON.parse(value) : undefined
  },
  setState = (key, state, storage) => storage.setItem(key, JSON.stringify(state)),
  reducer = defaultReducer,
  storage = defaultStorage
} = {}) {
  return store => {
    store.replaceState(
      merge({}, store.state, getState(key, storage))
    )

    store.subscribe((mutation, state) => {
      setState(key, reducer(state, paths), storage)
    })
  }
}
