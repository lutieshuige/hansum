var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoStore = require('connect-mongo') 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login')
var session = require('express-session')

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 设置中间件，session
app.use(session({
  name: 'hansumsystem',
  secret: 'asdhadhaksndjas',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false
  },
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/hansum_session',
    ttl: 1000 * 60 * 60
  })
}))

// 设置中间件，session过期校验
app.use((req, res, next) => {
  if (req.url.includes('login')) {
    next()
    return
  }
  if (req.session.user) {
    req.session.date = new Date()
    next()
  } else {
    // 是接口，返回错误码
    // 如果不是，就重定向
    res.redirect('/login')
  }
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/login', loginRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
