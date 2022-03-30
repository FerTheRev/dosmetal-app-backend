import { Request, Response } from 'express';
import dayjs from 'dayjs';

import { ItemStock } from '../interface/ItemStock.interface';
import { ItemStockModel } from '../models/ItemStock.model';

import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';
import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';

//* Recuperar todo el stock disponible
export const getAllStock = async (req: Request, res: Response) => {
	const items = await ItemStockModel.find();
	return res.json(items);
};

//* Agregar un nuevo item al stock
export const addNewItemStock = async (req: Request, res: Response) => {
	const item = req.body as ItemStock;
	const newItem = new ItemStockModel(item);
	try {
		const newItemSaved = await newItem.save();
		res.json({ success: true, newItem: newItemSaved });
	} catch (error) {
		res.json({ success: false });
	}
};

//* Retirar stock de un item
export const retirarStock = async (req: Request, res: Response) => {
	const [retiro, item] = req.body;
	const dayJS = dayjs();
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
			return res.json({ success: true });
		} catch (error) {
			return res.status(500).json({ success: false });
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
			return res.json({ success: true });
		} catch (error) {
			return res.status(500).json({ success: false });
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
		return res.json({ success: true });
	} catch (error) {
		return res.status(500).json({ success: false });
	}
};

//* Cargar stock a un item
export const addStockToItem = async (req: Request, res: Response) => {
	const item = req.body as ItemStock;
	console.log(item.total);
	const itemFounded = await ItemStockModel.findByIdAndUpdate(item._id, item);
	if (itemFounded) {
		await itemFounded.save();
		return res.json({ success: true });
	}

	return res.status(500).json({ success: false });
};

//* Editar metadatos de un item en el stock
export const editItemStock = async (req: Request, res: Response) => {
	const item = req.body;
	console.log(item);
	const itemUpdate = await ItemStockModel.findByIdAndUpdate(item._id, item);
	try {
		if (itemUpdate) {
			await itemUpdate.save();
			return res.json({ success: 'Item actualizado correctamente' });
		}
	} catch (error) {
		return res.json({ error: 'Error al actualizar item' });
	}
};
