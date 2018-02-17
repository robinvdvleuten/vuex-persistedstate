import merge from 'deepmerge';
import shvl from 'shvl';

export default function(options, storage, key) {
  options = options || {};
  storage = options.storage || (window && window.localStorage);
  key = options.key || 'vuex';

  function canWriteStorage(storage) {
    try {
      storage.setItem('@@', 1);
      storage.removeItem('@@');
      return true;
    } catch (e) {}

    return false;
  }

  function getState(key, storage, value) {
    try {
      return (value = storage.getItem(key)) && value !== 'undefined'
        ? JSON.parse(value)
        : undefined;
    } catch (err) {}

    return undefined;
  }

  function filter() {
    return true;
  }

  function setState(key, state, storage) {
    return storage.setItem(key, JSON.stringify(state));
  }

  function reducer(state, paths) {
    return paths.length === 0
      ? state
      : paths.reduce(function(substate, path) {
        return shvl.set(substate, path, shvl.get(state, path));
      }, {});
  }

  function subscriber(store) {
    return function(handler) {
      return store.subscribe(handler);
    };
  }

  function blacklist(mutation) {
    return (!options.blacklist || !Array.isArray(options.blacklist)
      ? true
      : options.blacklist.indexOf(mutation.type) === -1 ? true : false
    )
  }

  if (!canWriteStorage(storage)) {
    throw new Error('Invalid storage instance given');
  }

  return function(store) {
    const savedState = shvl.get(options, 'getState', getState)(key, storage);

    if (typeof savedState === 'object' && savedState !== null) {
      store.replaceState(merge(store.state, savedState, {
        arrayMerge: function (store, saved) { return saved },
        clone: false,
      }));
    }

    (options.subscriber || subscriber)(store)(function(mutation, state) {
      if ((options.filter || filter)(mutation)) {
        if (blacklist(mutation)) {
          (options.setState || setState)(
            key,
            (options.reducer || reducer)(state, options.paths || []),
            storage
          );
        }
      }
    });
  };
};
