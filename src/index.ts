import { server } from './app';
import { Server } from 'socket.io';
import { connectDB } from './database';
import { WebSocketService } from './webSocket';

const httpServer = server();
connectDB();

//* Init SocketIO

const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

WebSocketService(io);

