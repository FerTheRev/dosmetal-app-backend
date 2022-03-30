import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ItemStock } from '../interface/ItemStock.interface';

const ItemStockSchema = new Schema<ItemStock>(
	{
		referencia: String,
		categoria: String,
		detalle: String,
		cajas: Number,
		unidades_por_caja: Number,
		unidades_sueltas: Number,
		total: Number,
		necesitaRecargarStock: Boolean,
		stockMinimo: Number,
		ubicacion: String,
		image: String
	},
	{
		versionKey: false,
		timestamps: true
	}
);

export const ItemStockModel = mongoose.model<ItemStock>('Stock-item', ItemStockSchema);
