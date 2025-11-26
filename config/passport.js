const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

/**
 * Passport Configuration
 * Sets up local authentication strategy using username and password
 * @param {object} passport - Passport instance
 */
module.exports = function(passport) {
  
  /**
   * Local Strategy - Username and Password Authentication
   * This tells Passport how to authenticate users
   */
  passport.use(
    new LocalStrategy(
      // Configuration options
      { usernameField: 'username' }, // Field name in the login form
      
      // Verification function
      async (username, password, done) => {
        try {
          // Find user by username in database
          const user = await User.findOne({ username: username });
          
          // If user not found
          if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          // User found, now check if password matches
          const isMatch = await user.comparePassword(password);
          
          if (!isMatch) {
            // Password doesn't match
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          // Username and password are correct
          return done(null, user);
          
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  /**
   * Serialize User
   * Determines what data from the user object should be stored in the session
   * Only the user ID is saved to keep session lightweight
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  /**
   * Deserialize User
   * Retrieves the full user object from the database using the ID stored in session
   * This runs on every request to authenticated routes
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};