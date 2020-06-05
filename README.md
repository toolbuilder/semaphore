# Semaphore and Mutex

This library provides `Semaphore` and `Mutex` implementations. You can acquire a lock with either async or sync methods.

## Installation

```bash
npm install --save-dev @toolbuilder/semaphore
```

## Use

The API documentation is [here](docs/semaphore.md)

```javascript
import { Mutex } from '@toolbuilder/semaphore'

const mutex = new Mutex()
const release = await mutex.acquire()
release() // to release mutex
```

```javascript
import { Mutex, Semaphore } from '@toolbuilder/semaphore'

const semaphore = new Semaphore(5) // max locks that can be acquired
const release = await semaphore.acquire()
release() // to release lock
```
