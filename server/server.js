import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Parse JSON bodies
app.use(express.json());

// In-memory storage for toggle states (replace with a database in a production app)
const toggleStates = {};

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Get toggle states
app.get('/api/toggles/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(toggleStates[userId] || [false, false, false]);
});

// Update toggle states
app.post('/api/toggles/:userId', (req, res) => {
  const { userId } = req.params;
  const { toggles } = req.body;
  toggleStates[userId] = toggles;
  res.json({ success: true });
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