var createError = require('http-errors');
var express = require('express');
const http = require('http');
var path = require('path');
var logger = require('morgan');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
const server = http.createServer(app)

var indexRouter = require('./routes/index');
var usersRouter = require('./models/users');
//var serverjs = require('./server');

let mongoPass= "adwaith.6574"
let dbName = "socialApp"
const uri = `mongodb+srv://sreeadwa:${mongoPass}@cluster0.dubqcyd.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(uri).then(()=>{
   console.log("connected to mongodb");
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
   resave: false, 
   saveUninitialized: false ,
   secret: "hdhdhfhfhydhd"
}))

app.use(flash())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/models/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
