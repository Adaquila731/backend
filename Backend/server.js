const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authroutes');
const listingRoutes = require('./routes/listingroutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

const PORT = process.env.PORT || 5000;

connectDB();


// For routes
app.get('/', (req, res) => {
  res.send(' API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
