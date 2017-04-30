/**
 * @license
 *
 * vuex-persistedstate v1.4.1
 *
 * (c) 2017 Robin van der Vleuten <robin@webstronauts.co>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash.merge'), require('object-path')) :
  typeof define === 'function' && define.amd ? define(['lodash.merge', 'object-path'], factory) :
  (global.createPersistedState = factory(global.merge,global.objectPath));
}(this, (function (merge,objectPath) { 'use strict';

merge = 'default' in merge ? merge['default'] : merge;
objectPath = 'default' in objectPath ? objectPath['default'] : objectPath;

var defaultReducer = function (state, paths) { return (paths.length === 0
    ? state
    : paths.reduce(function (substate, path) {
        objectPath.set(substate, path, objectPath.get(state, path));
        return substate;
      }, {})); };

var canWriteToLocalStorage = function () {
  try {
    window.localStorage.setItem('_canWriteToLocalStorage', 1);
    window.localStorage.removeItem('_canWriteToLocalStorage');
    return true;
  } catch (e) {
    return false;
  }
};

var defaultStorage = (function () {
  if (
    typeof window !== 'undefined' &&
    'localStorage' in window &&
    canWriteToLocalStorage()
  ) {
    return window.localStorage;
  }

  var InternalStorage = function InternalStorage () {};

  InternalStorage.prototype.setItem = function setItem (key, item) {
    this[key] = item;
    return item;
  };

  InternalStorage.prototype.getItem = function getItem (key) {
    return this[key];
  };

  InternalStorage.prototype.removeItem = function removeItem (key) {
    delete this[key];
  };

  InternalStorage.prototype.clear = function clear () {
      var this$1 = this;

    Object.keys(this).forEach(function (key) { return delete this$1[key]; });
  };

  return new InternalStorage();
})();

function createPersistedState(
  ref
) {
  if ( ref === void 0 ) ref = {};
  var key = ref.key; if ( key === void 0 ) key = 'vuex';
  var paths = ref.paths; if ( paths === void 0 ) paths = [];
  var noJSON = ref.noJSON; if ( noJSON === void 0 ) noJSON = false;
  var getState = ref.getState; if ( getState === void 0 ) getState = noJSON
      ? function (key, storage) {
          var value = storage.getItem(key);
          return value && value !== 'undefined' ? value : undefined;
        }
      : function (key, storage) {
          var value = storage.getItem(key);
          return value && value !== 'undefined' ? JSON.parse(value) : undefined;
        };
  var setState = ref.setState; if ( setState === void 0 ) setState = noJSON
      ? function (key, state, storage) { return storage.setItem(key, state); }
      : function (key, state, storage) { return storage.setItem(key, JSON.stringify(state)); };
  var reducer = ref.reducer; if ( reducer === void 0 ) reducer = defaultReducer;
  var storage = ref.storage; if ( storage === void 0 ) storage = defaultStorage;
  var filter = ref.filter; if ( filter === void 0 ) filter = function () { return true; };
  var subscriber = ref.subscriber; if ( subscriber === void 0 ) subscriber = function (store) { return function (handler) { return store.subscribe(handler); }; };

  return function (store) {
    var savedState = getState(key, storage);
    if (typeof savedState === 'object') {
      if (typeof Promise !== 'undefined' && savedState instanceof Promise) {
        savedState.then(function (asyncSavedState) {
          store.replaceState(merge({}, store.state, asyncSavedState));
        });
      } else {
        store.replaceState(merge({}, store.state, savedState));
      }
    }

    subscriber(store)(function (mutation, state) {
      if (filter(mutation)) {
        setState(key, reducer(state, paths), storage);
      }
    });
  };
}

return createPersistedState;

})));
