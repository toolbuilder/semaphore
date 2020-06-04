import { Mutex } from '../src/index'

const wait = (ms) => {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}

const mutex = new Mutex()
const sharedResource = [0, 1, 2, 3, 4, 5, 6][Symbol.iterator]()

const p1 = async () => {
  let { value, done } = {}
  while (!done) {
    const release = await mutex.acquire() // acquire resource
    wait(100);
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
