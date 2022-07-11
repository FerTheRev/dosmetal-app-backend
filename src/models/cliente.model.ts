import { model, Schema } from 'mongoose';
import { ICliente } from '../interface/clientes.interface';

const ClienteSchema = new Schema<ICliente>({
	nombre: String,
	cuit: String,
	email: String,
	telefono: String,
	presupuestos: [String],
	Obras: []
});

export const ClienteModel = model<ICliente>('Cliente', ClienteSchema);
