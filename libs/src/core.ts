import { writable, Readable } from 'svelte/store'
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
export interface GetStore<Data, Input> {
  (input: Input): AsyncStore<Data>
}


export function buildAsyncResource <Input, Data> (requester: Requester<Data, Input>) {
  const store = writable({} as StateMap<Data>)
  const update = (key: string, updater: Updater<Data>) => store.update(st => ({ ...st, [key]: updater(st[key]) }))

  const getStore: GetStore<Data, Input> = (input) => {
    const key = JSON.stringify(input)
    update(key, () => initialState())

    async function request() {
      try {
        update(key, state => resolvingState(state))
        const data = await requester(input)
        update(key, state => resolvedState(state as ResolvingState<Data>, data))
        return data
      } catch (err) {
        update(key, state => rejectedState(state as ResolvingState<Data>, err))
        throw err
      }
    }

    const promise = request()

    return {
      subscribe: subs => store.subscribe(v => subs(v[key])),
      request,
      promise,
    }
  }

  return {
    store,
    getStore,
  }
}
