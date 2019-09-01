---
title: 从 React 到 Reason
date: "2018-01-01"
description: 如果你是一个 React 爱好者，开始在各种站点听到有人谈论 Reason 这个新语言，也看见 [Jordan](https://github.com/jordwalke)（React 作者）说 ReasonReact 将是未来，但你却是不知道从哪下手，那么这篇小教程就是为你准备的。
---

![ReasonReact](http://7xr8pm.com1.z0.glb.clouddn.com/ReasonReact.png)

> 如果你是一个 React 爱好者，开始在各种站点听到有人谈论 Reason 这个新语言，也看见 [Jordan](https://github.com/jordwalke)（React 作者）说 ReasonReact 将是未来，但你却是不知道从哪下手，那么这篇小教程就是为你准备的。

ps. 有条件的话还是尽量看 [Reason](https://reasonml.github.io/guide/what-and-why) 和 [ReasonReact](https://reasonml.github.io/reason-react/docs/en/what-why.html) 的官方文档吧

pps. Jared 写的 [A ReasonReact Tutorial](https://jaredforsyth.com/2017/07/05/a-reason-react-tutorial/) 是 ReasonReact 最棒的入门指南。本文也是经由他允许，参考了很多其中的内容。能看的懂英语的都直接去他那里吧~

## Reason 是什么？

Reason 是一门基于 [OCaml](http://ocaml.org/) 的语言，它为 Ocaml 带来了新的语法和工具链。它既可以通过 BuckleScript 被同编译为 JavaScript，也支持直接编译为原生的二进制汇编。Reason 提供了和 JavaScript 相似的语法，也可以使用 npm 来安装依赖。长江后浪推前浪，Reason 丢掉了历史包袱，比 JavaScript 多了可靠的**静态类型**，也更快更简洁！

## 为什么要学 Reason ？

> “为啥我要花时间学一门全新的语言呢？是 JavaScript 哪里不好还是你们要求太高？”

错！Reason 不是一门全新的语言，事实上 80% 的语义都可以直接对应到现代的 JavaScript 上，反之也差不多。你只需要丢弃掉一丢丢的 JavaScript 边角语法，再学一点点好东西，就可以获得也许 ES2030 才有的特性。对于大部分人来说，学习 Reason 也不会比学习 JavaScript 和一个其他的类型系统（比如 Flow）来的慢。

不相信的话，先自己去看看 [JS -> Reason 速查表](https://reasonml.github.io/guide/javascript/syntax-cheatsheet/)，然后去 [playground](https://reasonml.github.io/try/) 体验一下吧。

## 从哪开始？

如果你体验了一下，还是提不起兴趣，你可以再出门右转逛逛隔壁家 [elm](http://elm-lang.org/) 和 [ClojureScript](https://clojurescript.org/) 试试。但如果你觉得 ok，却不知道从哪下手，那不妨和我一样，从咱们熟悉的 React 开始。[Jordan](https://github.com/jordwalke) 重新发起了 [ReasonReact](https://reasonml.github.io/reason-react/) 这个新项目，让我们可以换一种更简单优雅的方式写 React。

## ReasonReact

ReasonReact 提供了一些和 React 脚手架类似的工具，比如 [reason-scripts](https://github.com/reasonml-community/reason-scripts)。不过为了理解的深入一点，不妨从零开始搭起我们的第一个 ReasonReact 项目。新建一个项目目录，名字随意，让我们开始吧~ 当然，你也可以直接 clone 已经准备好了的 [simple-reason-react-demo](https://github.com/stonexer/simple-reason-react-demo) 项目来参考。

首先，初始化 `package.json`

```json
{
  "name": "simple-reason-react-demo",
  "version": "0.1.0",
  "scripts": {
    "start": "bsb -make-world -w",
    "build": "webpack -w"
  },
  "dependencies": {
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "reason-react": "^0.3.0"
  },
  "devDependencies": {
    "bs-platform": "^2.1.0",
    "webpack": "^3.10.0"
  }
}
```

然后安装一下依赖：

```shell
npm install --registry=https://registry.npm.taobao.org
```

项目里安装了最新的 React 和 ReactDOM，以及额外的 ReasonReact。而编译工具使用了前端业界标准 Webpack 和 [张宏波](https://www.zhihu.com/people/hongbo_zhang) 开发的 [bs-platform](https://github.com/bucklescript/bucklescript)。你可能暂时还弄不清 BuckleScript 在这里将要扮演怎样的角色，不过没关系，暂时你只要把他理解成 Reason -> JavaScript 的编译器就好了，就像 Babel 把 ES2016 编译成了 ES5 一样。

然后，我们添加一个 BuckleScript 的配置文件 `bsconfig.json`

```json
{
  "name": "simple-reason-react-demo",
  "reason": { "react-jsx": 2 },
  "refmt": 3,
  "bs-dependencies": ["reason-react"],
  "sources": "src"
}
```

可以大概猜出来，项目用到了 reason 的 `react-jsx` 语法，依赖了 `reason-react`，源代码存放在 `src` 目录。时间有限，就先不展开研究了，详细配置可以查看 [bsconfig.json 结构](https://bucklescript.github.io/docs/zh-CN/build-configuration.html)。再创建下 src 目录，我们的项目应该长成这样了

```shell
.
├── bsconfig.json
├── src
├── node_modules
└── package.json
```

# 你好，ReasonReact

是不是很容易的就到这里了，让我们正式开始写 Reason 吧！在 src 里新建 `Main.re` 文件，写下 Hello World

```reason
ReactDOMRe.renderToElementWithId(
  <div>(ReasonReact.stringToElement("Hello ReasonReact"))</div>,
  "root"
);
```

几乎和 React 代码一样不是么？然后我们运行编译命令

```shell
# 相当于之前写好的 'bsb -make-world -w'
npm start
```

一切正常的话，可以看到编译成功的提示，否则就要辛苦你按错误提示排查一下了，注意 bsb 的输出对我们的很重要，一些错误提示和类型检查的信息都要通过它来看。因为我们开启了 `-w` 的 watch 模式，接下来还要用到，就先不用退出了。bsb 将代码编译到了 lib 目录下

```shell
lib
├── bs
└── js
    └── src
        └── Main.js
```

目前我们要关注一下的是 `lib/js/src/Main.js`，打开它我们可以看到编译好的 JavaScript 代码，非常漂亮是吧？这都是 BuckleScript 的功劳。为了让代码能在浏览器里运行，我们还需要用 Webpack 打包一下模块化，这些你都应该非常熟悉了。

创建 `public/index.html`

```html
<!DOCTYPE html>
<meta charset="utf8" />
<title>你好</title>
<body>
  <div id="root"></div>
  <script src="./bundle.js"></script>
</body>
```

以及 `webpack.config.js`

```javascript
const path = require("path")

module.exports = {
  entry: "./lib/js/src/Main.js",
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js",
  },
}
```

Webpacck 配置里入口是 bsb 编译生成的 './lib/js/src/Main.js'。再打开一个终端运行 `npm run build`，我们的准备工作就全部就绪了。我们只利用 webpack 做很简单的打包，所以你基本可以忽略这个终端的输出，还是把精力放在刚刚的 start 命令上。接下来直接在浏览器里打开 index.html 文件，就可以看到 “Hello ReasonReact” 了~

## 第一个组件

![](http://7xr8pm.com1.z0.glb.clouddn.com/Stepper.jpg)

让我们开始第一个组件的开发，一个只能加加减减的步进器。新建一个组件文件：`src/Stepper.re`

```reason
let component = ReasonReact.statelessComponent("Stepper");

let make = (children) => ({
  ...component,
  render: (self) =>
    <div>
      <div>(ReasonReact.stringToElement("I'm a Stepper! "))</div>
    </div>
});
```

`ReasonReact.statelessComponent` 会返回一个默认的组件定义，里面包含了你熟悉的那些生命周期函数以及其他一些方法和属性。这里我们定义了 `make` 方法，目前它只接受一个 `children` 参数，返回了一个组件。我们利用了类似 es6 的 `... 对象展开操作符` 重写了 `component` 中的 `render` 方法。神奇的是这段代码居然完全符合 JavaScript 的语法...接下来，让我们再修改一下 `Main.re`，让他渲染这个 Stepper 组件

```reason
ReactDOMRe.renderToElementWithId(<Stepper />, "root");
```

刷新下浏览器，你应该可以看到刚写好的组件就这么成功的 render 出来了。

你可能很好奇为什么这里没有写 `require()` 或 `import`。这是因为 Reason 的跨文件依赖是自动从你的代码中推导出来的，当编译器看到 `Stepper` 这个在 `Main.re` 中并没有定义的量，它就会自动去找 `Stepper.re` 这个文件并引入该模块。

熟悉 ReactJS 的同学都应该知道，jsx 并不是什么特殊的语法，只是会被编译成普通的函数调用，比如

```jsx
;<div>Hello React</div>
// to
React.createElement("div", null, "Hello React")
```

而在 ReasonReact 中，jsx 会被翻译成

```reason
<Stepper />
/* to */
Stepper.make([||]) /* [|1,2,3|] 是 Reason 中数组的语法 */
```

意思是调用 Stepper 模块的 make 函数，参数是一个空的数组。这就和我们之前写好的 `Stepper.re` 中的 make 函数对应上了，这个空数组就对应于 make 的参数 children。再让我们看眼我们的第一个组件

```reason
let component = ReasonReact.statelessComponent("Stepper");

let make = (children) => ({
  ...component,
  render: (self) =>
    <div>
      <div>(ReasonReact.stringToElement("I'm a Stepper! "))</div>
    </div>
});
```

不同于 ReactJS 中组件的 `render`，这里的 `render` 方法需要一个参数：`self`，暂且你可以把它比作 this，因为我们的 `Stepper` 是一个 stateless 组件，所以我们还用不到它。`render` 方法里返回的同样是虚拟 DOM 节点，不同的是节点必须符合 ReasonReact 要求的节点类型。我们不能再直接写 `<div>Hello</div>`，而得使用 ReasonReact 提供的 `stringToElement` 包装一层。嫌函数名太长？先忍着吧...

### 加上 state

思来想去，我们的步进器还需要一个状态，就是要显示的数字。在 Reason 中，我们需要先定义 `state` 的类型（`type`）

```reason
type state = {
  value: int
};
```

如果你写过 flow 或者 typescript，一定不会觉得奇怪，这标识我们的 state 中包含 `int` 类型的 `value` 字段。然后，我们需要开始把原先的 `statelessComponent` 替换成 `reducerComponent`，原先的组件代码也需要略微改动一下

```reason
type state = {
  value: int
};

let component = ReasonReact.reducerComponent("Stepper");

let make = (children) => ({
  ...component,
  initialState: () => {
    value: 0
  },
  reducer: ((), state) => ReasonReact.NoUpdate,
  render: (self) =>
    <div>
      <div>(ReasonReact.stringToElement(string_of_int(self.state.value)))</div>
    </div>
});
```

聪明的你肯定一下就看懂了 `initialState` 和 ReactJS 的 `getInitialState` 简直一模一样。而在 `render` 这里也很类似，组件当前的状态可以通过 `self.state` 获取，还是为了类型匹配我们套了一层 `string_of_int` 将 `int` 类型的 `value` 转换成 `string`。而新增的 `reducer` 函数可能就有点看不懂了。有意思的地方来啦~

在 ReactJS 中，我们依靠 `setState` 去手动的更新 `state`。ReasonReact 里则引入了 “`reducer`” 的概念，看上去很像 Redux 对吧？也许是 Jordan 自己也不是很喜欢 `setState` 这个非函数式的操作吧 …… ReasonReact 里更新一个组件状态分为两个步骤，首先发起一个 `action`，然后在 `reducer` 中处理它并更新状态。此时此刻，我们还没有添加 `action`，所以 `reducer` 还是无操作的，我们直接返回了一个 `ReasonReact.NoUpdate` 来标识我们并没有触发更新。让我们继续加上 `action`

```reason
type state = {
  value: int
};

/* here */
type action =
  | Increase
  | Decrease;

let component = ReasonReact.reducerComponent("Stepper");

let make = (children) => ({
  ...component,
  initialState: () => {
    value: 0
  },
  reducer: (action, state) => {
    /* here */
    switch action {
    | Decrease => ReasonReact.Update({value: state.value - 1})
    | Increase => ReasonReact.Update({value: state.value + 1})
    };
  },
  render: (self) =>
    <div>
      /* and here */
      <button onClick={self.reduce((evt) => Decrease)}>(ReasonReact.stringToElement("-"))</button>
      <div>(ReasonReact.stringToElement(string_of_int(self.state.value)))</div>
      <button onClick={self.reduce((evt) => Increase)}>(ReasonReact.stringToElement("+"))</button>
    </div>
});
```

首先，我们定义了 `action` 类型，它是一个 Variant（变体）。在 JavaScript 的世界里我们没见过这种值，它用来表示这个变体（或者先叫它 "枚举"？）可能的值。就像在 Redux 中推荐先声明一堆 `actionType` 一样，这个例子里我们定义了 +（`Increase`） 和 -（`Decrease`） 两种 `action`。

然后我们就可以给 `button` 增加点击的回调函数。我们使用了 `self.reduce` 这个函数（还记得 `dispatch` 么），它接收一个函数 `(evt) => Increase` 做转换，可以把它看作将点击的 event（在这里我们忽略掉了它因为用不到它...）换成一个 `action`，而这个 `action` 会被 `self.reduce` 用于做一个副作用操作来更新 `state`，更新 `state` 的操作就在 `reducer` 中。

`reducer` 内采用了**模式匹配**的形式，定义了对于所有可能的 `action` 需要如何更新 `state`。例如，对于 `Increase` 这个类型的 `action`，返回了 `ReasonReact.Update({value: self.state.value + 1})` 去触发更新。值得注意的是，组件的 `state` 是不可变的，而目前 `state` 中只有 `value` 一个字段，所以我们没有 `{...state, value: state.value + 1}` 这样去展开它。

如果你熟悉 Redux 的话，应该非常熟悉这一套范式了（虽然这其实来源于 Elm）。不同的是，我们直接拥有不可变的数据，不再需要过度的使用 JavaScript 的 `String` 来做 `actionType`，reducer 也写的更加优雅简单了，看着真是舒服~

## 继续？

这篇文章到这里也就暂时结束了，距离能做出一般的组件功能我们还差了很多东西。目前我也只是在一些个人的小项目中使用 Reason，文章内容很浅，主要是希望能启发下厉害的你去尝试 Reason 这个还算新鲜的语言，相信它会让你眼前一亮的。

对了，既然都看到这里了，不如再去看看今年两次 React Conf 上 [chenglou](https://github.com/chenglou) 关于 Reason 的精彩演讲吧~

- [Taming the Meta Language - React Conf 2017](https://www.youtube.com/watch?v=_0T5OSSzxms&t=15s)
- [What's in a language? - Cheng Lou](https://www.youtube.com/watch?v=24S5u_4gx7w&t=3s)
