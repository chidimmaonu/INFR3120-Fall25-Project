const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../middleware/auth');

/**
 * GET /users/change-password
 * Display password change form
 * PROTECTED: Only logged-in users can access
 */
router.get('/change-password', ensureAuthenticated, (req, res) => {
  // Only allow local auth users to change password
  if (req.user.oauthProvider !== 'local') {
    req.flash('error', 'Password change is only available for local accounts. You signed in with ' + req.user.oauthProvider);
    return res.redirect('/events');
  }

  res.render('auth/change-password', {
    title: 'Change Password — Timely',
    page: 'change-password'
  });
});

/**
 * POST /users/change-password
 * Handle password change form submission
 * PROTECTED: Only logged-in users can change password
 */
router.post('/change-password', ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validation: Check if user is local auth
  if (req.user.oauthProvider !== 'local') {
    req.flash('error', 'Password change is only available for local accounts');
    return res.redirect('/events');
  }

  try {
    // Find user in database
    const user = await User.findById(req.user._id);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');
    }

    // Validation: Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/users/change-password');
    }

    // Validation: Check if new passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/users/change-password');
    }

    // Validation: Check password length
    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters long');
      return res.redirect('/users/change-password');
    }

    // Validation: Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      req.flash('error', 'New password must be different from current password');
      return res.redirect('/users/change-password');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully!');
    res.redirect('/events');

  } catch (error) {
    console.error('Password change error:', error);
    req.flash('error', 'Failed to change password. Please try again.');
    res.redirect('/users/change-password');
  }
});

module.exports = router;