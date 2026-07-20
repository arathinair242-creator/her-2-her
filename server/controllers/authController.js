const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Partner = require('../models/Partner');
const config = require('../config');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`Registering user: ${email}`);
    let user = await User.findOne({ email });
    if (user) {
      console.log(`User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();
    console.log(`User registered successfully: ${email}`);

    res.status(201).json({
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(`Registration error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`User logged in successfully: ${email}`);
    res.json({
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(`Login error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.registerExpert = async (req, res) => {
  try {
    const { 
      name, email, password, specialization,
      experience, qualification, aboutMe,
      profilePicture, degreeCertificate, governmentId, medicalRegistration,
      phone, consultationFee, consultationTypes, charges, availability, bankingDetails
    } = req.body;
    console.log(`Registering expert: ${email}`);
    let expert = await Expert.findOne({ email });
    if (expert) {
      console.log(`Expert already exists: ${email}`);
      return res.status(400).json({ message: 'Expert already exists' });
    }

    expert = new Expert({ 
      name, email, password, specialization,
      experience, qualification, aboutMe,
      profilePicture, degreeCertificate, governmentId, medicalRegistration,
      phone, consultationFee, consultationTypes, charges, availability, bankingDetails
    });
    await expert.save();
    console.log(`Expert registered successfully: ${email}`);

    res.status(201).json({
      token: generateToken(expert._id, 'expert'),
      expert: { id: expert._id, name: expert.name, email: expert.email }
    });
  } catch (err) {
    console.error(`Expert registration error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Expert login attempt: ${email}`);
    const expert = await Expert.findOne({ email });
    if (!expert) {
      console.log(`Expert not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await expert.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for expert: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`Expert logged in successfully: ${email}`);
    res.json({
      token: generateToken(expert._id, 'expert'),
      expert: { id: expert._id, name: expert.name, email: expert.email, status: expert.status }
    });
  } catch (err) {
    console.error(`Expert login error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    console.log(`Google Auth attempt: ${email}`);
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-10), // Random placeholder password
        isGoogleAccount: true,
        googleId
      });
      await user.save();
      console.log(`New Google user created: ${email}`);
    } else {
      // Update existing user to be a Google account if they aren't already
      if (!user.isGoogleAccount) {
        user.isGoogleAccount = true;
        user.googleId = googleId;
        await user.save();
        console.log(`Existing user updated to Google: ${email}`);
      }
    }

    console.log(`Google Auth successful: ${email}`);
    res.json({
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(`Google Auth error:`, err);
    res.status(500).json({ message: err.message || 'An error occurred during Google authentication' });
  }
};

exports.registerPartner = async (req, res) => {
  try {
    const { 
      organizationName, organizationType, registrationNumber, 
      contactPerson, mobileNumber, email, password, address, website 
    } = req.body;
    
    let partner = await Partner.findOne({ email });
    if (partner) return res.status(400).json({ message: 'Partner already exists' });

    partner = new Partner({ 
      organizationName, organizationType, registrationNumber, 
      contactPerson, mobileNumber, email, password, address, website 
    });
    await partner.save();

    res.status(201).json({
      token: generateToken(partner._id, 'partner'),
      partner: { id: partner._id, name: partner.organizationName, email: partner.email, type: partner.organizationType }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await partner.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(partner._id, 'partner'),
      partner: { id: partner._id, name: partner.organizationName, email: partner.email, type: partner.organizationType, status: partner.status }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
