import { Server, Socket } from 'socket.io';
import { InventoryModel } from './models/inventario-item.model';
import {
	getMonthWithDayEventsRetiros,
	getTodayRetiros
} from './services/retiros.service';

export let SoConn: Server

export function WebSocketService(io: Server) {
	io.on('connection', async (socket) => {
		SoConn = io;
		console.log(`User connected, id => ${socket.id}`);
		const inventory = await InventoryModel.find();
		io.emit('[Inventory] get all inventory', inventory);

		socket.on('[Inventory] inform inventory changes', async () => {
			console.log('[Inventory] INFORMANDO CAMBIOS EN EL INVENTARIO');
			const inventoryUpdated = await InventoryModel.find();
			socket.broadcast.emit('[Inventory] changes on inventory', inventoryUpdated);
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
