# Semaphore and Mutex

This library provides `Semaphore` and `Mutex` implementations. You can acquire a lock with either async or sync methods.

There are almost always better approaches to managing concurrency than semaphores and mutexes.

* Async iterables do a nice job of serializing async operations and providing back pressure.
* For a thread pool sort of thing consider `Promise.race` or for async iterators, the 'pool' function of [Await-For-It](https://github.com/toolbuilder/await-for-it).
* Join - `Promise.all` and for async iterators, [Await-For-It](https://github.com/toolbuilder/await-for-it) has a 'zip' method.
* Fork - Any pub/sub technique, or for async iterators, [Await-For-It](https://github.com/toolbuilder/await-for-it) has a 'publish' method.

Here's a `Mutex` example. `Semaphore` works the same way, but you can specify the maximum number of locks that can be acquired at any given time in the constructor. The number defaults to one for `Mutex`.

```javascript
import { Mutex } from '@toolbuilder/semaphore'

const wait = (ms) => {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

const mutex = new Mutex()
const sharedResource = [0, 1, 2, 3, 4, 5, 6][Symbol.iterator]()

const p1 = async () => {
  let { value, done } = {}
  while (!done) {
    const release = await mutex.acquire() // acquire resource
    wait(100); // pretend it takes awhile to use resource
    ({ value, done } = sharedResource.next()) // use resource
    if (!done) console.log(`p1: ${value}`)
    release() // release resource
  }
}

const p2 = async () => {
  let { value, done } = {}
  while (!done) {
    const release = await mutex.acquire()
    wait(100);
    ({ value, done } = sharedResource.next())
    if (!done) console.log(`p2: ${value}`)
    release()
  }
}

p1()
p2()
```
