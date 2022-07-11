import mongoose from 'mongoose';
import { Schema } from 'mongoose';

interface IDayEvent {
	DayID: string;
	paraQuienRetira: string;
	nombreQuienRetira: string;
	itemsRetirados: {
		nombre: string;
		referencia: string;
		retiro: {
			cantidadQueRetira: number;
		};
	}[];
}

const DayEventSchema = new Schema<IDayEvent>(
	{
		DayID: String,
		paraQuienRetira: String,
		nombreQuienRetira: String,
		itemsRetirados: [
			{
				nombre: String,
				referencia: String,
				retiro: Number
			}
		]
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export const DayEventModel = mongoose.model<IDayEvent>('StockDayEvent', DayEventSchema);
