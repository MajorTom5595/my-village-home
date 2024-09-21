const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React app
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
  try {
    console.log('Fetching toggles for user:', req.params.userId);
    const { userId } = req.params;
    let user = await User.findOne({ loginId: userId });
    
    if (!user) {
      console.log('User not found, creating new user');
      user = new User({ loginId: userId });
      await user.save();
    }
    
    console.log('Sending toggles:', user.toggles);
    res.json(user.toggles);
  } catch (error) {
    console.error('Error fetching toggles:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update toggle states
app.post('/api/toggles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { toggles } = req.body;
    
    let user = await User.findOne({ loginId: userId });
    
    if (!user) {
      user = new User({ loginId: userId, toggles });
    } else {
      user.toggles = toggles;
    }
    
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating toggles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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