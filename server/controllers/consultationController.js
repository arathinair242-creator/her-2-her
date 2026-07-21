const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Expert = require('../models/Expert');

exports.createConsultation = async (req, res) => {
  console.log('--- BOOKING ATTEMPT ---');
  console.log('Body:', JSON.stringify(req.body));
  console.log('User ID from Token:', req.user.id);
  try {
    const { expertId, date, time, type } = req.body;
    const userId = req.user.id;

    if (!expertId) {
      console.error('MISSING expertId in request');
      return res.status(400).json({ message: 'Expert ID is required' });
    }

    const consultation = new Consultation({
      user: userId,
      expert: expertId,
      date,
      time,
      type: type || 'Video',
      status: 'Pending'
    });

    console.log(`Saving consultation... User: ${userId}, Expert: ${expertId}`);
    await consultation.save();
    console.log(`Success! Consultation ID: ${consultation._id}`);
    res.status(201).json(consultation);
  } catch (err) {
    console.error(`!!! BOOKING ERROR: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate('expert', 'name specialization profilePicture')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExpertConsultations = async (req, res) => {
  try {
    console.log('[EXPERT SESSIONS] Fetching consultations for expert ID:', req.user.id);
    const consultations = await Consultation.find({ expert: req.user.id })
      .populate('user', 'name email age profilePicture')
      .sort({ date: 1, time: 1 });
    console.log(`[EXPERT SESSIONS] Found ${consultations.length} consultations for expert: ${req.user.id}`);
    res.json(consultations);
  } catch (err) {
    console.error('[EXPERT SESSIONS] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getAiResponse = async (req, res) => {
  try {
    const { message } = req.body;
    const responses = [
      "That's a great question about wellness! Based on your profile, I recommend staying hydrated and focusing on balanced nutrition.",
      "Ensuring regular sleep patterns (7-8 hours) is vital for hormonal balance. Have you been sleeping well lately?",
      "For cycle-related concerns, consistency with light exercise like yoga can significantly reduce discomfort.",
      "I'm here to help! Remember to consult our verified experts for specific clinical advice.",
      "Eating magnesium-rich foods like dark chocolate, bananas, and nuts can help with muscle relaxation and mood."
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    res.json({ response: responses[randomIndex] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
