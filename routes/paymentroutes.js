const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Listing = require('../models/listing');

router.post('/create-checkout-session', async (req, res) => {
  const { amount, listingId, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'kes', // or 'usd', 'ngn', etc.
          product_data: {
            name: 'Feature Listing',
          },
          unit_amount: amount * 100, // Stripe expects amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://adaquila.com/payment-success?listingId={listingId}&tx_ref={transaction_reference}&status=success`,
      cancel_url: `https://adaquila.com/payment-failure?listingId={listingId}&status=failed&message={error_message}`,
      customer_email: email,
      metadata: { listingId }
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Stripe session creation failed', error: err.message });
  }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const listingId = session.metadata.listingId;
    // Mark the listing as featured
    await Listing.findByIdAndUpdate(listingId, { featured: true });
  }
  res.json({received: true});
});

module.exports = router;