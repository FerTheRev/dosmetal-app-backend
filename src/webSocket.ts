import { Server } from 'socket.io';
import { ItemStockModel } from './models/ItemStock.model';
import {
	addWSNewItemStock,
	deleteWSItemStock,
	editWSItemStock
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

		socket.on('disconnect', () => {
			console.log(`User disconnected, id => ${socket.id}`);
		});
	});
}
