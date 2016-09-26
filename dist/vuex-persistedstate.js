/**
 * vuex-persistedstate v0.2.0
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

function createPersistedState (ref) {
  if ( ref === void 0 ) ref = {};
  var key = ref.key; if ( key === void 0 ) key = 'vuex';
  var paths = ref.paths; if ( paths === void 0 ) paths = [];

  return function (store) {
    store.replaceState(
      merge({}, store.state, JSON.parse(localStorage.getItem(key)))
    )

    store.subscribe(function (mutation, state) {
      var persistedState = paths.length === 0 ? state : paths.reduce(function (substate, path) {
        objectPath.set(substate, path, objectPath.get(state, path))
        return substate
      }, {})

      localStorage.setItem(key, JSON.stringify(persistedState))
    })
  }
}

return createPersistedState;

})));
