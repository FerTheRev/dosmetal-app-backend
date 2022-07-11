import { model, Schema } from 'mongoose';
import { IInventory } from '../interface/inventory.interface';
import { itemStockHistorySchema } from './itemStock-history.model';

const InventorySchema = new Schema<IInventory>({
	Nombre: String,
	Ubicacion: String,
	Categoria: { rubro: String, letra: String },
	ImgRef: String,
	Cant_poco_stock: Number,
	InventoryState: String,
	NumeroAsignado: Number,
	Referencia: String,
	Inventario: [
		{
			cantidad_de_contenedor: Number,
			tipo_contenedor: String,
			unidad_medida: String,
			unidades_en_contenedor: Number,
			esta_abierto: Boolean
		}
	],
	TotalInventario: String
});

export const InventoryModel = model<IInventory>('Inventory-item',InventorySchema)