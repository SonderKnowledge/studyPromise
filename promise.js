// 以下 promise 均指代 Promise 实例，环境是 Node.js。

// 题目一
const promise = new Promise((resolve, reject) =>{
  console.log(1)
  resolve()
  console.log(2)
})

promise.then(() =>{
  console.log(3)
})

console.log(4)
/**
 * 运行结果 1 2 4 3
 * 解释 Promise构造函数是同步执行的而promise.then中的函数是异步执行的
 */


// 题目二
const promise1 = new Promise((resolve, reject) =>{
  setTimeout(() => {
    resolve('success!')
  }, 1000)
})

const promise2 = promise1.then(() => {
  throw new Error('error!')
})

console.log('promise1', promise1)
console.log('promise2', promise2)

setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
  
}, 2000)
/**
 * 运行结果 
promise1 Promise { <pending> }
promise2 Promise { <pending> }
3
(node:4793) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: error!
(node:4793) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. Inthe future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
promise1 Promise { 'success!' }
promise2 Promise {
  <rejected> Error: error!
    at promise1.then (/Users/mac/workspace/studyPromise/promise.js:27:9)
    at <anonymous> }

  解释 promise有三种状态: pending、fulfilled或rejected状态改变只能是 pending-> fulfilled或者 pending -> rejected,
      状态一旦改变则不能再变。上面的promise2并不是promise1而是返回一个新的 Promise实例
 */


// 题目三
const promise3 = new Promise((resolve, reject) =>{
  resolve('success1')
  reject('error')
  resolve('success2')
})

promise3
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })
/**
 * 运行结果  then:  success1
 * 解释 构造函数中的resolve或reject只有第一次执行有效，多次调用没有任何作用，呼应代码二结论
 * promise状态一旦改变则不能改变
 */


// 题目四
Promise.resolve(1)
  .then((res) => {
    console.log(res)
    return 2
  })
  .catch((err) => {
    return 3
  })
  .then((res) => {
    console.log(res)
  })
/**
 * 运行结果 1 2
 * 解释 promise可以链式调用。提起链式调用通常会想到通过 return this 实现，不过Promise并不是
 * 这样实现的。promise每次调用 .then 或者 .catch都会返回一个新的promise，从而实现链式调用。
 */


// 题目五
const promise4 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('once')
    resolve('success')
  }, 1000)
})

const start = Date.now()
promise4.then((res) => {
  console.log(res, Date.now() - start)
})
promise4.then((res) => {
  console.log(res, Date.now() - start)
})
/**
 * 运行结果 once
          success 1002
          success 1003
   解释 promise的 .then 或者 .catch 可以被调用多次但这里的Promise 构造函数只执行一次，或者
   说promise内部状态一旦改变并且有了一个值那么后续每次调用 .then 或者 .catch 都会直接拿到该值
 */


// 题目六
Promise.resolve()
  .then(() => {
    return new Error('error!')
  })
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })
/**
 * 运行结果 then:  Error: error!
    at Promise.resolve.then (/Users/mac/workspace/studyPromise/promise.js:125:12)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
    at Function.Module.runMain (module.js:667:11)
    at startup (bootstrap_node.js:201:16)
    at bootstrap_node.js:626:3
   解释 .then 或者 .catch 中return一个error对象并不会抛出错误，所以不会被后续的 .catch捕获
   需要改成其中一种：
   1. return Promise.reject(new Error('error!!!'))
   2. throw new Error('error!!!')
   因为返回任意一个非 promise的值都会被包裹成promise对象，即 return new Error('error!!')
   等价于 return Promise.resolve(new Error('error!!'))
 */


//  题目七
const promise6 = Promise.resolve()
  .then(() => {
    return promise6
  })
promise6.catch(console.error)
/**
 * 运行结果
 * TypeError: Chaining cycle detected for promise #<Promise>
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
    at Function.Module.runMain (module.js:667:11)
    at startup (bootstrap_node.js:201:16)
    at bootstrap_node.js:626:3 
   解释 .then 或者 .catch 返回的值不能是promise本身否则会造成死循环。类似于：
    process.nextTick(function tick(){
      console.log('tick')
      process.nextTick(tick)
    })
 */


// 题目八
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
/**
 * 运行结果 1
 * 解释 .then 或者 .catch 的参数期望是函数,传入非函数则会发生值穿透
 */


//  题目九
Promise.resolve()
  .then(function success (res) {
    throw new Error('error')
  }, function fail (e) {
    console.log('fail: ', e)
  })
  .catch(function fail2 (e) {
    console.log('fail2: ', e)
  })
/**
 * 运行结果 
 * fail2: Error: error
    at success (...)
    at ...
   解释 .then 可以接收两个参数，第一个是处理成功的函数第二个是处理错误的函数 .catch是 .then第二个参数的
   简便写法，但是他们用法上有一点需要注意：.then 的第二个处理错误的函数捕获不了第一个处理成功的函数抛出的
   错误，而后续的 .catch可以捕获之前的错误，下面代码也可以：
   Promise.resolve()
    .then(function sucess1 (res) {
      throw new Error('error')
    }, function fail (e) {
      console.error('fail1: ', e)
    })
    .then(function success2 (res) {
    }, function fail2 (e) {
      console.error('fail2: ', e)
    })
 */


// 题目十
process.nextTick(() => {
  console.log('nextTick')
})
Promise.resolve()
  .then(() => {
    console.log('then')
  })
setImmediate(() => {
  console.log('setImmediate')
})
console.log('end')
/**
 * 运行结果
 * end
   nextTick
   then
   setImmediate
   解释 
   process.nextTick 和 promise.then 都属于 microtask，而 setImmediate 属于 macrotask，在事件循环的 
   check 阶段执行。事件循环的每个阶段（macrotask）之间都会执行 microtask，事件循环的开始会先执行一次 microtask。
 */
  