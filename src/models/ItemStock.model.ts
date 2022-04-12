import { model, Schema } from 'mongoose';
import { ItemStock } from '../interface/ItemStock.interface';
import { itemStockHistorySchema } from './itemStock-history.model';

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
		image: String,
		historial: [itemStockHistorySchema]
	},
	{
		versionKey: false,
		timestamps: true
	}
);

export const ItemStockModel = model<ItemStock>('Stock-item', ItemStockSchema);
