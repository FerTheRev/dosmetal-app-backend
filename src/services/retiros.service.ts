import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';

import dayjs from 'dayjs';

const dayJS = dayjs();

export const getTodayRetiros = async () => {
	console.log(
		`[RETIROS] Se requirio los retiros del dia de hoy - ${dayJS.format('M-YYYY')}`
	);
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	//* Si el mes no existe, hay que crearlo junto con el dia de hoy
	if (!month) {
		console.log(`[RETIROS] El mes ${dayJS.format('M-YYYY')} no existe, creandolo `);
		const newMonth = new StockMonthRetirosModel({
			month: dayJS.format('M-YYYY'),
			timeStamp: dayJS.valueOf()
		});
		console.log(`[RETIROS] Mes creado con exito`);
		console.log(`[RETIROS] Continuando con la creacion del dia ${dayJS.date()}`);

		const newDay = new StockDayRetiroModel({
			MonthID: newMonth._id,
			day: dayJS.date(),
			timestamp: dayJS.valueOf()
		});

		newMonth.days.push(newDay._id);
		await newMonth.save();
		const todaySaved = await newDay.save();
		console.log(`[RETIROS] El dia ${dayJS.date()} fue creado con exito`);
		console.log(`[RETIROS] Entregado el dia de hoy`);
		return todaySaved.populate('dayEvents');
	}
	//* Si existe el mes, pero no el dia, Vamos a crear el dia de hoy
	console.log(
		`El mes ${dayJS.format(
			'M-YYYY'
		)} existe, verificando que exista el dia ${dayJS.date()}`
	);
	const today = await StockDayRetiroModel.findOne({
		MonthID: month._id,
		day: dayJS.date()
	});
	if (!today) {
		console.log(`[RETIROS] El dia ${dayJS.date()} no existe, creando el dia`);

		const newDay = new StockDayRetiroModel({
			MonthID: month._id,
			day: dayJS.date(),
			dayEvents: [],
			timestamp: dayJS.valueOf()
		});
		console.log(
			`[RETIROS] Agregando el dia ${dayJS.date()} al mes ${dayJS.format('M-YYYY')}`
		);
		month.days.push(newDay._id);
		await newDay.save();
		await month.save();
		console.log(`[RETIROS] Dia creado exitosamente`);

		return newDay;
	}
	//* Si existe el dia, vamos a entregarlo con el campo Day Events populado
	console.log(
		`El dia ${dayJS.date()} y el mes ${dayJS.format('M-YYYY')} existen, retornandolo`
	);
	const TodayPopulated = await today.populate('dayEvents');
	return TodayPopulated;
};

export const getMonthWithDayEventsRetiros = async () => {
	console.log(`[RETIROS] El usuario requiere los meses con sus dias de retiros`);
	const Months = await StockMonthRetirosModel.find().populate('days');
	return Months;
};
