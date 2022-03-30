import { connect } from 'mongoose';

const DB_URI = process.env.DB_URI

export const connectDB = () => {
	console.log(`DIRECCION DE BASE DE DATOS ${ DB_URI }`)
	if(!DB_URI) return console.log('no existe direccion de base de datos');
	connect(DB_URI, () => {
		console.log('database connected');
	});
};
