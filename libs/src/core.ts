import { writable, Readable, Writable } from 'svelte/store'
import { State, initialState, resolvingState, resolvedState, rejectedState, ResolvingState } from './states'


interface StateMap<Data> {
  [key: string]: State<Data>
}

declare type UnSubscriber = () => void
declare type Subscriber<T> = (value: T) => void
declare type Requester<Data, Input> = (i: Input) => Promise<Data>
declare type Updater<Data> = (state: State<Data>) => State<Data>

export interface AsyncStore<Data> extends Readable<State<Data>> {
  subscribe(subs: Subscriber<State<Data>>): UnSubscriber
  request(): Promise<Data>
  promise: Promise<Data>
}
type StoreMap<Data> = Map<number, Writable<State<Data>>>

export interface GetStore<Data, Input> {
  (input: Input): AsyncStore<Data>
}

function hashCode (input: string) {
  let hash = 0, i, chr;
  if (input.length === 0) return hash;
  for (i = 0; i < input.length; i++) {
    chr   = input.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function buildAsyncResource <Input, Data> (requester: Requester<Data, Input>) {
  const storeMap = new Map() as StoreMap<Data>

  const getStore: GetStore<Data, Input> = (input) => {
    const key = hashCode(JSON.stringify(input))
    const store = storeMap.get(key) || writable(initialState())
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

    const promise = request()

    return {
      subscribe: store.subscribe,
      request,
      promise,
    }
  }

  return {
    storeMap,
    getStore,
  }
}
