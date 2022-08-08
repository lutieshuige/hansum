# [nodeJS](https://nodejs.org/zh-cn/)

## 1.开发环境搭建

> 不建议在arch上用nvm安装，编译慢，推荐n切换node版本

### 安装node环境

```sh
sudo pacman -S nodejs npm
```

### 切换镜像源

```sh
npm config set registry https://registry.npm.taobao.org/
```

### 查看镜像源

```sh
npm config get
```

### 镜像源管理工具

```sh
sudo npm install -g nrm
nrm ls
nrm use taobao
```

### 版本管理工具

```sh
npm install -g n
```

为了避免在n 和 npm 全局中使用 sudo,建议您要么使用 N _ PREFIX 安装到主目录，要么获得系统目录的所有权:

```sh
# make cache folder (if missing) and take ownership
sudo mkdir -p /usr/local/n
sudo chown -R $(whoami) /usr/local/n
# make sure the required folders exist (safe to execute even if they already exist)
sudo mkdir -p /usr/local/bin /usr/local/lib /usr/local/include /usr/local/share
# take ownership of Node.js install destination folders
sudo chown -R $(whoami) /usr/local/bin /usr/local/lib /usr/local/include /usr/local/share
```

安装指定版本：

```sh
n 10.16.0
```

## 2.初始化项目

```sh
npm init -y
```

helloWorld: 

```js
// helloWorld.js
const http = require('http')
http.createServer((req,res)=>{
    // req 请求对象， res 响应对象
    res.write()
    res.end('hello nodejs')
}).listen(3000)
// Terminal中执行 node ./helloWorld.js
```

## 3.数据库

了解术语：

| SQL术语/概念 | MongoDB术语/概念 | 解释/说明                            |
| ------------ | ---------------- | ------------------------------------ |
| database     | database         | 数据库                               |
| table        | collection       | 数据库表/集合                        |
| row          | document         | 数据记录行/文档                      |
| column       | field            | 数据字段/域                          |
| index        | index            | 索引                                 |
| table joins  |                  | 表连接。MongoDB不支持                |
| primary key  | primary key      | 主键，MongoDB自动将_id字段设置为主键 |

### MySQL（关系型）

### MongoDB（非关系型）

安装：

```sh
sudo pacman -S mongodb-bin
mongosh
```

命令行操作：

```sh
> db
test
> use demo
> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
# show dbs 只能查出来有集合的数据库
# 删除数据库 db.dropDatabase()
--------------------------------
# 1. 创建集合
> db.createCollection('users')
{ ok: 1 }
# 2. 获取数据库（带集合的）
> show dbs
admin   40.00 KiB
config  60.00 KiB
demo     8.00 KiB
local   72.00 KiB
# 3. 创建并获取集合
demo> db.createCollection('news')
{ ok: 1 }
demo> db.getCollectionNames()
[ 'news', 'users' ]
# 4. 删除集合
demo> db.news.drop()
true
# 5. 插入文档到集合
demo> db.users.insertOne({username:'hansum',age:18})
{
  acknowledged: true,
  insertedId: ObjectId("62e4d49f6b9951789bfc3da4")
}
# 6. 获取数据文档
demo> db.users.find()
[
  {
    _id: ObjectId("62e4d48f6b9951789bfc3da3"),
    username: 'hansum',
    age: 18
  }
]
# 7. 插入多条集合文档
demo> db.users.insertMany([{username:'jacob',age:19},{username:'holden',age:20}])
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("62e4d5a46b9951789bfc3da5"),
    '1': ObjectId("62e4d5a46b9951789bfc3da6")
  }
}
# 8. 删除集合文档
demo> db.users.removeOne({age:18})
# 9. 更新集合文档
demo> db.users.updateOne({username:'jacob'},{$set:{age:18}})
demo> db.users.updateOne({username:'holden'},{$inc:{age:10}})
# 10. 查找集合文档
demo> db.users.find({age:{$gt:10}}) # 年龄大于10
demo> db.users.find({age:{$gte:10}}) # 年龄大于等于10
demo> db.users.find({age:{$lt:18}}) # 年龄小于18
demo> db.users.find({age:{$lte:18}}) # 年龄小于等于18
demo> db.users.find({username:/jaco/}) # 名字包含jaco
demo> db.users.find({},{username:1}) # 查询只返回username字段
demo> db.users.find({},{_id:0}) # 查询不返回id字段
demo> db.users.find().sort({age:1}) # 查询age字段正序
demo> db.users.find().sort({age:-1}) # 查询age字段倒序
demo> db.users.find().limit(5) # 查询前五条
demo> db.users.find().skip(10) # 查询十条以后
demo> db.users.find().skip(5).limit(10) # 查询5～10条
demo> db.users.find({}，{$or:[{age:18},{age:19}]}) # 或
demo> db.users.findOne({}) # 第一条数据
demo> db.users.findOne({}).count() # 计数


```



## 3.应用框架 express

基本使用：

```js
const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('hello express!')
})

app.listen(3000)
```

express做了以下封装：

1. app实例

   1. 中间件（处理回调）

      - 应用级
      - 路由级

      - 错误（放在最后）

      - 内置

      - 第三方

2.  响应对象 `send`方法

3.  请求对象

   - 获取`get`请求参数：`res.query`
   - 获取`post`请求对象： `res.body`
     1. 假如假如前端传递参数格式为`application/x-www-form-urlencoded`，需要借助内置中间件`express.urlencoded({extended:false})`
     2. 假如前端传递参数格式为`application/json`，需要借助内置中间件`express.json({extended:false})`

4. 托管静态资源（中间件形式）： `app.use(express.static('public'))`

5.  服务器和客户端渲染

   - 前后端分离
   - 后端渲染（配置模板引擎`app.set()`）

