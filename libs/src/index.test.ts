import { buildAsyncResource, delayedTestRequester } from "."


interface Input { test: boolean }
interface Output { data: string }
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))


test('Success path', async () => {
  jest.useFakeTimers()
  const result = { data: 'test' }
  const requester = jest.fn(delayedTestRequester<Output, Input>(result, 1000))

  const { getStore: getAsync } = buildAsyncResource(requester)

  const input = { test: true }
  const { subscribe } = getAsync(input)

  // test the requester is only run a after any subscription
  expect(requester.mock.calls.length).toBe(0)
  const subscription = jest.fn()
  const unsubscribe = subscribe(subscription)
  expect(requester.mock.calls.length).toBe(1)

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

test('Rejection path', async () => {
  jest.useFakeTimers()
  const result = { data: 'test' }
  const requester = delayedTestRequester<Output, Input>(result, 1000, true)

  const { getStore: getAsync } = buildAsyncResource(requester)

  const input = { test: true }
  const { subscribe } = getAsync(input)

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

  const { getStore: getAsync } = buildAsyncResource(requester)

  const input = { test: true }
  const { subscribe } = getAsync(input)

  const subscription = jest.fn()
  const unsubscribe = subscribe(subscription)

  expect(subscription.mock.calls.length).toBe(1)
  
  unsubscribe()
  jest.runAllTimers() // resolve timers
  jest.useRealTimers() // resolve promises
  await wait(0)
  
  expect(subscription.mock.calls.length).toBe(1)
})

test('Different inputs map to different states', async () => {
  const requester = jest.fn(async (input: { index: number }) => ({ data: 'test', ...input }))

  const { getStore } = buildAsyncResource(requester)

  const input1 = { index: 1 }
  const { subscribe: subs1 } = getStore(input1)
  const input2 = { index: 2 }
  const { subscribe: subs2 } = getStore(input2)

  const subscription1 = jest.fn()
  const subscription2 = jest.fn()
  subs1(subscription1)
  subs2(subscription2)
  
  expect(requester.mock.calls.length).toBe(2)
  expect(requester.mock.calls[0][0]).toBe(input1)
  expect(requester.mock.calls[1][0]).toBe(input2)

  await wait(1) // run promises

  expect(subscription1.mock.calls.length).toBe(2)
  expect(subscription1.mock.calls[1][0].data).toStrictEqual({ data: 'test', ...input1 })
  expect(subscription2.mock.calls.length).toBe(2)
  expect(subscription2.mock.calls[1][0].data).toStrictEqual({ data: 'test', ...input2 })
})

test('Setting hashing parameter', async () => {
  const requester = jest.fn(async (input: { index: number }) => ({ data: 'test', ...input }))

  const { getStore } = buildAsyncResource(requester, () => 'a')

  const input1 = { index: 1 }
  const input2 = { index: 2 }
  const { subscribe: subs1 } = getStore(input1)
  const { subscribe: subs2 } = getStore(input2)

  const subscription1 = jest.fn()
  const subscription2 = jest.fn()
  subs1(subscription1)
  subs2(subscription2)
  await wait(1)
  
  expect(requester.mock.calls.length).toBe(1)
  expect(subscription1.mock.calls.length).toBe(2)
  expect(subscription2.mock.calls.length).toBe(2)
})
