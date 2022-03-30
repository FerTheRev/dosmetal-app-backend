import { Router } from 'express';

import * as RetirosController from '../controllers/retiros.controllers'

export const RetirosRoutes = Router();

RetirosRoutes.get('/today', RetirosController.getTodayRetiros);

RetirosRoutes.post('/especificDay', RetirosController.getEspecificDayRetiros);

RetirosRoutes.get('', RetirosController.getMonthWithDaysRetiros);
