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
	console.log('El usuario retirara stock');
	try {
		await ItemStockModel.findByIdAndUpdate(item._id, item);
	} catch (error) {
		console.log('Error al actualizar item');
		return;
	}

	console.log(`Registrando retiro de stock del dia ${dayJS.format('DD-MM-YYYY')}`);
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	if (month) {
		console.log(`[STOCK][RETIROS] El mes existe, verificando día ${dayJS.date()}`);
		const day = await StockDayRetiroModel.findOne({
			MonthID: month._id,
			day: dayJS.date()
		});
		if (day) {
			try {
				console.log(`[STOCK][RETIROS] El dia existe, registrando retiro`);
				const Event = new DayEventModel({
					...retiro,
					DayID: day._id
				});
				day.dayEvents.push(Event._id);
				await day.save();
				await Event.save();
				console.log(`[STOCK][RETIROS] Retiro registrado con exito`);
				return res.json({ success: true });
			} catch (error) {
				return res.status(500).json({ success: false });
			}
		}

		try {
			console.log(
				`[STOCK][RETIROS]El dia ${dayJS.format('DD-MM')} no existe, creando dia`
			);
			const newDay = new StockDayRetiroModel({
				MonthID: month._id,
				day: dayJS.date(),
				dayEvents: [],
				timestamp: dayJS.valueOf()
			});
			month.days.push(newDay._id);
			const Event = new DayEventModel({
				...retiro,
				DayID: newDay._id
			});
			newDay.dayEvents.push(Event._id);
			await Event.save();
			await newDay.save();
			await month.save();
			console.log(`[STOCK][RETIROS] Retiro registrado con exito`);
			return res.json({ success: true });
		} catch (error) {
			return res.status(500).json({ success: false });
		}
	}

	console.log(
		`[STOCK][RETIROS] El mes ${dayJS.format('MM-YYYY')} no existe, creando mes`
	);
	const newMonth = new StockMonthRetirosModel({
		month: dayJS.format('MM-YYYY'),
		days: [],
		timeStamp: dayJS.valueOf()
	});
	console.log(`[STOCK][RETIROS] Creando dia ${dayJS.format('DD-MM')}`);
	const newDay = new StockDayRetiroModel({
		MonthID: newMonth._id,
		day: dayJS.date(),
		dayEvents: [],
		timestamp: dayJS.valueOf()
	});

	newMonth.days.push(newMonth._id);
	console.log(`[STOCK][RETIROS] Creando Evento`);
	const Event = new DayEventModel({
		DayID: newDay._id,
		...retiro
	});
	newDay.dayEvents.push(Event._id);
	try {
		await Event.save();
		await newDay.save();
		await newMonth.save();
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
