const express = require('express');
const router = express.Router();
const axios = require('axios');
const Listing = require('../models/listing'); 

router.post('/initialize', async (req, res) => {
  const { email, amount, callback_url } = req.body;
  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: Date.now(),
        amount,
        currency: "KES",
        redirect_url: callback_url,
        payment_options: "card,mpesa",
        customer: { email }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Payment initialization failed', error: err.message });
  }
});

router.get('/verify', async (req, res) => {
  const { transaction_id, listingId } = req.query;
  try {
    // Verify payment with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );
    if (response.data.status === "success") {
      // Update the listing to featured
      await Listing.findByIdAndUpdate(listingId, { featured: true });
      res.send("Payment successful, ad is now featured!");
    } else {
      res.send("Payment failed or not verified.");
    }
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

module.exports = router;