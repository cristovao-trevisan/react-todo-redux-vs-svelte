import { useState, useEffect } from 'react'
import { AsyncStore } from './core'
import { initialState, State } from './states'

export function useAsync <T, I> (store: AsyncStore<T>) {
  const [state, setState] = useState(initialState() as State<T>)
  useEffect(() => store.subscribe(v => setState(v)))
  return [state, store.request]
}
