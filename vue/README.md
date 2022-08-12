## 基础

### 拦截原理

```js
var obj = {}
Object.defineProperty(obj, 'myname', {
    get() {},
    set(val) {}
})
```

`Vue`底层原理：

watcher负责收集Data中的属性进行拦截，触发重绘重排，通过虚拟DOM对比，再更新属性并渲染页面。

### 模板语法

插值、指令（缩写）、表达式

> todo-list、点击变色

### 样式绑定

- 对象写法
- 数组写法
- 行内样式

### 条件渲染

> v-if=""	v-else	v-for="data in datalist"

```
所有订单
	- 1111 ---- 未付款
	- 2222 ---- 待发货
	- 3333 ---- 已发货
	- 4444 ---- 已完成
template
```

### 列表渲染

### 事件处理器

加括号与不加的区别：

- 不加括号，可以得到事件对象。
- 加括号，可以传参，也可以传事件对象`$event`

### 事件修饰符

### 按键修饰符

### 表单控件绑定

`v-model`，`value`

----------------------------

### 案例：购物车

### 组件定义

定义组件：

```js
// 全局组件
Vue.component('componentA',{
    template:``
})
// 局部组件
const componentB = {
    template:``
}
const componentC = {
    template:``
}
components:[componentB,componentC]
```

### 组件通信

父传子：属性 prop

子传父：$emit、$bus、ref

### 组件注意

不建议直接更新`prop`属性

### 动态组件

内置的 component组件，通过is属性动态切换。要是需要组件间切换保持状态，需要包一层keep-alive。

### 插槽

旧版写法：slot

新版写法：`<template v-slot:myslot></template>`

### 过渡动画

过渡：

```html
<transition name='hansum'>
	<div>
        显示/隐藏
    </div>
</transition>
```

```css
.hansum-enter-active{
    animation: start .5s;
}
.hansum-leave-active{
    animation: start .5s reverse;
}
@keyframe start {
    0% {
        opacity: 0;
        transform: translateX(100px)
    }
    100% {
        opacity: 1;
        transform: translateX(0)
    }
}
```



初始元素过渡：

```html
<transition name='hansum' appear>
	<div>
        显示/隐藏
    </div>
</transition>
```



多个元素过渡：

```html
<transition name='hansum'>
	<div v-if='isShow' key='1'>显示/隐藏</div>
	<div v-else key='2'>显示/隐藏-111</div>
</transition>
```



多个组件过渡：

多个列表过渡：

可复用过渡：





