const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

export function delayedTestRequester<T, I>(result: T, delay: number, fail = false) {
  return async function(input: I) {
    await wait(delay)
    if (fail) throw new Error('Failed request')
    return { result, input }
  }
}

export function fetchJSONRequester<T>() {
  return (input: RequestInfo) => fetch(input).then(async response => {
    if (response.headers.get('Content-Type') !== 'application/json') {
      throw new Error('invalid-content-type')
    }
    
    return (await response.json()) as T
  })
}
