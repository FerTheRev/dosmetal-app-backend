import mongoose from 'mongoose';
import { Schema } from 'mongoose';

interface IDayEvent {
	DayID: string;
	empleado: string;
	estado: string[];
	obra: string;
	producto: string;
	ubicacion: string;
	unidadesRetiradas: {
		cajas: Number;
		unidades_sueltas: Number;
	};
}

const DayEventSchema = new Schema<IDayEvent>(
	{
		DayID: String,
		empleado: String,
		estado: [String],
		obra: String,
		producto: String,
		ubicacion: String,
		unidadesRetiradas: {
			cajas: Number,
			unidades_sueltas: Number
		}
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export const DayEventModel = mongoose.model<IDayEvent>('StockDayEvent', DayEventSchema);
