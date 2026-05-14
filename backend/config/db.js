const dns = require('dns');
const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  if (!mongoUri) {
    const error = new Error('MONGODB_URI is not set');
    error.status = 500;
    throw error;
  }

  mongoose.set('strictQuery', true);

  if (mongoUri.startsWith('mongodb+srv://')) {
    try {
      await mongoose.connect(mongoUri);
      return;
    } catch (err) {
      if (err.syscall === 'querySrv' || err.message.includes('querySrv')) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        // Retry once with a public DNS resolver in case local DNS cannot resolve Atlas SRV records.
        await mongoose.connect(mongoUri);
        return;
      }
      throw err;
    }
  }

  await mongoose.connect(mongoUri);
}

module.exports = { connectDB };
