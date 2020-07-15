import { Store, MutationPayload } from "vuex";
import merge from "deepmerge";
import * as shvl from "shvl";

interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
}

interface Options<State> {
  key?: string;
  paths?: string[];
  reducer?: (state: State, paths: string[]) => object;
  subscriber?: (
    store: Store<State>
  ) => (handler: (mutation: any, state: State) => void) => void;
  storage?: Storage;
  getState?: (key: string, storage: Storage) => any;
  setState?: (key: string, state: any, storage: Storage) => void;
  filter?: (mutation: MutationPayload) => boolean;
  arrayMerger?: (state: any[], saved: any[]) => any;
  rehydrated?: (store: Store<State>) => void;
  fetchBeforeUse?: boolean;
  overwrite?: boolean;
  assertStorage?: (storage: Storage) => void | Error;
  syncTabs?: boolean;
}

export default function <State>(
  options?: Options<State>
): (store: Store<State>) => void {
  options = options || {};

  const isBrowserContext = typeof window !== "undefined";
  const storage = options.storage || (window && window.localStorage);
  const key = options.key || "vuex";

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

  return function (store: Store<State>) {
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

    if (isBrowserContext && options.syncTabs) {
      window.addEventListener("storage", (storageEvent: StorageEvent) => {
        if (storageEvent.key === key) {
          setState(key, JSON.parse(storageEvent.newValue), storage);
        }
      });
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
