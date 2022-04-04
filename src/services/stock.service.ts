import { ItemStock } from '../interface/ItemStock.interface';
import { ItemStockModel } from '../models/ItemStock.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';
import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';

import dayjs from 'dayjs';

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

export const retirarStockWS = async (data: any[]) => {
	const [retiro, item] = data;
	const dayJS = dayjs();
	console.log('El usuario retirara stock');
	try {
		const itemFinded = await ItemStockModel.findById(item._id);
		await ItemStockModel.findByIdAndUpdate(item._id, item);
	} catch (error) {}

	console.log(dayJS.format('M'));
	const ExistMonth = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	if (!ExistMonth) {
		try {
			console.log('No existe el mes, creando mes....');
			const newMonth = new StockMonthRetirosModel({
				month: dayJS.format('M-YYYY')
			});
			const newDay = new StockDayRetiroModel({
				MonthID: newMonth._id,
				day: dayJS.date()
			});
			const newDayEvent = new DayEventModel({
				...retiro,
				DayID: newDay._id
			});

			newDay.dayEvents.push(newDayEvent._id);
			newMonth.days.push(newDay._id);

			await newMonth.save();
			await newDay.save();
			await newDayEvent.save();
			return { success: true };
		} catch (error) {
			return { success: false };
		}
	}

	console.log('Existe el mes, verificando que existe el dia');
	const ExisteDay = await StockDayRetiroModel.findOne({
		MonthID: ExistMonth._id,
		day: dayJS.date()
	});
	if (ExisteDay) {
		try {
			console.log('Existe el dia, agregando evento al array...');
			const newDayEvent = new DayEventModel({ DayID: ExisteDay._id, ...retiro });
			ExisteDay.dayEvents.push(newDayEvent._id);
			await newDayEvent.save();
			await ExisteDay.save();
			return { success: true };
		} catch (error) {
			return { success: false };
		}
	}
	console.log('Existe el mes, pero no el dia');
	try {
		const newDay = new StockDayRetiroModel({
			MonthID: ExistMonth._id,
			day: dayJS.date()
		});
		const newDayEvent = new DayEventModel({
			DayID: newDay._id,
			...retiro
		});
		newDay.dayEvents.push(newDayEvent._id);
		await newDay.save();
		await newDayEvent.save();
		return { success: true };
	} catch (error) {
		return { success: false };
	}
};

export const agregarstockWS = async (item: ItemStock) => {
	const itemFounded = await ItemStockModel.findByIdAndUpdate(item._id, item);
	if (itemFounded) {
		await itemFounded.save();
		return { success: true };
	}

	return { success: false };
};
