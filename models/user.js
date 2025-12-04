const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Authentication
 * Supports both local (username/password) and OAuth (Google, GitHub, Twitter) login
 */
const userSchema = new mongoose.Schema({
  // ========== LOCAL AUTH FIELDS ==========

  // Username - must be unique
  username: {
    type: String,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  
  // Email - must be unique and valid format
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  
  // Password - will be hashed before saving
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Optional: Full name
  fullName: {
    type: String,
    trim: true
  },
  
  // ========== OAUTH FIELDS ==========

  // OAuth provider info
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'github', 'twitter'],
    default: 'local'
  },
  
  // OAuth provider user ID (e.g., Google ID, GitHub ID)
  oauthId: {
    type: String,
    sparse: true // Allows null values, but enforces uniqueness when present
  },
  
  // Profile picture URL from OAuth provider
  profilePicture: {
    type: String,
    default: null
  }
}, {
  collection: 'users',
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// ========== INDEXES FOR PERFORMANCE ==========
// Compound index for OAuth users
userSchema.index({ oauthProvider: 1, oauthId: 1 }, { unique: true, sparse: true });

/**
 * Pre-save middleware to hash password before saving to database
 * Only runs for LOCAL authentication (not OAuth)
 */
userSchema.pre('save', async function() {
  // Skip password hashing for OAuth users (they don't have passwords)
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method to compare entered password with hashed password in database
 * Used during login for LOCAL authentication
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  // OAuth users don't have passwords
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);