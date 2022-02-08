# Semaphore and Mutex

This library provides `Semaphore` and `Mutex` implementations. You can acquire a lock with either async or sync methods.

## Installation

```bash
npm install @toolbuilder/semaphore
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
await semaphore.acquire()
semaphore.release() // to release lock
```

## Contributing

Contributions are welcome. Please create a pull request.

* I use [pnpm](https://pnpm.js.org/) instead of npm.
* Package verification requires [pnpm](https://pnpm.io/) to be installed globally.
  * `npm install -g pnpm`
  * `pnpm install`
  * `pnpm test` to run unit tests
  * `pnpm run check:packfile` to test the pack file against Node ES and CommonJS projects, as well as Electron.
  * `pnpm run check` to validate the package is ready for commit

## Issues

This project uses Github issues.

## License

MIT
