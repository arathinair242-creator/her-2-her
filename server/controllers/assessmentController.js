const Assessment = require('../models/Assessment');

exports.saveAssessment = async (req, res) => {
  try {
    const { answers, plan, type } = req.body;
    const assessment = new Assessment({
      userId: req.user.id,
      type: type || 'General',
      answers,
      plan
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPlan = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) return res.status(404).json({ message: 'No health plan found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Assessment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
