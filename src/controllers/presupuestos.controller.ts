import { Request, Response } from 'express';
import { IPaymentMethods, IPresupesto, Item } from '../interface/presupuesto.interface';
import { PresupuestoModel } from '../models/presupuesto.model';

export const getPresupuestos = async (req: Request, res: Response) => {
	const Presupuestos = await PresupuestoModel.find();
	return res.json(Presupuestos);
};

export const getPresupuesto = async (req: Request, res: Response) => {
	const presupuesto = await PresupuestoModel.findById(req.params._id);
	if (!presupuesto)
		return res
			.status(404)
			.json({ message: 'Error al obtener presupuesto o no existe' });

	return res.json(presupuesto);
};

export const cretePresupuesto = async (req: Request, res: Response) => {
	const presupuesto = req.body as IPresupesto;
	const nuevoPresupuesto = new PresupuestoModel(presupuesto);

	try {
		const presupuestoSaved = await nuevoPresupuesto.save();
		res.json({
			presupuesto: presupuestoSaved,
			message: 'Presupuesto creado con exito'
		});
	} catch (error) {
		res.status(500).json({ message: 'Error al crear presupuesto' });
	}
};

export const saveNewOrModifiedItem = async (req: Request, res: Response) => {
	const requestData: {
		pageNumber: number;
		data: { data: Item; formaDePago: IPaymentMethods };
		DocID: string;
		index: number;
	} = req.body;
	const Presupuesto = await PresupuestoModel.findById(req.body.DocID);
	if (Presupuesto) {
		const pageIDX = Presupuesto.Paginas.findIndex(
			(e) => e.pageNumber === requestData.pageNumber
		);
		Presupuesto.Paginas[pageIDX].pageData[requestData.index] = requestData.data.data;
		Presupuesto.FormadePago = requestData.data.formaDePago;
		try {
			await Presupuesto.save();
			return res.json({ message: 'Item guardado con exito' });
		} catch (error) {
			return res.status(500).json({ message: 'Error al guardar el item' });
		}
	}
	return res.status(500).json({ message: 'Error al guardar el item' });
};

export const savePaymentDetails = async (req: Request, res: Response) => {
	const data = req.body as {
		documentID: string;
		metodo: string;
		PlazoDeEntrega: string;
		LugarDeEntrega: string;
		ValidezDelPresupuesto: string;
	};
	const document = await PresupuestoModel.findById(data.documentID);

	if (!document) return res.status(500).json({ message: 'El documento no existe' });

	document.FormadePago.metodo = data.metodo;
	document.FormadePago.PlazodeEntrega = data.PlazoDeEntrega;
	document.FormadePago.LugardeEntrega = data.LugarDeEntrega;
	document.FormadePago.ValidezdelPresupuesto = data.ValidezDelPresupuesto;

	try {
		await document.save();
		return res.json({ message: 'Documento actualizado' });
	} catch (error) {
		return res.status(500).json({ message: 'Error al guardar documento' });
	}
};

export const deleteItemFromPage = async (req: Request, res: Response) => {
	const request = req.body as { DocID: string; pageNumber: number; itemIndex: number };
	const Presupuesto = await PresupuestoModel.findById(request.DocID);

	if (Presupuesto) {
		const pageIDX = Presupuesto.Paginas.findIndex(
			(e) => e.pageNumber === request.pageNumber
		);
		Presupuesto.Paginas[pageIDX].pageData = Presupuesto.Paginas[pageIDX].pageData
			.filter((e, i) => i !== request.itemIndex)
			.map((f, i) => {
				f.itemNro = i + 1;
				return f;
			});

		try {
			await Presupuesto.save();
			return res.json({
				message: 'Item eliminado con exito',
				newArray: Presupuesto.Paginas[pageIDX].pageData
			});
		} catch (error) {
			return res.status(500).json({ message: 'Error al eliminar item' });
		}
	}
};
