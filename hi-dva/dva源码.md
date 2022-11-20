下文主要摘自以下，为了方便不迷路，加上方便后期修改增加笔记，clone 一下
# [https://juejin.cn/post/6844903766991306766](https://juejin.cn/post/6844903766991306766)
# [https://github.com/forthealllight/blog/issues/41](https://github.com/forthealllight/blog/issues/41)

# 一、redux-dark模式
 在使用redux和redux-saga的时候，特别是如何存放reducer函数和saga的generator函数，这两个函数是直接跟如何处理数据挂钩的。

  回顾一下,在redux中使用异步中间件redux-saga后，完整的数据和信息流向：

![](../redux/images/2022-11-15-01-43-14.png)

在存在异步的逻辑下，在UI Component中发出一个plain object的action,然后经过redux-saga这个中间件处理，redux-saga会将这个action传入相应channel,通过redux-saga的effect方法（比如call、put、apply等方法)生成一个描述对象，然后将这个描述对象转化成具有副作用的函数并执行。
  在redux-saga执行具有副作用的函数时，又可以dispatch一个action，这个action也是一个plain object，会直接传入到redux的reducer函数中进行处理，也就是说在redux-saga的task中发出的action，就是同步的action。
简单的概括：从UI组件上发出的action经过了2层的处理，分别是redux-saga中间件和redux的reducer函数。
  redux-dark模式很简单，就是将同一个子页面下的redux-saga处理action的saga函数，以及reducer处理该子页面下的state的reducer函数，放在同一个文件中。


# 二、dva 0.0.12版本的使用和源码理解
(1)、dva 0.0.12的使用
```
// 1. Initialize
const app = dva();

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  effects: {
    ['count/add']: function*() {
      console.log('count/add');
      yield call(delay, 1000);
      yield put({
        type: 'count/minus',
      });
    },
  },
  reducers: {
    ['count/add'  ](count) { return count + 1 },
    ['count/minus'](count) { return count - 1 },
  },
  subscriptions: [
    function(dispatch) {
      //..处理监听等等函数
    }
  ],
  
});

// 3. View
const App = connect(({ count }) => ({
  count
}))(function(props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count/add'})}}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count/minus'})}}>-</button>
    </div>
  );
});

// 4. Router
app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={App} />
  </Router>
);

// 5. Start
app.start(document.getElementById('root'));
```
只要三步就完成了一个例子，如何处理action呢，我们以一个图来表示：
![](../redux/images/2022-11-15-01-37-27.png)
也就是做UI组件上发出的对象类型的action，先去根据类型匹配=model初始化时候，effects属性中的action type。

如果在effects的属性中有相应的action type的处理函数，那么先执行effects中的相应函数，在执行这个函数里面可以二次发出action,二次发出的action会直接传入到reducer函数中。
如果effects的属性中没有相应的action type的处理函数，那么会直接从reducer中寻找有没有相应类型的处理函数。
在dva初始化过程中的effects属性中的函数，其实就是redux-saga中的saga函数，在该函数中处理直接的异步逻辑，并且该函数可以二次发出同步的action。

此外dva还可以通过router方法初始化路由等。

