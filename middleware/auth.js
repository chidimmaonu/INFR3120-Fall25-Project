/**
 * Authentication Middleware
 * These functions check if a user is authenticated before allowing access to protected routes
 */

/**
 * Middleware to ensure user is authenticated
 * Protects routes that require login (Create, Edit, Delete)
 * If user is not logged in, redirect to login page
 */
function ensureAuthenticated(req, res, next) {
  // Check if user is authenticated (Passport sets req.isAuthenticated())
  if (req.isAuthenticated()) {
    // User is logged in, proceed to next middleware/route
    return next();
  }
  
  // User is not logged in, show error message and redirect to login
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
}

/**
 * Middleware to check if user is already logged in
 * Used for login/register pages - if already logged in, redirect to home
 */
function ensureGuest(req, res, next) {
  // Check if user is authenticated
  if (req.isAuthenticated()) {
    // User is already logged in, redirect to events page
    return res.redirect('/events');
  }
  
  // User is not logged in, proceed to login/register page
  next();
}

// Export both middleware functions
module.exports = {
  ensureAuthenticated,
  ensureGuest
};