6.  生成器 `express-generator`

### express中操作MongoDB

搭建后台环境：

```sh
# 这里利用express生成器自动生成
mkdir mongodb-express-test & cd _
npx express-generator --view=ejs
npm start
```

前端页面：

```html
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
    <h1>mongodb的CRUD演示</h1>
    <div>
      <div>用户名 <input type="text" id="username"> </div>
      <div>密码 <input type="password" id="password"> </div>
      <div>年龄 <input type="number" id="age"> </div>
      <div> <button type="submit" id="register">注册</button> </div>
    </div>
    <script>
      register.onclick = () =>{
        console.log(username.value, password.value, age.value);
        fetch('/api/user/add',{
          method:"POST",
          body:JSON.stringify({
            username:username.value,
            password:password.value,
            age:age.value
          }),
          headers:{
            "Content-Type":"application/json"
          }
        }).then(res=>res.json()).then(res=>{
          console.log(res);
        })
      }
    </script>
  </body>
</html>
```

后端编写接口：

```js
// app.js
app.use('/api', usersRouter);

// usersRouter
var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/user/add',(req,res,next)=>{
  console.log(req.body);
  // 插入数据库
  res.send({
    ok:1
  })
})
module.exports = router;
```

安装`mongoose`模块：

```bash
npm i mongoose
```

配置`mongoose`：`mkdir config/db.config.js`

```js
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/hansum_project')
// 插入集合和数据（文档），数据库hansum_project会自动创建
```

引入数据库模块：`bin/www`

```js
// 引入数据库
require('../config/db.config.js')
```

开始写入数据库：

```js
// userRouter
UserModel.create({
    username,
    password,
    age
})
// 1. 创建一个模型（user）————对应数据库的集合（users）
// model/UserModel.js
const Schema = mongoose.Schema
const userType = {
    username:String,
    password:String,
    age:Number
}
const UserModel = mongoose.model('user',new Schema(userType))

module.exports = UserModel
```

### 接口规范

`RESTful`风格：`get`、`post`、`put`、`delete`

### 业务分层

`MVC`：

```
views		// 展示页面
controllers // 业务逻辑(获取&返回数据)
model(services)		// 处理数据
```

### 登录校验

#### 1. cookie & session

> HTTP本身是无状态的，所以需要借助cookie进行状态存储。
>
> cookie很容易被伪造，结合session是最完美的解决方案。
>
> cookie存在客户端，session存在服务端，开发中经常组合起来使用：cookie存储session的唯一ID值，后端验证session ID,找到cookie

```js
const express = require('express')
const app = express()
const session = require('express-session')

app.use(session({
  name:'hansumsystem',
  secret:'asdhadhaksndjas',
  cookie:{
    maxAge:1000*60*60,
    secure:false
  },
  resave:true,
  saveUninitialized:true
}))

// 在send之前设置session
req.session.user = data[0]


// 设置中间件
app.use((req,res,next)=>{
    // 排除login相关的路由
    if(req.url.includes('login')) {
        next()
        return
    }
    if(req.session.user) {
        next()
    } else {
        res.redirect('/login')
    }
})
```

退出登录：

```js
req.session.destroy()
// 服务器重启 session丢失 bug ： 安装connect-mongo模块

// session 过期时间不更新 bug

```



#### 2. JWT

> cookie容易被劫持，session占内存
>
> localStorage + 加密 = token ：Header + 数据 + 密钥（后端）=> 签名

```js
// utils/JWT.js
const jwt = require('jsonwebtoken')

const secret = 'hansum'

const JWT = {
  generator() {
    return jwt.sign(value, secret, expires)
  },
  verify(token) {
    try {
      return jwt.verify(token, secret)
    } catch (error) {

    }
  }
}

module.exports = JWT
```



## 4.应用框架 koa

express vs Koa

1. 实例构造方式不同，Koa 是通过 `new Koa` 生成 app
2. Koa中间件 参数 ： `ctx`对象集成 `req,res`，即：ctx.req ctx.res，还可以省略 req, res 的写法
3. Koa 不提供路由中间件，单独分离出来
4. 异步流程：express 采用回调，Koa v1采用generator ，v2采用 async/await

### 路由

```js
// user.js
const Router = require('koa-router')
const router = new Router()
router.get('/',(ctx,next)=>{
    ctx.body = ['111','222','333']
})
module.exports = router
// routes/index.js
const Router = require('koa-router')
const router = new Router()
const userRouter = require('./user.js')
// 统一加前缀
router.prefix('/api')
router.use('/user',userRouter.routes(),userRouter.allowedMethods)
module.exports = router
// app.js
const router = require('./routes')
app.use(router.routes(),router.allowedMethods())
```

### 静态资源

```js
const static = require('koa-static')
const path = require('path')
app.use(static(
	path.join(__dirname,'public')
))
```

### 请求对象

```js
// ctx.query ctx.querystring 
// post : ctx.request.body
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())
```

### ejs模板

```js
// koa-views ejs
app.use(views(path.join(__dirname,'views'),{extension:"ejs"}))

// routes/home.js
await ctx.render("home") // 自动找views/home.ejs
```

### 登录校验

#### 1. cookie & session

- ctx.cookies.get(name, [options])
- ctx.cookies.set(name, value, [options])
- koa-session-minimal 中间件

#### 2. JWT

## 5.项目

### 准备工作

1. 前端
   - 前端工程化环境（webpack）
   - CSS 预处理工具（sass）
   - JS库： Jquery
   - 单页面应用（SPA）：路由
   - JS模块化： ES、CommonJS
   - UI 组建库：Bootstrap
2. 后端
   - NodeJS
   - Express / Koa
   - MongoDB

## 6.前端库 [vue](https://cn.vuejs.org/)

> 

