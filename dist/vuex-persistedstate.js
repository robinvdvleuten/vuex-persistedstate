/**
 * @license
 *
 * vuex-persistedstate v1.0.0
 *
 * (c) 2016 Robin van der Vleuten <robin@webstronauts.co>
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

var defaultReducer = function (state, paths) { return (
  paths.length === 0 ? state : paths.reduce(function (substate, path) {
    objectPath.set(substate, path, objectPath.get(state, path));
    return substate
  }, {})
); };

function createPersistedState(ref) {
  if ( ref === void 0 ) ref = {};
  var key = ref.key; if ( key === void 0 ) key = 'vuex';
  var paths = ref.paths; if ( paths === void 0 ) paths = [];
  var getState = ref.getState; if ( getState === void 0 ) getState = function (key) { return JSON.parse(window.localStorage.getItem(key)); };
  var setState = ref.setState; if ( setState === void 0 ) setState = function (key, state) { return window.localStorage.setItem(key, JSON.stringify(state)); };
  var reducer = ref.reducer; if ( reducer === void 0 ) reducer = defaultReducer;

  return function (store) {
    store.replaceState(
      merge({}, store.state, getState(key))
    );

    store.subscribe(function (mutation, state) {
      setState(key, reducer(state, paths));
    });
  }
}

return createPersistedState;

})));
