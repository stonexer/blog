---
title: useHooks(3) 聊聊数据请求这件小事
date: '2021-02-05'
description: 新的 React Context 早已正式发布，相信大部分 React 开发者对它都不陌生。很多人把 Context 当作替代 Redux 的方案。但我发现，还是有不少人误解了 Redux 尤其是 react-redux 的实现原理。你可以先想一个问题，react-redux 是通过触发 context value 的变化更新被 connect 的组件的吗？如果你的答案是 yes，那有可能你对 Context 的信心有点过高了。不用担心，这个问题没有一个标准答案。最开始是 no，曾经变成过 yes，目前暂时又变成了 no。
---

新的 React Context 早已正式发布，相信大部分 React 开发者对它都不陌生。很多人把 Context 当作替代 Redux 的方案。但我发现，还是有不少人误解了 Redux 尤其是 react-redux 的实现原理。你可以先想一个问题，react-redux 是通过触发 context value 的变化更新被 connect 的组件的吗？如果你的答案是 yes，那有可能你对 Context 的信心有点过高了。不用担心，这个问题没有一个标准答案。最开始是 no，曾经变成过 yes，目前暂时又变成了 no。

## react-redux 的选择

> 如果你对 react-redux 已经很熟悉了，可以跳过这一段，甚至本文对你可能也没什么价值了。如果你英语还不错，建议直接看 [react-redux 实现历史](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/) 这篇文章（不得不说 Redux 的维护者们都相当尽职尽责，我觉得这篇文章算得上开源项目自我剖析的典范，值得反复读几遍）

让我们回到 Legacy Context 的年代，很多同学都知道 Legacy Context 有一个比较严重的问题：Context 的变化会被中间某一级的 `shouldComponentUpdate` 阻断。但是我们都知道 react-redux 一直是需要在顶层提供一个 Provider 的，那么在这里 Context 的作用是什么呢？其实，在 react-redux 的 context 中存储的只是 redux store 的引用，正是通过 Context 才能在 connect 的包装组件中直接访问到顶层的 store。接下来每个 connect 的包装组件都会订阅（subscribe） store 的变化，并在变化时触发 render。这其中有很多细节，比如父子组件的执行顺序需要保证，同时需要尽可能避免没有意义的 render，性能要尽可能优化，这里就不展开细聊了。但是现在的 React 开发者可能并不完全领这个情，因为现在我们拥有了 React 官方提供的 `createContext`  API，订阅的细节就不需要 Redux 自己实现了吧？

的确，当新的 Context 公布之后，react-redux 也有了这样的计划，并很快在 v6 的版本中发布上线了。在这个版本中，主要的改动就是直接基于 React Context 来管理数据，由 context valve 的变化触发 connect 组件更新，从而删除了之前版本中比较复杂的 `Subscription` 逻辑。在发布前原有的预想中，使用了 React Context 的性能应该差别不大，但发布后得到的反馈却令人大跌眼镜。其中有 Breaking Change 的问题，有不好实现 hooks API 的问题，而最主要的还是在性能上的大幅下降。很多开发者在项目升级后都抱怨性能比以前差很远，性能问题的原因其实比较复杂，我们也会在下文中讨论其中一些，但已成事实的是在当时这些问题确实是无解的。后来在 React 维护者的建议下，react-redux v7 又切换回了之前在子组件中各自 `subscribe` 的方案。虽然 v7 版本又做了不少其他优化，且提供了深思熟虑之后的 hooks API，但这肯定不会是 react-redux 的终点，未来等到时机成熟，它一定还会再进化，跟随 React 的新 API 继续进步。

## Context 的问题？

上文我们提到在 react-redux v6 发布中遇到的问题，原因主要来自于直接使用了 React 官方的 Context 存放数据。那这究竟是 Context 本身的问题还是使用者用法上的问题呢？我个人的观点是，在新 Context 发布时，大家都有点过度相信它了。其实你看目前的 React 文档，在 Context 的适用范围上的确只是建议你放一些 theme，user 相关的全局数据，而没有让开发者把它当 redux store 来使用。很重要的一个原因可能就是： Context 没有提供一个重要的能力，只订阅 Context 中局部的 value，而不是只要 context valve 一变，所有依赖了此 Context 的组件就全部 render。

```javascript
const GlobalContext = createContext();

function App() {
  const [a, updateA] = useState('');
  const [b] = useState('');

  const contextValue = useMemo(() => ({ a, b }), [a, b]);

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConsumeA />
      <ConsumeB />
      <input value={a} onChange={(e) => updateA(e.target.value)} />
    </GlobalContext.Provider>
  );
}

function ConsumeA() {
  const { a } = useContext(GlobalContext);

  return a;
}

function ConsumeB() {
  const { b } = useContext(GlobalContext);

  console.log('render b with: ', b);

  return b;
}
```

