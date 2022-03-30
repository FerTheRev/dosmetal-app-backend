import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';

const dayJS = dayjs();

export const getTodayRetiros = async (req: Request, res: Response) => {
	const month = await StockMonthRetirosModel.findOne({
		month: dayJS.format('M-YYYY')
	});
	//* Si el mes no existe, hay que crearlo junto con el dia de hoy
	if (!month) {
		const newMonth = new StockMonthRetirosModel({
			month: dayJS.format('M-YYYY'),
			timeStamp: dayJS.valueOf()
		});
		const newDay = new StockDayRetiroModel({
			MonthID: newMonth._id,
			day: dayJS.date(),
			timestamp: dayJS.valueOf()
		});
		newMonth.days.push(newDay._id);
		await newMonth.save();
		await newDay.save();
		return res.json(newMonth.populate('dayEvents'));
	}

	const today = await StockDayRetiroModel.findOne({
		MonthID: month._id,
		day: dayJS.date()
	});
	//* Si existe el mes, pero no el dia, Vamos a crear el dia de hoy
	if (!today) {
		const newDay = new StockDayRetiroModel({
			MonthID: month._id,
			day: dayJS.date(),
			dayEvents: [],
			timestamp: dayJS.valueOf()
		});
		month.days.push(newDay._id);
		await newDay.save();
		await month.save();
		console.log('Dia Creado');
		return res.json(newDay);
	}
	//* Si existe el dia, vamos a entregarlo con el campo Day Events populado
	const TodayPopulated = await today.populate('dayEvents');
	return res.json(TodayPopulated);
};

export const getEspecificDayRetiros = async (req: Request, res: Response) => {
	const dayEvents = await DayEventModel.find({
		DayID: req.body.ActualDay
	});

	if (dayEvents.length <= 0) {
		const day = await StockDayRetiroModel.findOne({
			day: dayJS.date()
		});

		if (day) {
			const recoverDayEvents = await DayEventModel.find({
				DayID: day._id
			});

			return res.json(recoverDayEvents);
		}
	}

	return res.json(dayEvents);
};

export const getMonthWithDaysRetiros = async (req: Request, res: Response) => {
	const Months = await StockMonthRetirosModel.find().populate('days');
	return res.json(Months);
};
