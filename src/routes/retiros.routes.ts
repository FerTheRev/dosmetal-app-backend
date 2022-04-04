import { Router } from 'express';

import * as RetirosController from '../controllers/retiros.controllers';

export const RetirosRoutes = Router();

RetirosRoutes.post('/especificDay', RetirosController.getEspecificDayRetiros);
