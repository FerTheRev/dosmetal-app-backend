import { connect } from 'mongoose';
import { INITIAL_CONFIG } from './config';

export const connectDB = () => {
	if (!INITIAL_CONFIG.MONGO_DB)
		return console.log('no existe direccion de base de datos');
	connect(INITIAL_CONFIG.MONGO_DB, () => {
		console.log('database connected');
	});
};
