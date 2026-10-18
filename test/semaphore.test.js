import test from 'node:test'
import assert from 'node:assert/strict'
import { Semaphore } from '@toolbuilder/semaphore'
import { times, wait } from './shared.js'

/**
 * @function
 * @param {Semaphore} lock
 * @param {number} threadTime
 * @returns {{state: import('./shared.js').State, thread: () => PromiseLike<void>}}
 */
const makeTestHarness = (lock, threadTime) => {
  let idSequence = 0
  const state = { started: 0, atOnce: 0, running: 0, ended: 0 }
  const threadStarting = id => { state.started++ }
  const threadRunning = id => { state.running++; state.atOnce = Math.max(state.running, state.atOnce) }
  const threadStopping = id => { state.ended++; state.running-- }
  const thread = async () => {
    const id = idSequence++
    threadStarting(id)
    await lock.acquire()
    threadRunning(id)
    await wait(threadTime - 10 + (20 * Math.random()))
    lock.release()
    threadStopping(id)
  }

  return { state, thread }
}

test('semaphore: as lock', async () => {
  const threadTime = 100
  const lock = new Semaphore()
  const { state, thread } = makeTestHarness(lock, threadTime)

  times(3, thread)
  await wait(4 * threadTime)
  times(4, thread)
  await wait(2 * threadTime)
  times(3, thread)
  await wait(15 * threadTime)
  assert.equal(state.started, 10, 'all threads started')
  assert.equal(state.ended, 10, 'all threads ran and ended')
  assert.equal(state.atOnce, 1, 'only one thread ran at once')
})

test('semaphore: thread pool', async () => {
  const threadTime = 100
  const atOnce = 3
  const lock = new Semaphore(atOnce)
  const { state, thread } = makeTestHarness(lock, threadTime)

  times(3, thread)
  await wait(2 * threadTime)
  times(4, thread)
  await wait(threadTime)
  times(3, thread)
  await wait(15 * threadTime)
  assert.equal(state.started, 10, 'all threads started')
  assert.equal(state.ended, 10, 'all threads ran and ended')
  assert.equal(state.atOnce, atOnce, `only ${atOnce} threads ran at once`)
})

test('semaphore: acquireSync', async () => {
  const threadTime = 100
  const atOnce = 3
  const lock = new Semaphore(atOnce)
  const { state, thread } = makeTestHarness(lock, threadTime)

  assert.equal(lock.acquireSync(), true, 'first lock available')
  assert.equal(lock.available(), true)
  assert.equal(lock.acquireSync(), true, 'second lock available')
  assert.equal(lock.available(), true)
  assert.equal(lock.acquireSync(), true, 'third lock available')
  assert.equal(lock.available(), false) // just took third lock
  assert.equal(lock.acquireSync(), false, 'fourth lock NOT available')
  assert.equal(lock.available(), false)
  times(3, thread)
  await wait(2 * threadTime)
  assert.equal(state.started - state.ended, 3, 'no threads ran critical section because of sync locks')
  times(4, thread)
  await wait(threadTime)
  times(3, thread)
  times(3, () => lock.release()) // release the 3 sync locks
  await wait(15 * threadTime)
  assert.equal(state.started, 10, 'all threads started')
  assert.equal(state.ended, 10, 'all threads ran and ended')
  assert.equal(state.atOnce, atOnce, `only ${atOnce} threads ran at once`)
})

test('semaphore: FIFO wakeup order', async () => {
  const lock = new Semaphore(2)
  /** @type {number[]} */
  const order = []

  const runTask = async (/** @type {number} */ id) => {
    await lock.acquire()
    order.push(id)
    lock.release()
  }

  // Hold both permits initially so subsequent acquires must queue
  assert.equal(lock.acquireSync(), true)
  assert.equal(lock.acquireSync(), true)

  const tasks = [1, 2, 3, 4, 5].map(id => runTask(id))

  // Release initial permits one by one
  lock.release()
  lock.release()

  await Promise.all(tasks)
  assert.deepEqual(order, [1, 2, 3, 4, 5], 'queued acquires resolve in strict FIFO order')
})

test('semaphore: no barging across acquire and release microtask boundaries', async () => {
  const lock = new Semaphore(1)
  /** @type {string[]} */
  const events = []

  // 1. Immediate acquire() reserves the permit synchronously before its microtask runs
  const firstAcquire = lock.acquire().then(() => {
    events.push('first acquired')
  })
  assert.equal(lock.available(), false, 'lock is unavailable synchronously after acquire()')
  assert.equal(lock.acquireSync(), false, 'acquireSync cannot steal permit before first acquire microtask runs')

  // 2. Queue a second async waiter while first holds the permit
  const secondAcquire = lock.acquire().then(() => {
    events.push('second acquired')
  })

  await firstAcquire
  assert.deepEqual(events, ['first acquired'])

  // 3. Release first permit while second waiter is queued; synchronous calls before
  //    secondAcquire's microtask runs must not barge ahead of secondAcquire
  lock.release()
  assert.equal(lock.available(), false, 'lock remains unavailable synchronously after release() when waiter is queued')
  assert.equal(lock.acquireSync(), false, 'acquireSync cannot barge ahead of queued waiter after release()')

  const thirdAcquire = lock.acquire().then(() => {
    events.push('third acquired')
  })

  await secondAcquire
  assert.deepEqual(events, ['first acquired', 'second acquired'], 'second waiter acquires before third')

  lock.release()
  await thirdAcquire
  assert.deepEqual(events, ['first acquired', 'second acquired', 'third acquired'])

  lock.release()
  assert.equal(lock.available(), true, 'lock is available once all waiters have released')
})
