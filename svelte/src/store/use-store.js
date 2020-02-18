import { useState, useEffect } from 'react';
import { get } from 'svelte/store';

export function useStore (store) {
  const initialValue = get(store);
  const [value, setValue] = useState(initialValue);
  useEffect(() => store.subscribe((value) => setValue(value)));
  return [value, store.set];
}

export function useReducerWithStore (reducer, store) {
  const dispatch = (action) => store.update(state => reducer(state, action));
  const [state] = useStore(store);
  return [state, dispatch];
}
