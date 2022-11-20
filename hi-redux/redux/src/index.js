import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */
function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === "production". ' +
      'This means that you are running a slower development build of Redux. ' +
      'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
      'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
      'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore,
  combineReducers,
  bindActionCreators,// 把action creators转成拥有同名keys的对象，使用dispatch把每个action creator包装起来，这样可以直接调用它们。
  // 实际情况用到的并不多，惟一的应用场景是当你需要把action creator往下传到一个组件上，却不想让这个组件觉察到Redux的存在，而且不希望把Redux Store或dispatch传给它。
  applyMiddleware,// applyMiddleware() 函数是一个增强器，组合多个中间件，最终增强store.dispatch函数，dispatch时，可以串联执行所有中间件。
  compose,
  __DO_NOT_USE__ActionTypes
}
