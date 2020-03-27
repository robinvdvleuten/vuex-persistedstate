import { Store, MutationPayload } from "vuex";
import merge from "deepmerge";
import * as shvl from "shvl";

interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
}

interface Options {
  key?: string;
  paths?: string[];
  reducer?: (state: any, paths: string[]) => object;
  subscriber?: (
    store: typeof Store
  ) => (handler: (mutation: any, state: any) => void) => void;
  storage?: Storage;
  getState?: (key: string, storage: Storage) => any;
  setState?: (key: string, state: typeof Store, storage: Storage) => void;
  filter?: (mutation: MutationPayload) => boolean;
  arrayMerger?: (state: any, saved: any) => any;
  rehydrated?: (store: typeof Store) => void;
  fetchBeforeUse?: boolean;
  overwrite?: boolean;
  assertStorage?: (storage: Storage) => void | Error;
}

export default function (
  options?: Options | null,
  storage?: Storage | null,
  key?: string | null
) {
  options = options || {};
  storage = options.storage || storage || (window && window.localStorage);
  key = options.key || key || "vuex";

  function getState(key, storage) {
    let value;

    try {
      return (value = storage.getItem(key)) && typeof value !== "undefined"
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
    return Array.isArray(paths)
      ? paths.reduce(function (substate, path) {
          return shvl.set(substate, path, shvl.get(state, path));
        }, {})
      : state;
  }

  function subscriber(store) {
    return function (handler) {
      return store.subscribe(handler);
    };
  }

  const assertStorage =
    options.assertStorage ||
    (() => {
      storage.setItem("@@", 1);
      storage.removeItem("@@");
    });

  assertStorage(storage);

  const fetchSavedState = () => (options.getState || getState)(key, storage);

  let savedState;

  if (options.fetchBeforeUse) {
    savedState = fetchSavedState();
  }

  return function (store) {
    if (!options.fetchBeforeUse) {
      savedState = fetchSavedState();
    }

    if (typeof savedState === "object" && savedState !== null) {
      store.replaceState(
        options.overwrite
          ? savedState
          : merge(store.state, savedState, {
              arrayMerge:
                options.arrayMerger ||
                function (store, saved) {
                  return saved;
                },
              clone: false,
            })
      );
      (options.rehydrated || function () {})(store);
    }

    (options.subscriber || subscriber)(store)(function (mutation, state) {
      if ((options.filter || filter)(mutation)) {
        (options.setState || setState)(
          key,
          (options.reducer || reducer)(state, options.paths),
          storage
        );
      }
    });
  };
}
