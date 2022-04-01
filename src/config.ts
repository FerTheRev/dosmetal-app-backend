import { config } from 'dotenv';
config();

export const INITIAL_CONFIG = {
  MONGO_DB: process.env.DB_URI || 'mongodb://localhost:3000/dos-metal-backend'
}