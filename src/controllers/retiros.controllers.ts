import { Request, Response } from 'express';
import { DayEventModel } from '../models/Stock-Day-Event.model';


export const getEspecificDayRetiros = async (req: Request, res: Response) => {
	console.log('El usuario requirio un dia especifico de retiros')
	const dayEvents = await DayEventModel.find({
		DayID: req.body.ActualDay
	});

	return res.json(dayEvents);
};
