import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

const dayJS = dayjs(1652270596000).locale('es');

export const getTodayRetiros = async () => {
	console.log(
		`[RETIROS] Se requirio los retiros del dia de hoy ${dayJS.format('M-YYYY')}`
	);
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	if (month) {
		console.log('[RETIROS] El mes existe, verificando dia');
		const day = await StockDayRetiroModel.findOne({
			MonthID: month._id,
			day: dayJS.date()
		});
		if (day) {
			console.log(`[RETIROS] El dia ${dayJS.format('DD-MM')} existe`);
			return await day.populate('dayEvents');
		}
		const newDay = new StockDayRetiroModel({
			MonthID: month._id,
			day: dayJS.date(),
			dayEvents: [],
			timestamp: dayJS.valueOf()
		});
		await newDay.save();
		return await newDay.populate('DayEvents');
	}
	console.log('[RETIROS] Mes inexistente');
	console.log('[RETIROS] Creando mes');
	const newMonth = new StockMonthRetirosModel({
		month: dayJS.format('M-YYYY'),
		days: [],
		timeStamp: dayJS.valueOf()
	});
	console.log('[RETIROS] Creando día');
	const newDay = new StockDayRetiroModel({
		MonthID: newMonth._id,
		day: dayJS.date(),
		timestamp: dayJS.valueOf()
	});

	newMonth.days.push(newDay._id);
	await newDay.save();
	await newMonth.save();
	return newDay.populate('dayEvents');
};

export const getMonthWithDayEventsRetiros = async () => {
	console.log(`[RETIROS] El usuario requiere los meses con sus dias de retiros`);
	const Months = await StockMonthRetirosModel.find().populate('days');
	return Months;
};
