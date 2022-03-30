import mongoose from 'mongoose';
import { Schema } from 'mongoose';

interface IStockRetiros {
	month: String;
	days: any[];
	timeStamp: number;
}

const StockMonthRetirosSchema = new Schema<IStockRetiros>(
	{
		month: String,
		timeStamp: Number,
		days: [{ type: Schema.Types.ObjectId, ref: 'StockDayRetiros' }]
	},
	{
		timestamps: true,
		versionKey: false
	}
);

export const StockMonthRetirosModel = mongoose.model<IStockRetiros>(
	'StockMonthRetiros',
	StockMonthRetirosSchema
);
