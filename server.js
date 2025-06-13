const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authroutes');
const listingRoutes = require('./routes/listingroutes');
const paymentRoutes = require('./routes/paymentroutes'); 

const app = express();
app.use(cors());
app.use('/api/payments/webhook', require('./routes/paymentroutes'));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;

connectDB();


// For routes
app.get('/', (req, res) => {
  res.send(' API is running smoothly welcome to the Asaquila server');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
