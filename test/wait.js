/**
 * Create a promise that resolves after `ms` milliseconds.
 *
 * @param {Number} ms - the minimum number of milliseconds to wait before resolving.
 */
export const wait = (ms) => {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}
