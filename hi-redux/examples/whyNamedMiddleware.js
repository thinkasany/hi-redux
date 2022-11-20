// // 一些疑问：为什么redux-thunk被称为中间件？
// // 为什么用到redux-thunk、redux-logger的时候要用applymiddleware

// // 现在有个需求
// // 现在有函数f1,f2,f3,希望f3执行时，f1,f2也执行

// const f1 = () => console.log(1)
// const f2 = () => console.log(2)

// // 解决这个需求
// const f3= () => {
//     f1()
//     f2()
//     console.log(3);
// }
// // f3()

// // 需求变更了, 增加 函数log打印一些数据,希望f3执行时，f1,f2,log函数执行
// function log(){
//     console.log('打印一些数据')
// }

// function newf3() {
//   f1()
//   f2()
//   log()
//   console.log('todo')
// }
// newf3()
// /**
//  *
//  * 在f3中执行f1、f2、log函数的问题逐渐显现了，不利于开发者理解和维护；
//  * 并且每新增一个函数都要修改一遍f3代码，不符合影响最小原则；
//  * 如果f1,f2需要参数呢？哪还是需要修改f3代码的，要在f3调用f1、f2、的地方将参数传入；
//  * 函数少了还好，调用的函数多了，难免出错；
//  * 有什么方法，既可以实现需求，又可以解耦f3与f1、f2、log...函数呢？
//  */

// 现在有函数f1,f2,f3,希望f3执行时，f1,f2也执行

function f1() {
  return function(next) {
    return function() {
      console.log("f1函数？？？1");
      return next();
    };
  };
}

function f2() {
  return function(next) {
    return function() {
      console.log("f2函数？？？");
      return next();
    };
  };
}
function log() {
  return function(next) {
    return function() {
      console.log("log函数");
      return next();
    };
  };
}
function f3(enhancer) {
  //1、如果有参数传入，执行参数
  if (typeof enhancer === "function") {
    console.log("enhancer", enhancer);
    // 7、这里执行了一个函数有入参f3，说明enhancer返回了一个函数，因为函数才能执行嘛
    // 现在从注释顺序走一遍，debugger
    return enhancer(f3);
  }
  //2、没有参数传入，执行原f3函数,option是参数
  return function(option) {
    console.log("没有函数参数传入, todo", option); //输出todo 这里是啥？
  };
}

// 5、调用中间件
// 下面写了三种，其实就是解决上面说的几种不同需求添加的时候，只需要这么改就直接ok了
// const start = f3()
// const start = f3(applyMiddleware(f1, f2));
const start = f3(applyMiddleware(f1, f2, log));
// // console.log('start', start)
// //3、这里执行start类似执行原来f3()
start({ type: "这里是啥？" });

//4、中间件函数
function applyMiddleware(...middlewares) {
  // 6、因为中间要执行的函数数量不确定，这里用...展开符

  // 8、根据备注7、这里应该返回一个函数是不是？可以理解吧,并且还要接收参数f3
  return function(f3) {
    // 9、middlewares是一个数组，可以理解吧？数组里面放的是f1、f2、log函数可以理解吧
    // export default [thunk, request, logger]; 摘自图管pledge项目middleware/index.js
    // 包括可以去npm看看事例也是这样子的
    // 看到这里还能明白为什么导出中间件要是一个数组
    // 10、数组是可以使用map的对吧，现将f1、f2、log这些函数执行一下
    const chain = middlewares.map(fn => fn());
    // console.log('chain', chain);
    // 11、将f1,f2,log合并执行一遍，并将f3函数传入
    const f = compose(...chain)(f3);

    // console.log('ff', f)
    //17、将合并好的函数返回回去

    return f();
  };
}
function compose(...funcs) {
    // 贴上链接  #compose
  //12、因为不知道要合并集合函数，所以要用...展开符
  // 13、如果没有数组传来，将参数传递出去
  if (funcs.length === 0) return args => args;
  // console.log('funcs', funcs[0])
  // 14、只有一个函数，直接执行
  if (funcs.length === 1) return funcs[0];

  //15、函数数量超出1个，使用reduce，因为funcs是数组，这可以理解吧
  // 16、 args是外面传递过来的参数，这里是f3
  return funcs.reduce(function(a, b) {
    return function(...args) {
      return a(b(...args));
    };
  });
}

// 完整代码
//  function applyMiddleware(...middlewares) {
//     //返回第一个函数，函数的参数是createStore
//     return function (createStore) {
//       //返回了第二层函数，函数的参数是reduer
//       return function (reducer) {
//         //获取原始store
//         const store = createStore(reducer)

//         //获取当前原始dispatch
//         let dispatch = store.dispatch

//         const middleAPI = {
//           dispatch: (action, ...args) => dispatch(action, args),
//           getState: store.getState,
//         }

//         // 得到了一个有中间件组成的函数数组；
//         const chian = middlewares.map((middleware) => middleware(middleAPI))

//         // 将中间件执行的结果返回给dispatch；在调用dispatch的时候使用的就是增强后的dispatch了
//         dispatch = compose(...chian)(store.dispatch)
//         console.log('dispatch', dispatch)
//         return {
//           ...store,
//           dispatch,
//         }
//       }
//     }
//   }

//   function compose(...funcs) {
//     if (funcs.length === 0) return (args) => args
//     if (funcs.length === 1) return funcs[0]
//     return funcs.reduce(
//       (a, b) =>
//         (...args) =>
//           a(b(...args))
//     )
//   }
