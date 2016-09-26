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
      localStorage.setItem(key, JSON.stringify(paths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path))
        return substate
      }, {})))
    })
  }
}
