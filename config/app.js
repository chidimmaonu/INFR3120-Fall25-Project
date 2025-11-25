var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Load environment variables
require('dotenv').config();

// Import mongoose
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
  })
  .catch((err) => {
    console.error(' MongoDB Connection Error:', err.message);
    console.log('App will run without database');
  });

// Import routes
var indexRouter = require('../routes/index');
var eventsRouter = require('../routes/events');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Serve Asset folder
app.use('/Asset', express.static(path.join(__dirname, '../public/Asset')));

// Serve Content folder  
app.use('/Content', express.static(path.join(__dirname, '../public/Content')));

// Serve Script folder
app.use('/Script', express.static(path.join(__dirname, '../public/Script')));

// Routes
app.use('/', indexRouter);
app.use('/events', eventsRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;