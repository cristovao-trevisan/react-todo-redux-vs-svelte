
interface BaseState <Data> {
  data?: Data
  error?: Error
  // promise like flags
  resolving: boolean
  resolved: boolean
  rejected: boolean
  // timestamps
  startedAt?: Date
  finishedAt?: Date
  // more information
  runs: number
}

export interface InitialState <T> extends BaseState<T> {
  data?: undefined,
  error?: undefined,
  resolving: false,
  resolved: false,
  rejected: false,
  startedAt?: undefined
  finishedAt?: undefined
}


export interface ResolvingState <T> extends BaseState<T> {
  resolving: true,
  startedAt: Date
}

export interface ResolvedState <T> extends BaseState<T> {
  data: T,
  resolved: true,
  rejected: false,
  startedAt: Date
  finishedAt: Date
}

export interface RejectedState <T> extends BaseState<T> {
  error: Error,
  resolved: false,
  rejected: true,
  startedAt: Date
  finishedAt: Date
}

export type State <T> = InitialState<T> | ResolvingState<T> | ResolvedState<T> | RejectedState<T>

// builders

export const initialState = () : InitialState<any> => ({
  resolved: false,
  rejected: false,
  resolving: false,
  runs: 0,
})

export const resolvingState = <T> (prev: State<T>) : ResolvingState<T> => ({
  ...prev,
  resolving: true,
  startedAt: new Date(),
  runs: prev.runs + 1,
})

export const resolvedState = <T> (prev: ResolvingState<T>, data: T) : ResolvedState<T> => ({
  ...prev,
  data,
  resolved: true,
  rejected: false,
  resolving: false,
  finishedAt: new Date(),
})

export const rejectedState = <T> (prev: ResolvingState<T>, error: Error) : RejectedState<T> => ({
  ...prev,
  error,
  resolved: false,
  rejected: true,
  resolving: false,
  finishedAt: new Date(),
})
