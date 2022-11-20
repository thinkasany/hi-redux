// https://juejin.cn/post/7014484781429850148
// 为什么 redux-saga 不能用 async await 实现
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
const iterator = gen();

// 生成器（generator）是一个产生迭代器（iterator）的函数，通过 yield 返回一个个值。
// 而迭代器是一个有 value 和 done 属性的对象，用于顺序遍历某个集合。

// console.log(iterator.next());
// console.log(iterator.next());
// console.log(iterator.next());
// console.log(iterator.next());

// { value: 1, done: false }
// { value: 2, done: false }
// { value: 3, done: false }
// { value: undefined, done: true }

console.log(Array.from(iterator)); // [ 1, 2, 3 ]

// 除了 next 方法，迭代器还有 return 和 throw 方法，就像函数里的 return 和 throw 语句一样。
// 比如用 iterator.return 中止后续流程

function* gen2() {
  const data = yield "getData";
  console.log(data);
}

const iterator2 = gen2();

const command = iterator2.next();
console.log("接收到的命令", command);
iterator2.next({ name: "xxlb" });

import { put, call } from "redux-saga/effects";
const loginService = () => {
  return {
    account: "think"
  };
};

function* login(action) {
  try {
    const loginInfo = yield call(loginService, action.account);
    console.log(loginInfo);
    yield put({ type: "loginSuccess", loginInfo });
  } catch (error) {
    yield put({ type: "loginFail", error });
  }
}
const res = login();
console.log(Array.from(res));

/**
 * generator 中 yield 出的不是 promise，而是一个个 effect，这个其实就是一个对象，
 * 声明式的告诉 saga 执行器要做什么，而不是命令式的自己实现。
 * generator 的执行器就根据不同的 effect 做不同的实现：
 * 用 async await 实现 redux saga 的话，那就要开发者命令式的组织异步过程，还难以测试。
 * 所以 redux-saga 自己实现了一个 generator 执行器，自带 runtime。generator 
 * 只要返回 effect 对象来声明式的说明要执行什么逻辑，然后由相应的 effect 实现来执行。
 * 这种声明式的思路除了易于组织异步过程外，还有非常好的可测试性。

编程范式：声明式/命令式编程
一、命令式编程：告诉编辑器如何做

function addOne(arr) {
    const result = [];
    for(let i = 0; i < arr.length; i++) {
        result.push(arr[i] + 1)
    }
    return result;
}
二、声明式编程：告诉编辑器做什么。如何做的部分被封装到“高阶函数”（如map，filter等）

const addOne = arr => arr.map(item => item + 1);
 
const double = arr => arr.map(item => item * 2);
声明式编程可以写出更简洁、更有表现力的代码。代码越少，bug出现的机率越小。

https://juejin.cn/post/6844903856032186382
    作为程序员，我们非常习惯去指出事情应该如何运行。“去遍历这个list”，“if 这种情况 then 那样做”，
    “把这个新值赋给这个变量”。当我们已经知道了如何告诉机器该如何做事时，为什么我们需要去学习这种看起来
    有些怪异的归纳抽离出来的函数工具？
    在很多情况中，命令式编程很好用。当我们写业务逻辑，我们通常必须要写命令式代码，没有可能在我们的
    专项业务里也存在一个可以归纳抽离的实现。
    但是，如果我们花时间去学习(或发现)声明式的可以归纳抽离的部分，它们能为我们的编程带来巨大的便捷。
    首先，我可以少写代码，这就是通往成功的捷径。而且它们能让我们站在更高的层面是思考，
    站在云端思考我们想要的是什么，而不是站在泥里思考事情该如何去做。
 */
