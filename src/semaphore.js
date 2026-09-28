/**
 * @typedef {() => void} Resolver
 */

/**
 * Promise based semaphore.
 */
export class Semaphore {
  /**
   * Create a semaphore.
   *
   * @param {number} [max] - maximum number of locks that can be acquired at any given time
   */
  constructor (max = 1) {
    /** @private */
    this._max = max
    /** @private */
    this._active = 0
    /**
     * @private
     * @type {Resolver[]}
     */
    this._resolvers = [] // when locked, each acquire requires a new promise
  }

  /**
   * Returns whether a lock is available. If one is available,
   * acquireSync will succeed.
   * @returns {boolean} - true if a lock is available, false otherwise
   */
  available () { return !(this._active >= this._max) }

  /**
   * Acquires a lock synchronously.
   * @returns {boolean} - true if lock was acquired, false otherwise
   */
  acquireSync () {
    if (this._active >= this._max) return false
    this._active++
    return true
  }

  /**
   * Acquires a lock asynchronously.
   * @returns {PromiseLike<void>} - promise resolves when a lock has been acquired.
   */
  acquire () {
    this._active++
    if (this._active > this._max) {
      return new Promise(resolve => this._resolvers.push(resolve))
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Releases a lock so that it is available to be acquired.
   * Each acquire or acquireSync call must be matched by exactly one release call.
   * @returns {void}
   */
  release () {
    this._active--
    const resolver = this._resolvers.shift()
    if (resolver) resolver() // let awaiting code run by resolving a promise
  }
}
