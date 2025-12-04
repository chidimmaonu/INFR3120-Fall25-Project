var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Load environment variables
require('dotenv').config();

// Import mongoose
const mongoose = require('mongoose');

// Import session and authentication packages
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport'); // Import passport library
const flash = require('connect-flash');


// ========== CONNECT TO MONGODB ==========
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
  })
  .catch((err) => {
    console.error(' MongoDB Connection Error:', err.message);
    console.log('App will run without database');
  });

// Monitor mongoose connection
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoDB.once('open', () => {
  console.log('Connected to MongoDB database');
});

// IMPORT and CALL PASSPORT CONFIGURATION
require('./passport')(passport);

// ========== IMPORT ROUTES ==========
var indexRouter = require('../routes/index');
var eventsRouter = require('../routes/events');
var authRouter = require('../routes/auth');
var usersRouter = require('../routes/users');

// ========== CREATE EXPRESS APP  =========
var app = express();

// ========== VIEW ENGINE SETUP =========
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// ========== MIDDLEWARE SETUP =========
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ========== STATIC FILES =========
app.use(express.static(path.join(__dirname, '../public')));
app.use('/Asset', express.static(path.join(__dirname, '../public/Asset'))); 
app.use('/Content', express.static(path.join(__dirname, '../public/Content')));
app.use('/Script', express.static(path.join(__dirname, '../public/Script')));

// ========== TRUST PROXY =========
app.set('trust proxy', 1); 


// ========== SESSION CONFIGURATION ==========
/**
 * Express Session
 * Manages user sessions for authentication
 * Sessions are stored in MongoDB for persistence
 */
app.use(session({
  // Secret key for signing session ID cookie (should be in .env in production)
  secret: process.env.SESSION_SECRET || 'timely-secret-key-change-in-production',
  
  // Don't save session if unmodified
  resave: false,
  
  // Don't create session until something is stored
  saveUninitialized: false,
  
  // Store sessions in MongoDB
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // Session expires after 14 days (in seconds)
  }),
  
  // Cookie settings
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    httpOnly: true, // Prevents client-side JS from accessing cookie
    secure: false, 
    sameSite: 'lax' 
  }
}));

// ========== FLASH MESSAGES ==========
// Connect-flash for displaying temporary messages
app.use(flash());

// ========== PASSPORT INITIALIZATION =========
/**
 * Initialize Passport for authentication
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Make user and flash messages available to all templates
 * This allows us to use `user` and `messages` in any EJS file
 */
app.use((req, res, next) => {
  // Current user (null if not logged in)
  res.locals.user = req.user || null;
  
  // Flash messages
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.error = req.flash('error'); // For Passport errors
  
  next();
});


// ========== ROUTE SETUP =========
app.use('/', indexRouter);
app.use('/events', eventsRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

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