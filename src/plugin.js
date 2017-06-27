import merge from 'lodash.merge';
import objectPath from 'object-path';

const defaultReducer = (state, paths) =>
  (paths.length === 0
    ? state
    : paths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path));
        return substate;
      }, {}));

const canWriteStorage = storage => {
  try {
    storage.setItem('_canWriteToLocalStorage', 1);
    storage.removeItem('_canWriteToLocalStorage');
    return true;
  } catch (e) {
    return false;
  }
};

export default function createPersistedState(
  {
    key = 'vuex',
    paths = [],
    getState = (key, storage) => {
      const value = storage.getItem(key);

      try {
        return value && value !== 'undefined' ? JSON.parse(value) : undefined;
      } catch (err) {
        return undefined;
      }
    },
    setState = (key, state, storage) =>
      storage.setItem(key, JSON.stringify(state)),
    reducer = defaultReducer,
    storage = window && window.localStorage,
    filter = () => true,
    subscriber = store => handler => store.subscribe(handler)
  } = {}
) {
  if (!canWriteStorage(storage)) {
    throw new Error('Invalid storage instance given');
  }

  return store => {
    const savedState = getState(key, storage);
    if (typeof savedState === 'object') {
      store.replaceState(merge({}, store.state, savedState));
    }

    subscriber(store)((mutation, state) => {
      if (filter(mutation)) {
        setState(key, reducer(state, paths), storage);
      }
    });
  };
}
