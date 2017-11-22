import Vue from 'vue';
import Vuex from 'vuex';
import Storage from 'dom-storage';
import createPersistedState from './index';

Vue.use(Vuex);

it('can be created with the default options', () => {
  window.localStorage = new Storage();
  expect(() => createPersistedState()).not.toThrow();
});

it("replaces store's state and subscribes to changes when initializing", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }));

  const store = new Vuex.Store({ state: { original: 'state' } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json'
  });
  expect(store.subscribe).toBeCalled();
});

it("does not replaces store's state when receiving invalid JSON", () => {
  const storage = new Storage();
  storage.setItem('vuex', '<invalid JSON>');

  const store = new Vuex.Store({ state: { nested: { original: 'state' } } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).not.toBeCalled();
  expect(store.subscribe).toBeCalled();
});

it("does not replaces store's state when receiving null", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify(null));

  const store = new Vuex.Store({ state: { nested: { original: 'state' } } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).not.toBeCalled();
  expect(store.subscribe).toBeCalled();
});

it("respects nested values when it replaces store's state on initializing", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }));

  const store = new Vuex.Store({ state: { original: 'state' } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json'
  });
  expect(store.subscribe).toBeCalled();
});

it('should persist the changed parial state back to serialized JSON', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({ storage, paths: ['changed'] });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed partial state back to serialized JSON under a configured key', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    storage,
    key: 'custom',
    paths: ['changed']
  });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('custom')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed full state back to serialized JSON when no paths are given', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({ storage });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed partial state back to serialized JSON under a nested path', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    storage,
    paths: ['foo.bar', 'bar']
  });
  plugin(store);

  store._subscribers[0]('mutation', { foo: { bar: 'baz' }, bar: 'baz' });

  expect(storage.getItem('vuex')).toBe(
    JSON.stringify({ foo: { bar: 'baz' }, bar: 'baz' })
  );
});

it('should not persist null values', () => {
  const storage = new Storage();
  const store = new Vuex.Store({
    state: { alpha: { name: null, bravo: { name: null } } }
  });

  const plugin = createPersistedState({
    storage,
    paths: ['alpha.name', 'alpha.bravo.name']
  });

  plugin(store);

  store._subscribers[0]('mutation', { charlie: { name: 'charlie' } });

  expect(storage.getItem('vuex')).toBe(
    JSON.stringify({ alpha: { bravo: {} } })
  );
});

it('should not merge array values when rehydrating', () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: ['json'] }));

  const store = new Vuex.Store({ state: { persisted: ['state'] } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: ['json'],
  });

  expect(store.subscribe).toBeCalled();
});

it('should not clone circular objects when rehydrating', () => {
  const circular = { foo: 'bar' };
  circular.foo = circular;

  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'baz' }));

  const store = new Vuex.Store({ state: { circular } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    circular,
    persisted: 'baz',
  });

  expect(store.subscribe).toBeCalled();
});

it("rehydrates store's state through the configured getter", () => {
  const storage = new Storage();

  const store = new Vuex.Store({ state: {} });
  store.replaceState = jest.fn();

  const plugin = createPersistedState({
    storage,
    getState: () => ({ getter: 'item' })
  });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({ getter: 'item' });
});

it('persist the changed state back through the configured setter', () => {
  expect.assertions(1);

  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    storage,
    setState: (key, state) => {
      expect(state).toEqual({ setter: 'item' });
    }
  });

  plugin(store);

  store._subscribers[0]('mutation', { setter: 'item' });
});

it('uses the configured reducer when persisting the state', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const customReducer = jest.fn();

  const plugin = createPersistedState({
    storage,
    paths: ['custom'],
    reducer: customReducer
  });
  plugin(store);

  store._subscribers[0]('mutation', { custom: 'value' });

  expect(customReducer).toBeCalledWith({ custom: 'value' }, ['custom']);
});

it('filters to specific mutations', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    storage,
    filter: mutation => ['filter'].indexOf(mutation) !== -1
  });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBeNull();

  store._subscribers[0]('filter', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});
