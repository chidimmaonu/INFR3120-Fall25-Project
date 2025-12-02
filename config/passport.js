const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user'); // Use the correct filename!

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'username' }, // match your login form
      async (username, password, done) => {
        try {
          // Normalize username for case-insensitive matching (recommended)
          const normalizedUsername = username.trim().toLowerCase();
          const user = await User.findOne({ username: normalizedUsername });
          if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
<<<<<<< HEAD
=======

>>>>>>> 1a9d29539b7e90d23464c93141bd37606fa63300
