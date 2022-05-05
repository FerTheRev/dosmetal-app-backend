import { Request, Response } from 'express';
import { existsSync } from 'fs';
import path from 'path'


/**
 * It checks if the image exists, if it does, it sends it, if it doesn't, it sends a default image.
 * @param {Request} req - Request - The request object.
 * @param {Response} res - Response
 * @returns The image is being returned.
 */
export const getPerfilImage = (req: Request, res: Response) => {
	
	const perfil_img = path.join(__dirname,'images','perfiles', req.params.perfil);
	
  const validate = existsSync(perfil_img);
	if(validate) {
		return res.sendFile(perfil_img)
	};
	return res.sendFile(path.join(__dirname,'images','perfiles', 'no-image.png'));
};
