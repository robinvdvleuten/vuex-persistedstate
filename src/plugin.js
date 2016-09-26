import merge from 'lodash.merge'
import objectPath from 'object-path'

export default function createPersistedState ({
  key = 'vuex',
  paths = [],
  getState = (key) => JSON.parse(localStorage.getItem(key)),
  setState = (key, state) => localStorage.setItem(key, JSON.stringify(state))
} = {}) {
  return store => {
    store.replaceState(
      merge({}, store.state, getState(key))
    )

    store.subscribe((mutation, state) => {
      const persistedState = paths.length === 0 ? state : paths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path))
        return substate
      }, {})

      setState(key, persistedState)
    })
  }
}
