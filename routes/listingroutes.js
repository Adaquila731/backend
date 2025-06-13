const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getUserListings,
  getFeaturedListings
} = require('../controllers/listcontroller');

const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/featured', getFeaturedListings);
router.get('/', getListings);
router.get('/:id', getListing);
router.get('/user/:userId', getUserListings);

// Protected routes
router.post('/', protect, upload.array('images', 5), createListing);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
