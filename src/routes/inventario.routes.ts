import { Router } from 'express';
import {
	AddInventory,
	getAllInventory,
	removeFromInventory,
	addToInventory,
	deleteInventory,
	editInventory,
	getLowStock,
	changeMinumumUnitsRequired
} from '../controllers/inventario.controllers';

export const inventoryRouter = Router();

inventoryRouter.get('/all-inventory', getAllInventory);
inventoryRouter.get('/low-stock', getLowStock);
inventoryRouter.post('/add-new-inventory', AddInventory);
inventoryRouter.post('/remove-from-inventory', removeFromInventory);
inventoryRouter.post('/add-to-inventory', addToInventory);
inventoryRouter.post('/change-minumum-stock', changeMinumumUnitsRequired);
inventoryRouter.put('/edit-inventory-data', editInventory);
inventoryRouter.delete('/delete-inventory/:_id', deleteInventory);
