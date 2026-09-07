const User = require('../models/User');
const Order = require('../models/Order');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, bio, profilePicture } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isGoogleAccount) {
      return res.status(400).json({ message: 'Google accounts cannot change passwords here' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = newPassword; // Hashing handled in pre-save middleware
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  const { notifications, privacy } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.settings) {
      if (notifications !== undefined) user.settings.notifications = notifications;
      if (privacy) user.settings.privacy = privacy;
    } else {
      user.settings = { notifications, privacy };
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const activateFreeTrial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.membershipStatus !== 'Free') {
      return res.status(400).json({ message: 'Trial or Premium already active' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    user.membershipStatus = 'Trial';
    user.trialStartDate = startDate;
    user.trialEndDate = endDate;

    await user.save();
    res.json({ 
      message: '7-Day Free Trial activated successfully!', 
      membershipStatus: user.membershipStatus,
      trialEndDate: user.trialEndDate 
    });
  } catch (err) {
    console.error('Trial Activation Error:', err);
    res.status(500).json({ message: 'Server error while activating trial' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('expertId', 'name specialty')
      .populate('partnerId', 'name businessName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, updateSettings, activateFreeTrial, getMyOrders };
