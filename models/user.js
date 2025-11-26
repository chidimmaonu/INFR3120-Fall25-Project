const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Authentication
 * Stores user credentials and profile information
 */
const userSchema = new mongoose.Schema({
  // Username - must be unique
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  
  // Email - must be unique and valid format
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  
  // Password - will be hashed before saving
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Optional: Full name
  fullName: {
    type: String,
    trim: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

/**
 * Pre-save middleware to hash password before saving to database
 * This runs automatically before user.save()
 * NOTE: No 'next' argument is needed for async middleware; errors are thrown and handled by Mongoose.
 */
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  // Generate salt (random data for hashing)
  const salt = await bcrypt.genSalt(10);
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method to compare entered password with hashed password in database
 * Used during login to verify credentials
 * @param {string} enteredPassword - The password user entered
 * @returns {boolean} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
