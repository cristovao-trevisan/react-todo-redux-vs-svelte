
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;

export interface Readable<T> {
	subscribe(run: Subscriber<T>): Unsubscriber;
}


interface Unsubscribe {
  (): void
}
export interface Store {
  subscribe(listener: () => void): Unsubscribe
  // ...
}

