import merge from 'lodash.merge'
import objectPath from 'object-path'

const defaultReducer = (state, paths) => (
  paths.length === 0 ? state : paths.reduce((substate, path) => {
    objectPath.set(substate, path, objectPath.get(state, path))
    return substate
  }, {})
);

export default function createPersistedState ({
  key = 'vuex',
  paths = [],
  getState = (key) => JSON.parse(localStorage.getItem(key)),
  setState = (key, state) => localStorage.setItem(key, JSON.stringify(state)),
  reducer = defaultReducer
} = {}) {
  return store => {
    store.replaceState(
      merge({}, store.state, getState(key))
    )

    store.subscribe((mutation, state) => {
      setState(key, reducer(state, paths))
    })
  }
}
