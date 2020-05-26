import { writable, Readable, Writable, get } from 'svelte/store'
import { State, initialState, resolvingState, resolvedState, rejectedState, ResolvingState } from './states'


declare type UnSubscriber = () => void
declare type Subscriber<T> = (value: T) => void
declare type Requester<Data, Input> = (i: Input) => Promise<Data>

export interface AsyncStore<Data> extends Readable<State<Data>> {
  subscribe(subs: Subscriber<State<Data>>): UnSubscriber
  request(): Promise<Data>
}
type StoreMap<Data> = Map<number | string, Writable<State<Data>>>

export interface GetStore<Data, Input> {
  (input: Input): AsyncStore<Data>
}

export interface HashingFunction <Input> {
  (input: Input): string | number
}

function objectHash (input: any) {
  const str = JSON.stringify(input)
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function buildAsyncResource <Input, Data> (
  requester: Requester<Data, Input>,
  hashing: HashingFunction<Input> = objectHash,
) {
  const storeMap = new Map() as StoreMap<Data>

  const getStore: GetStore<Data, Input> = (input) => {
    const key = hashing(input)
    const store = storeMap.get(key) || writable(initialState(), () => {
      // do request on subscription, if not already ran (or running)
      const state = get(store)
      if (!state.resolved && !state.resolving) request().catch(() => {})
    })
    storeMap.set(key, store)
    
    async function request(currentInput = input) {
      try {
        store.update(state => resolvingState(state))
        const data = await requester(currentInput)
        store.update(state => resolvedState(state as ResolvingState<Data>, data))
        return data
      } catch (err) {
        store.update(state => rejectedState(state as ResolvingState<Data>, err))
        throw err
      }
    }

    return { request, subscribe: store.subscribe }
  }

  return { getStore }
}
