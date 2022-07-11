import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { RetirosRoutes } from './routes/retiros.routes';
import { PerfilesRouter } from './routes/perfiles.routes';
import { inventoryRouter } from './routes/inventario.routes';
import { ClientRouter } from './routes/clientes.routes';
import { PresupuestosRouter } from './routes/presupuestos.routes';
import path from 'path'

const app = express();

//* Configuration
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//* Middlewares
app.use(cors());
app.use(morgan('dev'));

//* Routes
app.use('/dosmetal/api/inventory', inventoryRouter);
app.use('/dosmetal/api/retiros', RetirosRoutes);
app.use('/dosmetal/api/perfiles', PerfilesRouter);
app.use('/dosmetal/api/clientes', ClientRouter);
app.use('/dosmetal/api/presupuestos', PresupuestosRouter)

//* Public
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'))
//* Start
export const server = () => {
	return app.listen(app.get('port'), '192.168.0.66', () => {
		console.log(`Server listen on port: ${app.get('port')}`);
	});
};
