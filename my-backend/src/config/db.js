import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
};