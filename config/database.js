// Load environment variables
require('dotenv').config();

// Export the MongoDB URI so app.js can read it
module.exports = {
  URI: process.env.MONGODB_URI
};
