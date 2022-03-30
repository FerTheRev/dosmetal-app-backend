import { connect } from 'mongoose';

const DB_URI = process.env.DB_URI || 'mongodb+srv://DanielLarrosa:Unarefacil123@dosmetaldb.sj2b2.mongodb.net/dos-metal-backend?retryWrites=true&w=majority';
const DB_LOCAL_URI = 'mongodb://localhost:27017/dos-metal-backend';

export const connectDB = () => {
	connect(DB_URI, () => {
		console.log('database connected');
	});
};
