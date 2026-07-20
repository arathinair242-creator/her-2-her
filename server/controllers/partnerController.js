const Partner = require('../models/Partner');

exports.getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select('-password');
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePartnerProfile = async (req, res) => {
  try {
    const allowed = ['organizationName', 'description', 'website', 'address', 'mobileNumber', 'contactPerson'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const partner = await Partner.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addEvent = async (req, res) => {
  try {
    const { title, date, description, location } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'Title and date are required' });
    const partner = await Partner.findById(req.user.id);
    partner.events.push({ title, date: new Date(date), description, location });
    await partner.save();
    res.json(partner.events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);
    partner.events = partner.events.filter(e => e._id.toString() !== req.params.eventId);
    await partner.save();
    res.json({ message: 'Event deleted', events: partner.events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReferral = async (req, res) => {
  try {
    const { userName, goal } = req.body;
    if (!userName) return res.status(400).json({ message: 'userName is required' });
    const partner = await Partner.findById(req.user.id);
    partner.referrals.push({ userName, goal: goal || '', date: new Date(), status: 'Interested' });
    await partner.save();
    res.json(partner.referrals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);
    partner.referrals = partner.referrals.filter(r => r._id.toString() !== req.params.referralId);
    await partner.save();
    res.json({ message: 'Referral deleted', referrals: partner.referrals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select('-password');
    const now = new Date();

    const totalReferrals = partner.referrals.length;
    const activeEvents = partner.events.filter(e => new Date(e.date) >= now).length;
    const impactReach = totalReferrals > 0 ? totalReferrals * 18 : 0; // each referral reaches ~18 people on avg
    const engagementRate = totalReferrals > 0 ? Math.min(((totalReferrals / (totalReferrals + 10)) * 100).toFixed(1), 100) : 0;

    // Monthly referral breakdown (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = partner.referrals.filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, referrals: count });
    }

    res.json({
      totalReferrals,
      activeEvents,
      impactReach: impactReach >= 1000 ? `${(impactReach / 1000).toFixed(1)}k` : String(impactReach),
      engagementRate: `${engagementRate}%`,
      monthlyReferrals: months,
      totalEvents: partner.events.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
