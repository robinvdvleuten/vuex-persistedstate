import merge from 'lodash.merge';

const getPath = (obj, path, def, i) => {
  i = 0;
  path = path.split ? path.split('.') : path;

  while (obj && i < path.length)
    obj = obj[path[i++]];

  return obj === undefined ? def : obj;
};

const setPath = (obj, path, val, i) => {
  i = 0;
  path = path.split ? path.split('.') : path;

  for (; i < path.length - 1; i++) {
    obj = obj[path[i]] = getPath(obj, path[i], {});
  }

  return (obj[path[i]] = val);
};

const defaultReducer = (state, paths) =>
  (paths.length === 0
    ? state
    : paths.reduce(
        (substate, path) =>
          setPath(substate, path, getPath(state, path)) && substate,
        {}
      ));

const canWriteStorage = storage => {
  try {
    storage.setItem('@@', 1);
    storage.removeItem('@@');
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
