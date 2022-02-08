/**
 * @function
 * @param {number} n
 * @param {() => void} fn
 */
export const times = (n, fn) => {
  for (let i = 0; i < n; ++i) {
    fn()
  }
}

/**
 * Create a promise that resolves after `ms` milliseconds.
 *
 * @function
 * @param {number} ms - the minimum number of milliseconds to wait before resolving.
 * @returns {PromiseLike<void>} - a promise that resolves in ms milliseconds
 */
export const wait = (ms) => {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

/**
 * @typedef {{started: number, atOnce: number, running: number, ended: number}} State
 */
