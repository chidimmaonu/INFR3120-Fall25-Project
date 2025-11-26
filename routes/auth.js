const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { ensureGuest } = require('../middleware/auth');

/**
 * Authentication Routes
 * Handles user registration, login, and logout
 */

// REGISTER ROUTES 

/**
 * GET /auth/register
 * Display registration form
 * Only accessible if user is NOT logged in (ensureGuest middleware)
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
 * Creates new user account
 */
router.post('/register', ensureGuest, async (req, res) => {
  // Extract form data
  const { username, email, password, password2, fullName } = req.body;
  
  // Validation: Check if passwords match
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
    
    // Create new user object
    const newUser = new User({
      username,
      email,
      password, // Will be hashed automatically by User model pre-save hook
      fullName
    });
    
    // Save user to database
    await newUser.save();
    
    // Success message and redirect to login
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
    
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
});

// LOGIN ROUTES 
/**
 * GET /auth/login
 * Display login form
 * Only accessible if user is NOT logged in
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
 * Uses Passport.js local strategy for authentication
 */
router.post('/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    // Success: redirect to events page
    successRedirect: '/events',
    
    // Failure: redirect back to login with error message
    failureRedirect: '/auth/login',
    
    // Enable flash messages for errors
    failureFlash: true,
    
    // Success flash message
    successFlash: 'Welcome back!'
  })(req, res, next);
});

// LOGOUT ROUTE 

/**
 * GET /auth/logout
 * Log out current user
 * Destroys session and redirects to home
 */
router.get('/logout', (req, res, next) => {
  // Passport provides req.logout() method
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    
    // Success message
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;