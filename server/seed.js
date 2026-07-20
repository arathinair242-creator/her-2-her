const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const User = require('./models/User');
const Expert = require('./models/Expert');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Expert.deleteMany({});
    
    const experts = [
      {
        name: 'Dr. Arathi Nair',
        email: 'dr.arathi@her2her.com',
        password: 'password123',
        specialization: 'Gynecologist',
        experience: '12 years',
        aboutMe: 'Specialist in hormonal health and PCOS management.',
        consultationTypes: { video: true, chat: true },
        status: 'Verified'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@her2her.com',
        password: 'password123',
        specialization: 'Nutritionist',
        experience: '8 years',
        aboutMe: 'Helping women achieve wellness through balanced nutrition.',
        consultationTypes: { video: true, chat: true },
        status: 'Verified'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.fitness@her2her.com',
        password: 'password123',
        specialization: 'Fitness Trainer',
        experience: '6 years',
        aboutMe: 'Empowering women through functional fitness and strength training.',
        consultationTypes: { video: true, audio: true },
        status: 'Verified'
      }
    ];

    await Expert.insertMany(experts);
    console.log('Experts seeded successfully');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
