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
    res.status(500).json({ message: 'Failed to create listing', error: err.message });
  }
};

exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('user', 'name location');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('user', 'name location');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing', error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
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
    res.status(500).json({ message: 'Error updating listing', error: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await listing.remove();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting listing', error: err.message });
  }
};
