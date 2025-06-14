const Listing = require('../models/listing');

exports.createListing = async (req, res) => {
  try {
    const imageUrls = req.files?.map(file => file.path) || [];
    const { price, priceRange, currency } = req.body;

    
    if (!price && !priceRange) {
      return res.status(400).json({ message: 'Provide either price or priceRange' });
    }

    if (!currency) {
      return res.status(400).json({ message: 'Currency is required' });
    }

    const listing = await Listing.create({
      ...req.body,
      price,
      priceRange,
      currency,
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
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'firstName lastName phoneNumber username createdAt rating');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    
    let listingsCount = 1;
    let user = null;
    if (listing.user) {
      listingsCount = await Listing.countDocuments({ user: listing.user._id });
      user = listing.user.toObject();
      user.listingsCount = listingsCount;
    }

    res.json({ ...listing.toObject(), user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing', error: err.message });
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

    const { price, priceRange, currency } = req.body;
    const newImages = req.files?.map(file => file.path) || [];
    if (newImages.length > 0) {
      listing.images = newImages;
    }

    // Ensure at least one price field is provided if updating price
    if (price === undefined && priceRange === undefined && currency === undefined && newImages.length === 0 && Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }
    if (!listing.price && !listing.priceRange && !price && !priceRange) {
      return res.status(400).json({ message: 'Provide either price or priceRange' });
    }
    if (currency !== undefined && !currency) {
      return res.status(400).json({ message: 'Currency is required' });
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

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};