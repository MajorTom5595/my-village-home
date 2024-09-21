import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Parse JSON bodies
app.use(express.json());

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Get toggle states
app.get('/api/toggles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await User.findOne({ loginId: userId });
    
    if (!user) {
      user = new User({ loginId: userId });
      await user.save();
    }
    
    res.json(user.toggles);
  } catch (error) {
    console.error('Error fetching toggles:', error);
    res.status(500).json({ error: 'Internal server error' });
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