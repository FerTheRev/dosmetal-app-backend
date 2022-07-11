import { Schema, model } from 'mongoose';
import { IPresupesto } from '../interface/presupuesto.interface';

const PresupuestoSchema = new Schema<IPresupesto>({
	Cliente: {
		Sres: String,
		PresupuestoNum: String,
		Obra: String,
		Fecha: String,
		Referencia: String
	},
	FormadePago: {
		metodo: String,
		PlazodeEntrega: String,
		LugardeEntrega: String,
		ValidezdelPresupuesto: String,
		SubTotal: Number,
		Iva21: Number,
		Total: Number
	},
	Paginas: [
		{
			pageNumber: Number,
			pageData: [
				{
					itemNro: Number,
					Descripcion: String,
					Precio: String
				}
			],
			isActual: Boolean,
			showFooter: Boolean
		}
	]
});

export const PresupuestoModel = model<IPresupesto>('Presupuesto', PresupuestoSchema);
