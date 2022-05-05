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
/**
 * It takes a request, and then it checks if the item exists, if it does, it subtracts the amount of
 * units that were taken out of stock, and then it checks if the item needs to be re-stocked, if it
 * does, it sets the flag to true, and then it saves the item
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns a promise.
 */
export const retirarStock = async (req: Request, res: Response) => {
	const dayJS = dayjs();

	const retiro: {
		id: string;
		unidadesRetiradas: {
			cajas: number;
			unidades_sueltas: number;
		};
		producto: string;
		obra: string;
		empleado: string;
		timestamp: number;
		estado: string;
		ubicacion: string;
	} = req.body;

	console.log('[STOCK] Se requiere retirar stock');
	console.log(retiro);
	const item = await ItemStockModel.findById(retiro.id);

	if (item) {
		item.cajas -= retiro.unidadesRetiradas.cajas;

		if (retiro.unidadesRetiradas.unidades_sueltas > item.unidades_sueltas) {
			item.cajas -= 1;
			item.unidades_sueltas += item.unidades_por_caja;
			item.unidades_sueltas -= retiro.unidadesRetiradas.unidades_sueltas;
			item.necesitaRecargarStock = item.stockMinimo > item.total;
		} else {
			item.unidades_sueltas -= retiro.unidadesRetiradas.unidades_sueltas;
			item.necesitaRecargarStock = item.total < item.stockMinimo;
		};

		item.total = item.unidades_por_caja * item.cajas + item.unidades_sueltas;
		item.necesitaRecargarStock = item.total < item.stockMinimo;
		const DetailMessage = () => {
			switch (true) {
				case retiro.unidadesRetiradas.cajas > 0 &&
					retiro.unidadesRetiradas.unidades_sueltas > 0:
					return `Se han retirado ${retiro.unidadesRetiradas.cajas} cajas
				y ${retiro.unidadesRetiradas.unidades_sueltas} unidades sueltas, RESTAN: ${item.total} sumando todo.`;

				case retiro.unidadesRetiradas.cajas <= 0 &&
					retiro.unidadesRetiradas.unidades_sueltas > 0:
					return `Se han retirado ${retiro.unidadesRetiradas.unidades_sueltas} unidades sueltas, RESTAN: ${item.total} sumando todo.`;
				case retiro.unidadesRetiradas.cajas > 0 && retiro.unidadesRetiradas.unidades_sueltas <= 0 :
					return `Se han retirado ${retiro.unidadesRetiradas.cajas} cajas, RESTAN ${item.total} sumando todo`
				default:
					true;
					return '';
			}
		};
		
		item.historial.push({
			date: dayJS.valueOf(),
			detail: DetailMessage()
		});

		await item.save();
	} else {
		return res
			.status(500)
			.json({ reason: 'Error al descontar stock, item inexistente' });
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
				return res.json({ success: 'Retiro exitoso' });
			} catch (error) {
				return res.status(500).json({ reason: 'Error al retirar stock' });
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
			return res.json({ success: `[STOCK][RETIROS] Retiro registrado con exito` });
		} catch (error) {
			return res.status(500).json({ reason: 'Error al retirar stock' });
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
		return res.json({ success: `[STOCK][RETIROS] Retiro registrado con exito` });
	} catch (error) {
		return res.status(500).json({ reason: 'Error al retirar stock' });
	}
};

//* Cargar stock a un item
/**
 * It takes a request, and a response, and it finds an item in the database, and then it adds the
 * amount of boxes and loose units that the user has specified, and then it saves the item
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns a Promise.
 */
export const addStockToItem = async (req: Request, res: Response) => {
	const dayJS = dayjs();

	const itemChanges = req.body as {
		id: string;
		total_cajas: number;
		unidades_sueltas: number;
	};
	const item = await ItemStockModel.findOne({ _id: itemChanges.id });
	if (item) {
		item.cajas += itemChanges.total_cajas;
		item.unidades_sueltas += itemChanges.unidades_sueltas;
		item.total = item.unidades_por_caja * item.cajas + item.unidades_sueltas;
		item.historial.push({
			date: dayJS.valueOf(),
			detail: `Se ha agregado un total de ${itemChanges.total_cajas} cajas y/o
			 ${itemChanges.unidades_sueltas} unidades sueltas a este item, ahora hay un total de ${item.total} sumando todo.`
		});
		if (item.total >= item.stockMinimo) item.necesitaRecargarStock = false;
		console.log(item);
		await item.save();
		return res.json({ success: 'ITEM actualizado correctamente' });
	}
	return res.status(500).json({ reason: 'ITEM no encontrado' });
};

//* Editar metadatos de un item en el stock
/**
 * It takes the item from the request body, finds the item in the database by its id, and updates the
 * item in the database with the item from the request body
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns The itemUpdate is being returned.
 */
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

//* Obtener el historial de un item
/**
 * It gets the history of an item from the database and returns it to the user.
 * @param {Request} req - Request
 * @param {Response} res - Response
 * @returns The history of the item.
 */
export const getHistoryItem = async (req: Request, res: Response) => {
	const item = await ItemStockModel.findById(req.params.id);
	if (item) {
		const { historial } = item;
		return res.json({ historial });
	}
	return res.status(500).json({ reason: 'Item Inexistente' });
};
