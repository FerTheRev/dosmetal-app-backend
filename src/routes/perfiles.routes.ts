import { Router } from 'express';
import { getPerfilImage } from '../controllers/perfiles.controller';

export const PerfilesRouter = Router();

PerfilesRouter.get('/images/:perfil', getPerfilImage)

