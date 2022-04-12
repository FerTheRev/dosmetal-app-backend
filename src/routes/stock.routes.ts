import { Router } from 'express';
import * as StockController from '../controllers/stock.controllers';

export const StockRoutes = Router();

StockRoutes.get('/', StockController.getAllStock);

StockRoutes.get('/history/:id', StockController.getHistoryItem)

StockRoutes.post('/', StockController.addNewItemStock);

StockRoutes.post('/retirar', StockController.retirarStock);

StockRoutes.post('/sumar', StockController.addStockToItem);

StockRoutes.put('/edit', StockController.editItemStock);
