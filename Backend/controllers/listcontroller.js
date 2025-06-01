const Listing = require('../models/listing');

exports.createListing = async (req, res) => {
  try {
    const imageUrls = req.files?.map(file => file.path) || [];

    const listing = await Listing.create({
      ...req.body,
      images: imageUrls,
      user: req.user._id,
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Product', error: err.message });
  }
};

exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('user', 'name location');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Products', error: err.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('user', 'name location');
    if (!listing) return res.status(404).json({ message: 'Product not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching Product', error: err.message });
  }
};

exports.getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.params.userId });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user listings', error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Product not found' });
    if (!listing.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const newImages = req.files?.map(file => file.path) || [];
    if (newImages.length > 0) {
      listing.images = newImages;
    }

    Object.assign(listing, req.body);
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error updating Product', error: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Product not found' });
    if (!listing.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await listing.deleteOne();
    res.json({ message: 'Product deleted Successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting Product', error: err.message });
  }
};

exports.getFeaturedListings = async (req, res) => {
  try {
    const featured = await Listing.find({ featured: true });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured ads', error: err.message });
  }
};