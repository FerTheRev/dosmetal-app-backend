import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';
import { Types } from 'mongoose';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { DayEventModel } from '../models/Stock-Day-Event.model';
import { IRetiro } from '../interface/inventory.interface';
import { SoConn } from '../webSocket';

export const getTodayRetiros = async () => {
	const dayJS = dayjs().locale('es');
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	if (month) {
		const day = await StockDayRetiroModel.findOne({
			MonthID: month._id,
			day: dayJS.date()
		});
		if (day) {
			return await day.populate('dayEvents');
		}
		const newDay = new StockDayRetiroModel({
			MonthID: month._id,
			day: dayJS.date(),
			dayEvents: [],
			timestamp: dayJS.valueOf()
		});
		month.days.push(newDay._id);
		await newDay.save();
		await month.save();
		return newDay;
	}
	const newMonth = new StockMonthRetirosModel({
		month: dayJS.format('M-YYYY'),
		days: [],
		timeStamp: dayJS.valueOf()
	});
	const newDay = new StockDayRetiroModel({
		MonthID: newMonth._id,
		day: dayJS.date(),
		timestamp: dayJS.valueOf()
	});

	newMonth.days.push(newDay._id);
	await newDay.save();
	await newMonth.save();
	return newDay;
};

export const getMonthWithDayEventsRetiros = async () => {
	const Months = await StockMonthRetirosModel.find().populate('days');
	return Months;
};

export const registerRetiro = async (retiro: IRetiro) => {
	// const dayJS = dayjs().locale('es');
	// const month = await StockMonthRetirosModel.findOne({
	// 	month: dayJS.format('M-YYYY')
	// });

	// if (month) {
	// 	const day = await StockDayRetiroModel.findOne({
	// 		MonthID: month._id,
	// 		day: dayJS.date()
	// 	});
	// 	if (day) {
	// 		const event = new DayEventModel({
	// 			DayID: day._id,
	// 			paraQuienRetira: retiro.paraQuienRetira,
	// 			nombreQuienRetira: retiro.nombreQuienRetira,
	// 			itemsRetirados: retiro.itemsRetirados.map((e) => {
	// 				return {
	// 					nombre: e.nombre,
	// 					referencia: e.referencia,
	// 					retiro: e.retiro.cantidadQueRetira
	// 				};
	// 			})
	// 		});
	// 		day.dayEvents.push(event);
	// 	}
	// }
	const month = await GetOrCreateMonth();
	const day = await GetOrCreateDay(month._id);

	const event = new DayEventModel({
		DayID: day._id,
		paraQuienRetira: retiro.paraQuienRetira,
		nombreQuienRetira: retiro.nombreQuienRetira,
		itemsRetirados: retiro.itemsRetirados.map((e) => {
			return {
				nombre: e.nombre,
				referencia: e.referencia,
				retiro: e.retiro.cantidadQueRetira
			};
		})
	});
	day.dayEvents.push(event);
	await event.save();
	await day.save();
	const retiros = await getTodayRetiros();
	SoConn.emit('[RETIROS] get Today', retiros);
	return
};

const GetOrCreateMonth = async () => {
	const dayJS = dayjs().locale('es');
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});

	if (!month) {
		const newMonth = new StockMonthRetirosModel({
			month: dayJS.format('M-YYYY'),
			days: [],
			timeStamp: dayJS.valueOf()
		});
		await newMonth.save();
		return newMonth;
	}
	return month;
};

const GetOrCreateDay = async (monthID: Types.ObjectId) => {
	const dayJS = dayjs().locale('es');
	const day = await StockDayRetiroModel.findOne({
		MonthID: monthID,
		day: dayJS.date()
	});

	if (!day) {
		const newDay = new StockDayRetiroModel({
			MonthID: monthID,
			day: dayJS.date(),
			dayEvents: [],
			timestamp: dayJS.valueOf()
		});
		const month = await StockMonthRetirosModel.findById(monthID);
		month?.days.push(newDay);

		await newDay.save();
		await month?.save();
		return newDay;
	}
	return day;
};
