import { config } from 'dotenv';
config();

export const INITIAL_CONFIG = {
	MONGO_DB: process.env.DB_URI || 'mongodb://localhost:27017/dos-metal-backend'
};
