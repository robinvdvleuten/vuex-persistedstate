import merge from 'lodash.merge'
import objectPath from 'object-path'

export default function createPersistedState ({
  key = 'vuex',
  paths = []
} = {}) {
  return store => {
    store.replaceState(
      merge({}, store.state, JSON.parse(localStorage.getItem(key)))
    )

    store.subscribe((mutation, state) => {
      const persistedState = paths.length === 0 ? state : paths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path))
        return substate
      }, {})

      localStorage.setItem(key, JSON.stringify(persistedState))
    })
  }
}
