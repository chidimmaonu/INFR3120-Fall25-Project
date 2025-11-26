const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const { ensureGuest } = require('../middleware/auth');
const router = express.Router();

/**
 * Registration Routes
 */

// Render registration form
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register — Timely',
    page: 'register'
  });
});

// Handle registration form submission
router.post('/register', ensureGuest, async (req, res) => {
  const { username, email, password, password2, fullName } = req.body;

  // Password match check
  if (password !== password2) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/auth/register');
  }

  // Normalize username for consistent lookup
  const normalizedUsername = username.trim().toLowerCase();

  try {
    // Check for existing username/email
    if (await User.findOne({ username: normalizedUsername })) {
      req.flash('error', 'Username already taken');
      return res.redirect('/auth/register');
    }
    if (await User.findOne({ email })) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }

    // Create and save new user
    const newUser = new User({
      username: normalizedUsername,
      email,
      password, // Will be hashed by User model
      fullName
    });
    await newUser.save(); // <-- FIXED: parentheses to run .save()

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
});

/**
 * Login Routes
 */

// Render login form
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login — Timely',
    page: 'login'
  });
});

// Handle login form submission
router.post('/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/events',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: 'Welcome back!'
  })(req, res, next);
});

/**
 * Logout Route
 */

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;
