import { Router } from 'express';
import * as controller from '../controllers/presupuestos.controller';

export const PresupuestosRouter = Router();

PresupuestosRouter.get('/getPresupuestos', controller.getPresupuestos);
PresupuestosRouter.get('/getPresupuesto/:_id', controller.getPresupuesto);
PresupuestosRouter.post('/createPresupuesto', controller.cretePresupuesto);
PresupuestosRouter.post('/deleteItem', controller.deleteItemFromPage);
PresupuestosRouter.post('/saveModifiedItem', controller.saveNewOrModifiedItem);
PresupuestosRouter.post('/savePaymentDetails', controller.savePaymentDetails);