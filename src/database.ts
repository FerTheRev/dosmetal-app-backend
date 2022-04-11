import { connect } from 'mongoose';
import { INITIAL_CONFIG } from './config';

export const connectDB = () => {

	connect(INITIAL_CONFIG.MONGO_DB, () => {
		console.log('database connected');
	});
};
