import merge from 'lodash.merge';
import objectPath from 'object-path';

const defaultReducer = (state, paths) =>
  (paths.length === 0
    ? state
    : paths.reduce((substate, path) => {
        objectPath.set(substate, path, objectPath.get(state, path));
        return substate;
      }, {}));

const canWriteToLocalStorage = () => {
  try {
    window.localStorage.setItem('_canWriteToLocalStorage', 1);
    window.localStorage.removeItem('_canWriteToLocalStorage');
    return true;
  } catch (e) {
    return false;
  }
};

const defaultStorage = (() => {
  if (
    typeof window !== 'undefined' &&
    'localStorage' in window &&
    canWriteToLocalStorage()
  ) {
    return window.localStorage;
  }

  class InternalStorage {
    setItem(key, item) {
      this[key] = item;
      return item;
    }

    getItem(key) {
      return this[key];
    }

    removeItem(key) {
      delete this[key];
    }

    clear() {
      Object.keys(this).forEach(key => delete this[key]);
    }
  }

  return new InternalStorage();
})();

export default function createPersistedState(
  {
    key = 'vuex',
    paths = [],
    noJSON = false,
    getState = noJSON
      ? (key, storage) => {
          const value = storage.getItem(key);
          return value && value !== 'undefined' ? value : undefined;
        }
      : (key, storage) => {
          const value = storage.getItem(key);
          return value && value !== 'undefined' ? JSON.parse(value) : undefined;
        },
    setState = noJSON
      ? (key, state, storage) => storage.setItem(key, state)
      : (key, state, storage) => storage.setItem(key, JSON.stringify(state)),
    reducer = defaultReducer,
    storage = defaultStorage,
    filter = () => true,
    subscriber = store => handler => store.subscribe(handler)
  } = {}
) {
  return store => {
    const savedState = getState(key, storage);
    if (typeof savedState === 'object') {
      if (typeof Promise !== 'undefined' && savedState instanceof Promise) {
        savedState.then(asyncSavedState => {
          store.replaceState(merge({}, store.state, asyncSavedState));
        });
      } else {
        store.replaceState(merge({}, store.state, savedState));
      }
    }

    subscriber(store)((mutation, state) => {
      if (filter(mutation)) {
        setState(key, reducer(state, paths), storage);
      }
    });
  };
}
