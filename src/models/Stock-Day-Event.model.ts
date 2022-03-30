import mongoose from 'mongoose';
import { Schema } from 'mongoose';

interface IDayEvent {
	DayID: string;
	empleado: string;
	estado: string[];
	obra: string;
	producto: string;
	ubicacion: string;
	unidadesRetiradas: number;
}

const DayEventSchema = new Schema<IDayEvent>(
	{
		DayID: String,
		empleado: String,
		estado: [String],
		obra: String,
		producto: String,
		ubicacion: String,
		unidadesRetiradas: Number
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export const DayEventModel = mongoose.model<IDayEvent>('StockDayEvent', DayEventSchema);
