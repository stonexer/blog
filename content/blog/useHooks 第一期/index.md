---
title: useHooks() 第一期：聊聊 useCallback
date: "2019-02-13"
description: 第一期我想先从 `useCallback` 聊起，因为它不影响我们的代码逻辑，主要面向于对性能要求较高或者有强迫症的同学。而这个看上去挺简单的 hook 里，其实藏着很多有意思的东西。
---

春节假期刚刚结束，各位休息的还不错吧？防止你玩的太 High 错过了消息，React Hooks 已经在 2019 年的农历初二正式发布了。如果你还不清楚 Hooks 是什么，强烈建议你先关掉本篇文章，打开 Hooks 的 [官方文档](https://reactjs.org/docs/hooks-intro.html)，耐心的看下去，相信你会爱上 Hooks 的。

从 Hooks 一出来就开始忍不住尝试使用 Hooks 了，一段时间下来也总结出几点小经验。这篇文章会假设你对 Hooks 有个大概的了解，提出一些你可能已经遇上或者将会疑惑的问题，然后粗浅的讨论下可能的最佳实践是什么。几个月的使用下来对 Hooks 的理解依然相当浅薄，总感觉简单优雅的 API 下面其实藏着很多值得注意的细节，如果你发现了任何疏漏或者有了更好的想法，非常欢迎讨论和指导~

第一期（不知道有没有第二期...）我想先从 `useCallback` 聊起，因为它不影响我们的代码逻辑，主要面向于对性能要求较高或者有强迫症的同学。而这个看上去挺简单的 hook 里，其实藏着很多有意思的东西。

## 超多的函数创建和 useCallback

乍一看使用了 Hooks 的 React 代码，可能会疑惑创建了这么多的 inline 函数会不会很影响性能？React 之前不是一直建议避免在 callback 里新建函数吗？首先可以看一下[官方的解释](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)，里面提到在 JavaScript 中闭包函数的性能是非常快的，并且得益于相对于 class 更轻量的函数组件，以及避免了 HOC，renderProps 等等额外层级，性能差不到那里去。

另外，React 提供了 `useMemo` 和 `useCallback`(`useCallback(fn, inputs)` === `useMemo(() => fn, inputs)`)。有些人可能会误以为 `useCallback` 可以用来解决创建函数造成的性能问题，其实恰恰相反，单从这个组件看的话 `useCallback` 只会更慢，因为 inline 函数是无论如何都会创建的，还增加了 `useCallback` 内部对 inputs 变化的检测。

```js
function A() {
  // ...
  const cb = () => {} /* 创建了 */
}

function B() {
  // ...
  const cb = React.useCallback(() => {} /* 还是创建了 */, [a, b])
}
```

`useCallback` 的真正目的还是在于缓存了每次渲染时 inline callback 的实例，这样方便配合上子组件的 `shouldComponentUpdate` 或者 `React.memo` 起到减少不必要的渲染的作用。需要不断提醒自己注意的是，在大部分 `callback` 都会是 `inline callback` 的未来，`React.memo` 和 `React.useCallback` 一定记得需要配对使用，缺了一个都可能导致性能不升反“降”，毕竟无意义的浅比较也是要消耗那么一点点点的性能。

话题稍扯远一点。其实不光是 Hooks 和函数式组件，即使是基于 class 的组件有时候也会遇到这样的问题，在很多列表渲染的时候，无法避免的会忍不住写下个箭头函数:

```js
class SomeComponent extends React.PureComponent {
  render() {
    const {
      list,
      thingsNeedToUseInCallbackButDoNotNeedInChild,
      onChange,
    } = this.props

    return (
      <ul>
        {list.map(item => (
          <Item
            key={item.key}
            onClick={() => {
              onChange(item, thingsNeedToUseInCallbackButDoNotNeedInChild)
            }}
          />
        ))}
      </ul>
    )
  }
}
```

因为有优先用 `PureComponent` 的习惯，这里的 `Item` 也是 `extends React.PureComponent`。但是这里因为 `onClick` 使用了 inline 函数，所以 `PureComponent` 默认的浅比较也同样失去了意义。

沿用 `useCallback` 的思路，其实这里我们也可以对 callback 进行自定义的 `memoize`:

```js
import { memoize } from "decko"

class SomeComponent extends React.PureComponent {
  @memoize
  getItemChangeHandler = (key, item) => {
    const {
      thingsNeedToUseInCallbackButDoNotNeedInChild,
      onChange,
    } = this.props

    onChange(item, thingsNeedToUseInCallbackButDoNotNeedInChild)
  }

  render() {
    const { list } = this.props

    return (
      <ul>
        {list.map(item => (
          <Item
            key={item.key}
            onClick={this.getItemChangeHandler(item.key, item)}
          />
        ))}
      </ul>
    )
  }
}
```

回到 Hooks 总结一下，`useCallback` 的作用在于利用 `memoize` 减少无效的 `re-render`，来达到性能优化的作用。还是那句老生常谈的话，“不要过早的性能优化”。从实际开发的经验来看，在做这类性能优化时，一定得观察比较优化的结果，因为某个小角落的 `callback` 就可能导致优化前功尽弃，甚至是适得其反。

## `useCallback` 适用于所有的场景吗？

看完上面的疑问，你可能觉得 `useCallback` 也挺清晰的，那其实是你忘了第二个参数 `inputs` 而产生的错觉。有一个比较复杂的问题是，在当前的实现下，如果一个 `callback` 依赖于一个经常变化的 `state`，这个 `callback` 的引用是无法缓存的。React 文档的 FAQ 里也提到了这个[问题](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)，还原一下问题的场景：

```js
function Form() {
  const [text, updateText] = useState("")

  const handleSubmit = useCallback(() => {
    console.log(text)
  }, [text]) // 每次 text 变化时 handleSubmit 都会变

  return (
    <>
      <input value={text} onChange={e => updateText(e.target.value)} />
      <ExpensiveTree onSubmit={handleSubmit} /> // 很重的组件，不优化会死的那种
    </>
  )
}
```

这个问题无解的原因在于，`callback` 内部对 `state` 的访问依赖于 JavaScript 函数的闭包，`callback` 不变时，访问的之前那个 `callback` 函数闭包中的 `state` 永远是当时的值。那让我们看一下 React 文档里的答案吧：

```js
function Form() {
  const [text, updateText] = useState("")
  const textRef = useRef()

  useLayoutEffect(() => {
    textRef.current = text // 将 text 写入到 ref
  })

  const handleSubmit = useCallback(() => {
    const currentText = textRef.current // 从 ref 中读取 text
    alert(currentText)
  }, [textRef]) // handleSubmit 只会依赖 textRef 的变化。不会在 text 改变时更新

  return (
    <>
      <input value={text} onChange={e => updateText(e.target.value)} />
      <ExpensiveTree onSubmit={handleSubmit} />
    </>
  )
}
```

文档里给出的解法乍一看可能不太好理解，我们一步步慢慢来。首先，因为在函数式组件里没有了 `this` 来存放一些实例的变量，所以 React 建议使用 `useRef` 来存放一些会发生变化的值，`useRef` 并不再单单是为了 DOM 的 ref 准备的，同时也会[用来存放组件实例的属性](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)。在 `updateText` 完成对 `text` 的更新后，再在 `useLayoutEffect` (等效于 `didMount` 和 `didUpdate`) 里写入 `textRef.current` 中。这样，在 `handleSubmit` 里取出的 `textRef` 中存放的值就永远是新值了。

是不是有一种恍然大悟的感觉。本质上我们想要达成的目标是以下几点：

1. 能充分利用一个函数式组件多次 `render` 时产生的相同功能的 `callback`
2. `callback` 能不受闭包限制，访问到这个函数式组件内部最新的状态

而因为函数式组件对组件实例访问的限制。上文的方法这里是利用 `useRef` 创造一个在多次 `render` 时一般不会变化的 `ref`, 再将需要访问的值更新到这个 `ref` 中，来实现”穿透“闭包的功能。那么有没有别的办法呢？

```js
function useCallback(callback) {
  const callbackHolder = useRef()

  useLayoutEffect(() => {
    callbackHolder.current = fn
  })

  return useMemo(() => (...args) => (0, ref.current)(...args), [])
}
```

这是一个不同于当前 React 内部 `useCallback` 实现的其他版本（参考自 [issue](https://github.com/facebook/react/issues/14099)）。反过来思考，创建一个用于存放最新 `callback` 的 `ref`，返回一个永远不变的”跳板“函数来达到实际调用最新的函数的作用。这样做还有一个更好的优点，这个缓存不需要依赖于显式的 `inputs` 声明，

这样是不是就完美了呢？肯定不是。。要不然这就肯定是官方的实现了。乍一看这个函数不会引入什么问题，但仔细看一下，在 DOM 更新时才对 `ref.current` 做更新，会导致在 `render` 阶段不能调用这个函数。更严重的是，因为对 `ref` 做了修改，在未来的 React 异步模式下可能会有诡异的情况出现（因此上文中官方的解法也是”异步模式不安全“的）。

值得期待的是，社区正在积极地讨论 `useCallback` 遇到的这些问题和解决方案。React 团队也计划在 React 的内部实现了一个更复杂，但是有效的版本。

## 现在该怎么办呢？

因为以上提到的种种原因，目前最佳的解法其实是使用 `useReducer`。因为 `reducer` 其实是在下次 `render` 时才执行的，所以在 `reducer` 里，访问到的永远是新的 `props` 和 `state`。

```js
const TodosDispatch = React.createContext(null)

function TodosApp() {
  // Tip: `dispatch` 不会在多次渲染时改变
  const [todos, dispatch] = useReducer(todosReducer)

  return (
    <TodosDispatch.Provider value={dispatch}>
      <DeepTree todos={todos} />
    </TodosDispatch.Provider>
  )
}
```

`useReducer` 返回的 `dispatch` 函数是自带了 `memozie` 的，不会在多次渲染时改变。所以如果你想同时把 `state` 作为 context 传递下去，请分成两个 context 来声明。

## 总结

当我们我们深入的看了看 `useCallback` 的使用和实现，是不是觉得看似简单的 API 也蕴藏着不少的玄机呢？Hooks 在使用上其实还有很多没能找到最佳实践的小细节，而跟着开发者去探寻它们也会是一件有意思的事情吧。感兴趣的话可以继续参与到决定 `useCallback` 的讨论中来~

[useCallback() invalidates too often in practice](https://github.com/facebook/react/issues/14099#thread-subscription-status)
