// Koa VS express

const express = require('express')

// const app = express()

// app.use(async (req,res,next) => {
//   if(req.url === '/favicon.ico') return
//   console.log('11111');
//   await next() // 还是不会等待异步执行完就会去执行同步代码,需要将下面的同步代码放在异步代码之后，这才是express中间件的设计理念
//   console.log('44444',res.token);
//   res.send('hello express')
// })
// app.use(async (req,res,next) => {
//   console.log('22222');
//   await delay(1000)
//   res.token = 'asdkhaskdhak
//   console.log('33333');
// })
// function delay(time) {
//   return new Promise((resolve,reject) => {
//     setTimeout(resolve, time);
//   })
// }

// app.listen(3000)

// -----------------------------------------------

const Koa = require('koa')

const app = new Koa()

app.use(async (ctx, next) => {
  if (ctx.url === '/favicon.ico') return
  console.log('11111');
  const token = await next() // Koa封装的中间件就会等待异步完成后再执行同步代码
  console.log('44444', ctx.token, token);
  ctx.body = 'hello koa'
})
app.use(async (ctx, next) => {
  console.log('22222');

  // 异步
  await delay(1000)
  ctx.token = 'adhasihakhks'
  console.log('33333');
  return 'adhasihakhks'
})

function delay(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}

app.listen(3000)