import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { StockDayRetiroModel } from '../models/Stock-day-retiros.model';
import { DayEventModel } from '../models/Stock-Day-Event.model';
import { StockMonthRetirosModel } from '../models/Stock-Month-Retiros.model';

const dayJS = dayjs();

export const getEspecificDayRetiros = async (req: Request, res: Response) => {
	console.log('El usuario requirio un dia especifico de retiros')
	const dayEvents = await DayEventModel.find({
		DayID: req.body.ActualDay
	});

	return res.json(dayEvents);
};
