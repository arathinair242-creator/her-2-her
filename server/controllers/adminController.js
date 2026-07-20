const User = require('../models/User');
const Expert = require('../models/Expert');
const Partner = require('../models/Partner');
const Order = require('../models/Order');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Hardcoded simple admin validation
    if ((email === 'admin@her2her.com' || email === 'arathinair242@gmail.com') && (password === 'Arathi123' || password === 'admin123')) {
      return res.status(200).json({ 
        token: 'admin_secure_token_abc123',
        role: 'admin',
        name: 'Super Admin'
      });
    }
    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalPartners,
      totalAppointments,
      activeConsultations
    ] = await Promise.all([
      User.countDocuments({}),
      Expert.countDocuments({}),
      Expert.countDocuments({ status: { $regex: /pending/i } }),
      Expert.countDocuments({ status: { $regex: /approved/i } }),
      Partner.countDocuments({}),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $in: ['Pending', 'Confirmed'] } })
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaysAppointments = await Order.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const monthlyAppointments = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      totalUsers,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalPartners,
      totalAppointments,
      todaysAppointments,
      monthlyAppointments,
      activeConsultations
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedUserReg = userRegistrations.map(r => ({
      name: months[r._id - 1] || "Unknown",
      Users: r.count
    }));

    const doctorCategories = await Expert.aggregate([
      {
        $group: {
          _id: "$specialty",
          value: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      userRegistrations: formattedUserReg.length ? formattedUserReg : [{ name: 'Current', Users: await User.countDocuments() }],
      consultationCategories: doctorCategories.length ? doctorCategories.map(d => ({ name: d._id || 'General', value: d.value })) : [{ name: 'Gynecology', value: 3 }, { name: 'Nutrition', value: 2 }]
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Expert.find({}).sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Approved', 'Rejected', 'Pending', 'pending', 'approved', 'rejected'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }

    const doctor = await Expert.findByIdAndUpdate(id, { status }, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    res.status(200).json({ message: "Doctor successfully " + status, doctor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor status' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const usersWithAppointments = await Promise.all(users.map(async u => {
        const appointmentCount = await Order.countDocuments({ user: u._id });
        return {
            ...u.toObject(),
            appointmentCount
        }
    }));
    res.status(200).json(usersWithAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Order.find({}).populate('user', 'name email').populate('expert', 'name specialty').sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching partners' });
  }
};

exports.updatePartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Verified, Rejected, or Pending.' });
    }
    const partner = await Partner.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.status(200).json({ message: `Partner ${status} successfully`, partner });
  } catch (error) {
    res.status(500).json({ message: 'Error updating partner status' });
  }
};

