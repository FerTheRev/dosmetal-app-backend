import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const StockDayRetiroSchema = new Schema<{
	MonthID: string;
	day: string;
	dayEvents: any[];
	timestamp: number;
}>(
	{
		MonthID: String,
		day: String,
		timestamp: Number,
		dayEvents: [
			{
				type: Schema.Types.ObjectId,
				ref: 'StockDayEvent'
			}
		]
	},
	{
		versionKey: false
	}
);

export const StockDayRetiroModel = mongoose.model<{
	MonthID: string;
	day: string;
	timestamp: number,
	dayEvents: any[];
}>('StockDayRetiros', StockDayRetiroSchema);
