// backend/server.js
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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// MongoDB connection
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/carTrackerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true, unique: true, index: true },
  password:{ type: String, required: true },
  fuelPrice: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Helpers
const sanitizeUser = (u) => ({ name: u.name, email: u.email, fuelPrice: u.fuelPrice ?? 0 });

// Routes

// Registration
app.post('/register', async (req, res) => {
  console.log('Received /register:', req.body);
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Please fill in all fields' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: `Welcome ${name}! Account created successfully.`, ...sanitizeUser(newUser) });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  console.log('Received /login:', req.body);
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Please fill in all fields' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.status(200).json({ message: 'Logged in successfully', userName: user.name, email: user.email, fuelPrice: user.fuelPrice ?? 0 });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch basic profile
app.get('/user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('GET /user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change email (requires current password)
app.post('/user/change-email', async (req, res) => {
  console.log('Received /user/change-email:', req.body);
  const { currentEmail, password, newEmail } = req.body;
  if (!currentEmail || !password || !newEmail) {
    return res.status(400).json({ message: 'currentEmail, password and newEmail are required' });
  }

  try {
    const user = await User.findOne({ email: currentEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Incorrect password' });

    if (currentEmail === newEmail) return res.status(400).json({ message: 'New email is the same as current' });

    const exists = await User.findOne({ email: newEmail });
    if (exists) return res.status(400).json({ message: 'New email already in use' });

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated', email: user.email });
  } catch (err) {
    console.error('change-email error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already in use' });
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
app.post('/user/change-password', async (req, res) => {
  console.log('Received /user/change-password:', req.body);
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'email, currentPassword and newPassword are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set fuel price
app.post('/user/fuel-price', async (req, res) => {
  console.log('Received /user/fuel-price:', req.body);
  const { email, fuelPrice } = req.body;
  if (!email || typeof fuelPrice !== 'number') {
    return res.status(400).json({ message: 'email and numeric fuelPrice are required' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { fuelPrice } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Fuel price saved', fuelPrice: user.fuelPrice });
  } catch (err) {
    console.error('fuel-price error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// JSON 404 + 500 handlers
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
