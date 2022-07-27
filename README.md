## node

- 认识`nodeJS`
- 开发环境搭建
- 模块规范
- `npm`使用
- `nvm`使用
- `yarn`使用
- `ES`模块化写法
- 内置模块`http`
- 内置模块`url`
- 内置模块`fs`
- 内置模块`zlib`
- 路由
- `express`

### 认识`nodeJS`

`nodeJS`是一个基于chrome V8 引擎的 JavaScript 运行环境。

它的优点：

1. 异步非阻塞I/O
2. 特别适用于I/O密集型应用
3. 事件循环机制
4. 单线程
5. 跨平台

它的缺点：

1. 回调地狱
2. 单线程，处理不好CPU密集型任务

应用场景：

1. Web服务API，比如RESTful API
2. 服务器渲染页面
3. 后端的Web服务，比如跨域、服务器端的请求

### 开发环境搭建

安装`node`

### 模块化规范

`nodeJS`起初遵循`common JS`规范，后面也支持`ES`规范

`common JS`格式：

1. 请求`require`
2. 暴露`module.exports`，也等同于`exports`

### `npm`使用

1. 初始化项目：`npm init -y`

2. 安装包：`npm i xxx` (`npm install xxx --save`的简写形式)

### nvm使用

`node`的版本管理工具

1. 安装最新版：`nvm use --lts`

### ES模块化写法

`package.json`中添加`"type":"module"`

### 内置模块-http

#### 创建服务器

```js
const http = requrie('http')
http.createServer((req,res)=>{
    // 此处可以写入text、html、json等格式，需要通过res.writeHead(200,{})指定`content-type`类型
    res.write()
    res.end()
}).listen(3000)

```

#### jsonp

原理：通过后端拿到前端传递过来的`cb`参数，以`cb(data)`的形式返回给客户端去执行。

#### cors

原理：通过给`ACAO`设置为`*`，来放开浏览器跨域的限制。

### express

基本使用：

```js
const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('hello express!')
})

app.listen(3000)
```

`express`做了以下封装：

1. `app`实例
   1. 基本路由
   2. 中间件
2. 响应对象`send`方法



