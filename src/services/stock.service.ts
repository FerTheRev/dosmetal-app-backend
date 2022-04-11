import { ItemStock } from '../interface/ItemStock.interface';
import { ItemStockModel } from '../models/ItemStock.model';



export const addWSNewItemStock = async (item: ItemStock) => {
	const newItem = new ItemStockModel(item);
	try {
		const newItemSaved = await newItem.save();
		return { success: true, newItem: newItemSaved };
	} catch (error) {
		return { succes: false, newItem: {} };
	}
};

//* Editar metadatos de un item en el stock
export const editWSItemStock = async (item: ItemStock) => {
	const itemUpdate = await ItemStockModel.findByIdAndUpdate(item._id, item);
	console.log(item);
	try {
		if (itemUpdate) {
			await itemUpdate.save();
			return {
				success: true,
				itemUpdated: item,
				event: 'Item actualizado correctamente'
			};
		}
	} catch (error) {
		return {
			success: false,
			itemUpdated: {},
			event: 'Error al actualizar item'
		};
	}
};

//* Eliminar un item del stock
export const deleteWSItemStock = async (itemID: string) => {
	try {
		await ItemStockModel.findByIdAndDelete(itemID);
		return {
			success: true,
			itemID,
			event: 'Item eliminado correctamente'
		};
	} catch (error) {
		return {
			success: false,
			itemID,
			event: 'Error al eliminar item'
		};
	}
};

