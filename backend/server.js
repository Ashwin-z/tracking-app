const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// MongoDB connection
mongoose.set('strictQuery', true); // Suppress strictQuery warning
mongoose.connect('mongodb://localhost:27017/carTrackerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Registration route
app.post('/register', async (req, res) => {
  console.log('Received /register request:', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log('Validation failed: Missing fields');
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Validation failed: Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully for:', email);

    // Create and save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    console.log('User saved to MongoDB:', { name, email });

    res.status(201).json({ message: `Welcome ${name}! Account created successfully.` });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  console.log('Received /login request:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Validation failed: Missing fields');
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Validation failed: User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Validation failed: Incorrect password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for:', email);
    res.status(200).json({ message: 'Logged in successfully', userName: user.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Received /health request');
  res.status(200).json({ status: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});