import mongoose from 'mongoose';

let cachedDb = null;

export async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside Vercel.');
  }

  const opts = {
    bufferCommands: false,
  };

  cachedDb = await mongoose.connect(process.env.MONGODB_URI, opts);
  return cachedDb;
}