const Expert = require('../models/Expert');

exports.getExperts = async (req, res) => {
  try {
    const filter = req.query.status === 'all' ? {} : { status: 'Verified' };
    const experts = await Expert.find(filter).select('-password');
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).select('-password');
    if (!expert) return res.status(404).json({ message: 'Expert not found' });
    res.json(expert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addExpert = async (req, res) => {
  try {
    const newExpert = new Expert(req.body);
    await newExpert.save();
    res.status(201).json(newExpert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExpert = async (req, res) => {
  try {
    const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExpert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpert = async (req, res) => {
  try {
    await Expert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expert deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

