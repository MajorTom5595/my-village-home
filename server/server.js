const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Parse JSON bodies
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.error('MongoDB URI:', process.env.MONGODB_URI);
});

// Import the User model
const User = require('./models/User');

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Get toggle states
app.get('/api/toggles/:userId', async (req, res) => {
  // ... (as before)
});

// Update toggle states
app.post('/api/toggles/:userId', async (req, res) => {
  // ... (as before)
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});