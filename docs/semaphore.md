# Table of Contents

* [Semaphore](#sempahore)
  * [constructor](#constructor)
  * [available](#available)
  * [acquireSync](#acquiresync)
  * [acquire](#acquire)
  * [release](#release)
* [Mutex](#mutex)
  * [constructor](#constructor-1)
  * [available](#available-1)
  * [acquireSync](#acquiresync-1)
  * [acquire](#acquire-1)

## Semaphore

Promise based semaphore.

### constructor

* `max` **[Number][13]** maximum number of locks that can be acquired at any given time (optional, default `1`)

### available

  Returns whether a lock is available. If one is available, acquireSync will succeed.

### acquireSync

Acquires a lock synchronously.

Returns **[Boolean][14]** true if lock was acquired, false otherwise

### acquire

Acquires a lock asynchronously.

Returns **[Promise][15]** promise resolves when a lock has been acquired.

### release

Releases a lock so that it is available to be acquired. Each acquire or acquireSync call must be matched by exactly one release call.

## Mutex

Simple mutex class.

### constructor

The constructor takes no arguments.

```javascript
const mutex = new Mutex()
const release = await mutex.acquire()
release() // to release mutex
```

### available

Determine if the lock is available.

Returns **[Boolean][14]** true if lock is available, false otherwise

### acquireSync

Get a lock if available.

```javascript
const mutex = new Mutex()
const release = mutex.acquireSync()
if (release) release()
```

Returns **(null | [Function][16])** if the lock is available, returns a
function to release it. Otherwise returns null. The release function can
be called multiple times, it will only release once.

### acquire

Acquire a lock.

Returns **[Promise][15]** returns a Promise that resolves to a release function. The release
function can be called multiple times, it will only release once.

[13]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[14]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[15]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[16]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
