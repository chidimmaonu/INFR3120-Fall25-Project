const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

/**
 * Passport Configuration
 * Configures authentication strategies: Local, Google, GitHub
 * @param {object} passport - Passport instance
 */


module.exports = function(passport) {
  
  // ========== LOCAL STRATEGY (Username/Password) ==========
  passport.use(
    new LocalStrategy(
      { usernameField: 'username' },
      async (username, password, done) => {
        try {
          // Find user by username (only local auth users)
          const user = await User.findOne({ 
            username: username,
            oauthProvider: 'local' // Only match local users
          });
          
          if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          const isMatch = await user.comparePassword(password);
          
          if (!isMatch) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          return done(null, user);
          
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // ========== GOOGLE OAUTH STRATEGY ==========
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ 
            oauthProvider: 'google',
            oauthId: profile.id 
          });
          
          if (user) {
            // User exists, log them in
            return done(null, user);
          }
          
          // Check if email already exists (user might have local account)
          const emailExists = await User.findOne({ 
            email: profile.emails[0].value 
          });
          
          if (emailExists) {
            // Email exists with local account - link them
            emailExists.oauthProvider = 'google';
            emailExists.oauthId = profile.id;
            emailExists.profilePicture = profile.photos[0]?.value || null;
            await emailExists.save();
            return done(null, emailExists);
          }
          
          // Create new user
          user = new User({
            oauthProvider: 'google',
            oauthId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            username: profile.emails[0].value.split('@')[0], // Use email prefix as username
            profilePicture: profile.photos[0]?.value || null
          });
          
          await user.save();
          done(null, user);
          
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  
  // ========== GITHUB OAUTH STRATEGY ==========
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ 
            oauthProvider: 'github',
            oauthId: profile.id 
          });
          
          if (user) {
            return done(null, user);
          }
          
          // Get email from profile (might be null if user's email is private)
          const email = profile.emails && profile.emails[0] 
            ? profile.emails[0].value 
            : `${profile.username}@github.com`; // Fallback email
          
          // Check if email exists
          const emailExists = await User.findOne({ email: email });
          
          if (emailExists) {
            // Link to existing account
            emailExists.oauthProvider = 'github';
            emailExists.oauthId = profile.id;
            emailExists.profilePicture = profile.photos[0]?.value || null;
            await emailExists.save();
            return done(null, emailExists);
          }
          
          // Create new user
          user = new User({
            oauthProvider: 'github',
            oauthId: profile.id,
            email: email,
            fullName: profile.displayName || profile.username,
            username: profile.username,
            profilePicture: profile.photos[0]?.value || null
          });
          
          await user.save();
          done(null, user);
          
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  

  // ========== SERIALIZE USER ==========
  // Store user ID in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  
  // ========== DESERIALIZE USER ==========
  // Retrieve full user object from database using ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};