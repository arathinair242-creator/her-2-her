const Review = require('../models/Review');

// Public: Submit a new review
exports.submitReview = async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!name || !rating || !message) {
      return res.status(400).json({ message: 'Name, rating, and message are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const review = await Review.create({ name, email, rating, message });
    res.status(201).json({ message: 'Thank you for your feedback!', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error while submitting review.' });
  }
};

// Public: Get approved reviews to display on homepage (latest 20)
exports.getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name rating message createdAt');
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
};

// Admin: Get all reviews with full details
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({ reviews, totalReviews, avgRating });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
};
