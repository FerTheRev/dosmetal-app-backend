import { Request, Response } from 'express';
import { ClienteModel } from '../models/cliente.model';

export const getAllClients = async (req:Request, res:Response) => {
  const clients = await ClienteModel.find();
  console.log(clients)
  return res.json(clients)
};

export const addNewClient = async (req:Request, res:Response) => {
  console.log(req.body);
  const newClient = new ClienteModel(req.body);

  try {
    newClient.save();
    return res.json({newClient})
  } catch (error) {
    return res.status(500).json({message: 'error al guardar cliente en la base de datos'})
  }
}