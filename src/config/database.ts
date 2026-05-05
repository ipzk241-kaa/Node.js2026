import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dota2';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB підключено успішно');
  } catch (error) {
    console.error('Помилка підключення до MongoDB:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB відключено');
});