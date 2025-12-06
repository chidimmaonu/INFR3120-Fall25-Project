const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { ensureGuest } = require('../middleware/auth');

/**
 * Authentication Routes
 * Handles user registration, login, logout, and OAuth
 */

// ========== REGISTER ROUTES (Local Auth) ==========

/**
 * GET /auth/register
 * Display registration form
 */
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register — Timely',
    page: 'register'
  });
});

/**
 * POST /auth/register
 * Handle registration form submission
 */
router.post('/register', ensureGuest, async (req, res) => {
  const { username, email, password, password2, fullName } = req.body;
  
  // Password match validation
  if (password !== password2) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/auth/register');
  }
  
  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      req.flash('error', 'Username already taken');
      return res.redirect('/auth/register');
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }
    
    // Create new local user
    const newUser = new User({
      username,
      email,
      password,
      fullName,
      oauthProvider: 'local' // Mark as local auth user
    });
    
    await newUser.save();
    
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
    
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
});

// ========== LOGIN ROUTES (Local Auth) ==========

/**
 * GET /auth/login
 * Display login form
 */
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login — Timely',
    page: 'login'
  });
});

/**
 * POST /auth/login
 * Handle login form submission
 */
router.post('/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/events',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: 'Welcome back!'
  })(req, res, next);
});

// ========== GOOGLE OAUTH ROUTES ==========

/**
 * GET /auth/google
 * Initiates Google OAuth flow
 * User clicks "Login with Google" button → comes here
 */
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] // Request access to profile and email
  })
);

/**
 * GET /auth/google/callback
 * Google redirects here after user authorizes
 * This is the callback URL you registered with Google
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    // Successful authentication
    req.flash('success', 'Welcome! You logged in with Google.');
    res.redirect('/events');
  }
);

// ========== GITHUB OAUTH ROUTES ==========

/**
 * GET /auth/github
 * Initiates GitHub OAuth flow
 * User clicks "Login with GitHub" button → comes here
 */
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'] // Request access to email
  })
);

/**
 * GET /auth/github/callback
 * GitHub redirects here after user authorizes
 * This is the callback URL you registered with GitHub
 */
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    // Successful authentication
    req.flash('success', 'Welcome! You logged in with GitHub.');
    res.redirect('/events');
  }
);

// ========== LOGOUT ROUTE ==========

/**
 * GET /auth/logout
 * Log out current user (works for both local and OAuth users)
 */
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;