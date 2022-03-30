import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { StockRoutes } from './routes/stock.routes';
import { RetirosRoutes } from './routes/retiros.routes';

const app = express();

//* Configuration
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//* Middlewares
app.use(cors());
app.use(morgan('dev'));

//* Routes
app.use('/dosmetal/api/stock', StockRoutes);
app.use('/dosmetal/api/retiros', RetirosRoutes);

//* Start
export const server = () => {
	return app.listen(app.get('port'), () => {
		console.log(`Server listen on port: ${app.get('port')}`);
	});
};
