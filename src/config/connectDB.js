const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!URI) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(URI);
    console.log('Connected to MongoDB');

    const Job = mongoose.model('Job');
    const count = await Job.countDocuments();
    console.log(`Current job count in database: ${count}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