[Codesandbox](https://codesandbox.io/s/react-context-m3pid)

即使你都用 useMemo 减少了 value 的变化，也依然避免不了因为 a 的变化导致 context 变化，从而无意义的渲染 ConsumeB 组件。而 React 目前对于这个问题的回答显然不能让所有开发者满意，拆分 context 或者多加一些组件层级确实有些麻烦。那么如果我们真的已经在此有性能瓶颈了，目前可以怎么做呢？好吧，那让我们进入一下危险地带。

## changedBits 和 observedBits (Unstable)

可能有些同学还不知道，其实目前的 `createContext` 是提供了第二个参数的：

```jsx
const GlobalContext = createContext({}, (prev, next) => {
  let result = 0;
  if (prev.a !== next.a) {
    result |= 0b01;
  }
  if (prev.b !== next.b) {
    result |= 0b10;
  }
  return result;
});

// ...

const ConsumeB = memo(() => {
  const { b } = useContext(GlobalContext, 0b10);

  console.log('render b with: ', b);

  return b;
});

// function readContext(Context, observedBits) {
//   const dispatcher =
//  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher
//       .current;
//   return dispatcher.readContext(Context, observedBits);
// }
```

[Codesandbox](https://codesandbox.io/s/react-context-changedbits-e4fh3)

通过自定义的 value 计算逻辑，我们告诉 React 不同的变化时的 "变化位"。与之相对应的，在每一个 consumer 那儿都可以写清楚自己需要的 "观察位"。这样 context 就可以精确到细粒度的变化，按实际需要的渲染消费者了。如果  `changedBits & observedBits === 0` ，useContext 的地方就会跳过（bail out）这次 render。

当然，虽然从 18 年开始这个 API 就存在了，也有不少前辈介绍和使用过 changedBits。但一直到今天，它依然处于 unstable 的状态 (如果想没有 warning 的使用它，你还要被 fired ...)，位运算对于大部分人来说确实也很难理解。那么，未来我们究竟会用什么样的方式，去描述依赖局部 value 这件事情呢？

## useSelectedContext (Unstable)

```javascript
const selection = useSelectedContext(Context, (c) => select(c));
```

哈哈，这个名字还很新，因为它的来源是昨晚 React 的一个新 [PR](https://github.com/facebook/react/pull/20646)，目前还属于非常早期的实验阶段。selector 这个概念最早可能也是来源于 react-redux。`mapStateToProps` 这个方法，让我们可以从 store 中“摘取”部分 state，后来也演化出了一些更高级的用法，例如 [reselect](https://github.com/reduxjs/reselect)。其实在今天之前，这两年的 React 社区讨论中，很早便有了关于 [Context Select](https://github.com/reactjs/rfcs/pull/119) 的 [RFC](https://github.com/gnoff/rfcs/blob/context-selectors/text/0000-context-selectors.md)，其中的方案和讨论都非常值得一看。

因为已经被官方实现了，在这儿我们就不讨论 RFC 中 polyfill 的实现方案了。只简单看一下 RFC 中关于用法的示例：

```javascript
let Context = React.createContext(‘’)

let App = ({ index, string }) => {
  return (
    <Context.Provider value={string}>
      <Foo index={index} />
    </Context.Provider>
  )
}

let Foo = React.memo(({ index }) => {
  let selector = React.useCallback(s => s.substring(0, index), [index])
  let selection = React.useContextSelector(Context, selector)
  return <span>{selection}</span>
})

// Foo renders (mount) and selector is called during Foo’s render: “abcd”
ReactRenderer.render(<App index={4} string=”abcdefg” />)

// Foo renders (props update) and selector is called during Foo’s render: “abcde”
ReactRenderer.render(<App index={5} string=”abcdefg” />)

// Foo does not render (memo props same), selector is called before Foo bails out (selection same): “abcde”
ReactRenderer.render(<App index={5} string=”abcdef*” />)

// Foo renders (selection update), selector is called before Foo’s render and the result is memoized and returned again during that render: “a*cde”
ReactRenderer.render(<App index={5} string=”a*cdef*” />)

// Foo renders (props update), selector is only called during Foo’s render even though the context value also changed: “a**d”
ReactRenderer.render(<App index={4} string=”a**def*” />)
```

第二个参数 `select` 方法很接近之前 react-redux 中 connect 的 `mapStateToProps`。在需要的时候，Context 的变化会触发 `select` 的重新算，返回的结果发生未发生变化，此组件会直接 bail out。

不管最后名字会不会改成 `useContextSelector` 或者 `useSelectedContextValue`，应该（但愿）在不久以后我们就能拥有 select context 的能力。到那个时候，react-redux 可能又会再次尝试直接使用 Context，而 Context 这个 API 可能会在 React 中扮演更重要的角色（很多库比如 Formik 都很需要这个能力）。

## 尾巴

其实关于 React Context 的种种选择，还有一个最重要的因素没有提，那就是 Concurrent Mode。比如 react-redux 使用 context 来存放数据的一个重要目的就是能够兼容 Concurrent Mode。但在这篇文章中完全没有提及，一方面是因为我对 Concurrent Mode 理解还很浅，更没有信心介绍给大家；另一方面可能是一旦考虑到并发，很多问题可能会复杂许多，并且还有很多不确定的成分。这篇文章以及这个系列的文章，都只是浅尝辄止的介绍一些可能还没被很多人了解的概念，再夹杂点个人理解的私货。如果能成为一个引子，让你能收获一点启发，再去深入研究它们背后的原理和目标，那就太好了！
