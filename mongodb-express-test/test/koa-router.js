const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.post('/list', (ctx, next) => {
  ctx.body = {
    ok: 1,
    info: 'post list success'
  }
})
  .get('/list', (ctx, next) => {
    ctx.body = ['111', '222', '333']
  })
  .put('/list/:id', (ctx, next) => {
    console.log(ctx.params)
    ctx.body = {
      ok: 1,
      info: 'put list success'
    }
  })
  .del('/list/:id', (ctx, next) => {
    ctx.body = {
      ok: 1,
      info: 'del list success'
    }
  })

app.use(router.routes())

app.listen(3000)