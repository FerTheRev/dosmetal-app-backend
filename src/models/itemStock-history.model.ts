import { Schema } from 'mongoose';

export interface ItemStockHistory {
	date: number;
	detail: string;
}

export const itemStockHistorySchema = new Schema<ItemStockHistory>({
	date: Number,
	detail: String
});
