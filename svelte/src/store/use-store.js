import { useState, useEffect } from 'react';
import { get } from 'svelte/store';

/**
 * @param {import('svelte/store').Writable<T>} store
 * @returns {[T, (value: T) => void]} [value, setValue]
 * @template T
*/
export function useStore (store) {
  const initialValue = get(store);
  const [value, setValue] = useState(initialValue);
  useEffect(() => store.subscribe((value) => setValue(value)));
  return [value, store.set];
}

/**
 * @param {(s: T, a: any) => T} reducer 
 * @param {import('svelte/store').Writable<T>} store
 * @returns {[T, (a: any) => void]} [state, dispatch]
 * @template T
 */
export function useReducerWithStore (reducer, store) {
  const dispatch = (action) => store.update(state => reducer(state, action));
  const [state] = useStore(store);
  return [state, dispatch];
}