精简后的dva的源码：
```
//Provider全局注入store
import { Provider } from 'react-redux';
//redux相关的api
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
//redux-saga相关的api,takeEvery和takeLatest监听等等
import createSagaMiddleware, { takeEvery, takeLatest } from 'redux-saga';
//react-router相关的api
import { hashHistory, Router } from 'react-router';
//在react-router4.0之后已经较少使用,将路由的状态存储在store中
import { routerMiddleware, syncHistoryWithStore, routerReducer as routing } from 'react-router-redux';
//redux-actions的api,可以以函数式描述reducer等
import { handleActions } from 'redux-actions';
//redux-saga非阻塞调用effect
import { fork } from 'redux-saga/effects';

function dva() {
  let _routes = null;
  const _models = [];
  //new dva暴露了3个方法
  const app = {
    model,
    router,
    start,
  };
  return app;
  //添加models,一个model对象包含了effects,reducers,subscriptions监听器等等
  function model(model) {
    _models.push(model);
  }
  //添加路由
  function router(routes) {
    _routes = routes;
  }

  
  function start(container) {

    let sagas = {};
    //routing是react-router-redux的routerReducer别名,用于扩展reducer,这样以后扩展后的reducer就可以处理路由变化。
    let reducers = {
      routing
    };
    _models.forEach(model => {
      //对于每一个model,提取其中的reducers和effects，其中reducers用于扩展redux的reducers函数，而effects用于扩展redx-saga的saga处理函数。
      reducers[model.namespace] = handleActions(model.reducers || {}, model.state);
      //扩展saga处理函数，sagas是包含了所有的saga处理函数的对象
      sagas = { ...sagas, ...model.effects }; ---------------------------(1)
    });

    reducers = { ...reducers };
    
    //获取决定使用React-router中的那一个api
    const _history = opts.history || hashHistory;
    //初始化redux-saga
    const sagaMiddleware = createSagaMiddleware();
    //为redux添加中间件,这里添加了处理路由的中间件，以及redux-saga中间件。
    const enhancer = compose(
      applyMiddleware.apply(null, [ routerMiddleware(_history), sagaMiddleware ]),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const initialState = opts.initialState || {};
    //通过combineReducers来扩展reducers,同时生成扩展后的store实例
    const store = app.store = createStore(
      combineReducers(reducers), initialState, enhancer
    );

    // 执行model中的监听函数，监听函数中传入store.dispatch
    _models.forEach(({ subscriptions }) => {
      if (subscriptions) {
        subscriptions.forEach(sub => {
         store.dispatch, onErrorWrapper);
        });
      }
    });
    
     // 根据rootSaga来启动saga,rootSaga就是redux-saga运行的主task
    sagaMiddleware.run(rootSaga);
    
    
    //创建history实例子，可以监听store中的state的变化。
    let history;
    history = syncHistoryWithStore(_history, store); --------------------------------(2)
    

    // Render and hmr.
    if (container) {
      render();
      apply('onHmr')(render);
    } else {
      const Routes = _routes;
      return () => (
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      );
    }

    function getWatcher(k, saga) {
      let _saga = saga;
      let _type = 'takeEvery';
      if (Array.isArray(saga)) {
        [ _saga, opts ] = saga;
    
        _type = opts.type;
      }

      function* sagaWithErrorCatch(...arg) {
        try {
          yield _saga(...arg);
        } catch (e) {
          onError(e);
        }
      }

      if (_type === 'watcher') {
        return sagaWithErrorCatch;
      } else if (_type === 'takeEvery') {
        return function*() {
          yield takeEvery(k, sagaWithErrorCatch);
        };
      } else {
        return function*() {
          yield takeLatest(k, sagaWithErrorCatch);
        };
      }
    }

    function* rootSaga() {
      for (let k in sagas) {
        if (sagas.hasOwnProperty(k)) {
          const watcher = getWatcher(k, sagas[k]);
          yield fork(watcher);
        }                      -----------------------------(3)
      }
    }

    function render(routes) {
      const Routes = routes || _routes;
      ReactDOM.render((
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      ), container);
    }
  }
}

export default dva;

```
代码的阅读在上面都以注视的方式给出，值得注意的主要有一下3点：

在注释（1）处, handleActions是通过redux-actions封装后的一个API,用于简化reducer函数的书写。下面是一个handleActions的例子：
```
const reducer = handleActions(
  {
    INCREMENT: (state, action) => ({
      counter: state.counter + action.payload
    }),
​
    DECREMENT: (state, action) => ({
      counter: state.counter - action.payload
    })
  },
  { counter: 0 }
);
```
INCREMENT和DECREMENT属性的函数就可以分别处理,type = "INCREMENT"和type = "DECREMENT"的action。

在注释 (2) 处，通过react-router-redux的api，syncHistoryWithStore可以扩展history，使得history可以监听到store的变化。

在注释（3）处是一个rootSaga, 是redux-saga运行的时候的主Task，在这个Task中我们这样定义：
```
function* rootSaga() {
  for (let k in sagas) {
    if (sagas.hasOwnProperty(k)) {
      const watcher = getWatcher(k, sagas[k]);
      yield fork(watcher);
    }                     
  }
}
```
从全局的包含所有saga函数的sagas对象中，获取相应的属性，并fork相应的监听，这里的监听常用的有takeEvery和takeLatest等两个redux-saga的API等。
总结：上面就是dva最早版本的源码，很简洁的使用了redux、redux-saga、react-router、redux-actions、react-router-redux等.其目的也很简单：

简化redux相关生态的繁琐逻辑