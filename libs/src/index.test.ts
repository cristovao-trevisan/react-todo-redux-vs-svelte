import { buildAsyncStore, delayedTestRequester } from "."


interface Input { test: boolean }
interface Output { data: string }
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))


test('success path', async () => {
  jest.useFakeTimers()
  const result = { data: 'test' }
  const requester = delayedTestRequester<Output, Input>(result, 1000)

  const { useAsync } = buildAsyncStore(requester)

  const input = { test: true }
  const { subscribe } = useAsync(input)

  const subscription = jest.fn()
  const unsubscribe = subscribe(subscription)

  expect(subscription.mock.calls.length).toBe(1)
  expect(subscription.mock.calls[0][0]).toMatchObject({
    resolved: false,
    resolving: true,
    runs: 1,
  })
  
  jest.runAllTimers() // resolve timers
  jest.useRealTimers() // resolve promises
  await wait(0)
  
  expect(subscription.mock.calls.length).toBe(2)
  expect(subscription.mock.calls[1][0]).toMatchObject({
    resolved: true,
    resolving: false,
    data: { input, result },
  })

  unsubscribe()
})

test('rejection path', async () => {
  jest.useFakeTimers()
  const result = { data: 'test' }
  const requester = delayedTestRequester<Output, Input>(result, 1000, true)

  const { useAsync } = buildAsyncStore(requester)

  const input = { test: true }
  const { subscribe, promise } = useAsync(input)

  const subscription = jest.fn()
  const unsubscribe = subscribe(subscription)

  expect(subscription.mock.calls.length).toBe(1)
  expect(subscription.mock.calls[0][0]).toMatchObject({
    resolved: false,
    resolving: true,
    runs: 1,
  })
  
  jest.runAllTimers() // resolve timers
  jest.useRealTimers() // resolve promises
  await expect(promise).rejects.toBeTruthy()
  
  expect(subscription.mock.calls.length).toBe(2)
  expect(subscription.mock.calls[1][0]).toMatchObject({
    rejected: true,
    resolving: false,
  })
  expect(subscription.mock.calls[1][0].error).toEqual(new Error('Failed request'))
  unsubscribe()
})

test('Unsubscribe should work', async () => {
  jest.useFakeTimers()
  const result = { data: 'test' }
  const requester = delayedTestRequester<Output, Input>(result, 1000)

  const { useAsync } = buildAsyncStore(requester)

  const input = { test: true }
  const { subscribe } = useAsync(input)

  const subscription = jest.fn()
  const unsubscribe = subscribe(subscription)

  expect(subscription.mock.calls.length).toBe(1)
  
  unsubscribe()
  jest.runAllTimers() // resolve timers
  jest.useRealTimers() // resolve promises
  await wait(0)
  
  expect(subscription.mock.calls.length).toBe(1)
})
