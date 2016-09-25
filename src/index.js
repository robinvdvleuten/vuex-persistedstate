import merge from 'lodash.merge'
import objectPath from 'object-path'

export default function createPersistedState ({
  key = 'vuex',
  paths = []
} = {}) {
  return store => {
    const persistedPaths = ['auth0.idToken']
    const persistedState = JSON.parse(localStorage.getItem(key))

    store.replaceState(merge({}, store.state, persistedState))

    store.subscribe((mutation, state) => {
      localStorage.setItem('vuex', JSON.stringify(persistedPaths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path))
        return substate
      }, {})))
    })
  }
}
