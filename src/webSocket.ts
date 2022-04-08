import { Server } from 'socket.io';
import { ItemStock } from './interface/ItemStock.interface';
import { ItemStockModel } from './models/ItemStock.model';
import {
	getMonthWithDayEventsRetiros,
	getTodayRetiros
} from './services/retiros.service';
import {
	addWSNewItemStock,
	agregarstockWS,
	deleteWSItemStock,
	editWSItemStock,
	retirarStockWS
} from './services/stock.service';

export function WebSocketService(io: Server) {
	io.on('connection', async (socket) => {
		console.log(`User connected, id => ${socket.id}`);
		const items = await ItemStockModel.find();
		io.emit('[STOCK] get stock', items);

		socket.on('[STOCK] add item', async (data) => {
			const item = await addWSNewItemStock(data);
			io.emit('[STOCK] new item added', item);
		});

		socket.on('[STOCK] item modified', async (data) => {
			const itemModified = await editWSItemStock(data);
			io.emit('[STOCK] item modified', itemModified);
		});

		socket.on('[STOCK] delete item', async (itemID: string) => {
			const itemDeleted = await deleteWSItemStock(itemID);
			io.emit('[STOCK] item deleted', itemDeleted);
		});

		//* RETIROS
		emitTodayEvents();
		emitMonthAndDaysEvents();

		socket.on('disconnect', () => {
			console.log(`User disconnected, id => ${socket.id}`);
		});
	});

	//***/*/*/*/*******///*/*/********/*/*/*/ */ */ */
	async function emitTodayEvents() {
		console.log('Emitiendo al usuario el dia de hoy');
		const retiros = await getTodayRetiros();
		io.emit('[RETIROS] get Today', retiros);
	}
	async function emitMonthAndDaysEvents() {
		const MonthsAndDayEvents = await getMonthWithDayEventsRetiros();
		io.emit('[RETIROS] get month and day events', MonthsAndDayEvents);
	}
}
