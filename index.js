import merge from 'deepmerge'
import * as shvl from 'shvl'

export function filterMutations(next, filter) {
  return function(mutation, state, store) {
    return next(mutation, filter(mutation) ? state : null, store)
  }
}

export function mergeState(next, options = {}) {
  return function(mutation, state, store) {
    return !mutation
      ? merge(state, next(mutation, state, store) || {}, options)
      : next(mutation, state, store)
  }
}

export function partialState(next, paths = []) {
  return function(mutation, state, store) {
    return next(
      mutation,
      paths.length > 0
        ? paths.reduce(
            (substate, path) => shvl.set(substate, path, shvl.get(state, path)),
            {}
          )
        : state,
      store
    )
  }
}

/**
 * Stringifies and parsed the state to / from JSON. Whenever it encounters
 * an error in the passed JSON string, it will just return null.
 */

export function stringifyState(next) {
  return function(mutation, state, store) {
    let value = next(mutation, JSON.stringify(state), store)

    try {
      return JSON.parse(value)
    } catch (e) {
      return null
    }
  }
}

export function fromStorage({
  key = 'vuex',
  storage = window && window.localStorage,
}) {
  return function(mutation, state, store) {
    return !mutation
      ? storage.getItem(key)
      : (storage.setItem(key, state), storage.getItem(key))
  }
}

/**
 * This method just returns the store's current state and will be used
 * as the default middleware so nothing happens actually.
 */

function noop(mutation, state, store) {
  return state
}

export function persistedState(next = noop) {
  return function(store) {
    // Compute the state by invoking the "middleware" chain.
    let state = next(undefined, store.state, store)

    // Rehydrate the store's state when bootstrapping.
    // @see https://vuex.vuejs.org/api/#replacestate
    store.replaceState(state)

    // The method invokes the composed middleware chain, but doesn't set
    // the state back to Vuex's store. This way we allow middleware to
    // persist or modify when it's rehydrated later.
    function subscribe(mutation, state) {
      next(mutation, state, store)
    }

    // Attach our subscriber to the store.
    store.subscribe(subscribe)
  }
}
