const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const connectDB = async () => {
  try {
    const c = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB: ${c.connection.host}`);
  } catch (e) { console.error('❌ DB:', e.message); }
};
module.exports = connectDB;
