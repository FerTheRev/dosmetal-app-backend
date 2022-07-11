import { Request, Response } from 'express';
import { IInventory, IInventoryItem, IRetiro } from '../interface/inventory.interface';
import { InventoryModel } from '../models/inventario-item.model';
import { registerRetiro } from '../services/retiros.service';

export const getAllInventory = async (req: Request, res: Response) => {
	const inventory = InventoryModel.find();

	return res.json(inventory);
};

export const AddInventory = async (req: Request, res: Response) => {
	const itemToAdd = req.body;
	const itemReferenceAndNumber = await assignNumber(itemToAdd.Categoria.letra);

	const newItem: IInventory = {
		NumeroAsignado: itemReferenceAndNumber.numero,
		Referencia: itemReferenceAndNumber.referencia,
		...itemToAdd
	};
	const itemToSave = new InventoryModel(newItem);
	try {
		await itemToSave.save();
		return res.json({
			status: true,
			message: 'Inventario guardado con exito',
			item: itemToSave
		});
	} catch (error) {
		return res.json({
			status: true,
			message: 'Fallo al guardar el inventario',
			item: {}
		});
	}
};

export const editInventory = async (req: Request, res: Response) => {
	const itemUpdated = await InventoryModel.findByIdAndUpdate(req.body._id, req.body);
	await itemUpdated!.save();
	return res.json({ status: true });
};

export const removeFromInventory = async (req: Request, res: Response) => {
	const retiro = req.body as IRetiro;

	for await (const [index, itemRetirado] of retiro.itemsRetirados.entries()) {
		const item = await InventoryModel.findOne({
			_id: itemRetirado._id,
			Referencia: itemRetirado.referencia
		});
		let cantidadQueRetira = itemRetirado.retiro.cantidadQueRetira;

		//* RECORRIENDO EL INVENTARIO DISPONIBLE
		item!.Inventario.reverse().forEach((e, i) => {
			//* GUARDANDO EL INVENTARIO EN UNA VARIABLE ANEXADO A SU INDICE EN EL ARRAY ORIGINAL
			const el = item!.Inventario[i];
			//* GUARDANDO LA CANTIDAD DE CONTENEDORES DE DICHO INVENTARIO
			const cantidadContenedores = +el.cantidad_de_contenedor;

			//* RECORRIENDO LA CANTIDAD DE CONTENEDORES DISPONIBLES
			for (
				let CountContenedores = 1;
				CountContenedores <= cantidadContenedores;
				CountContenedores++
			) {
				if (cantidadQueRetira <= 0) break; //* SI YA SE SATISFACCION LAS UNIDADES REQUERIDAS, PARA DE ITERAR
				//* EVALUANDO LA CANTIDAD DE UNIDADES EN EL CONTENEDOR
				switch (true) {
					case el.unidades_en_contenedor > cantidadQueRetira: //* LA CANTIDAD DE UNIDADES DEL CONTENEDOR ES MAYOR DE LO QUE SE REQUIERE
						if (!el.esta_abierto) {
							//* SI EL CONTENEDOR QUE ESTA EVALUANDO NO ESTA ABIERTO
							el.cantidad_de_contenedor -= 1; //! RESTANDO LA CANTIDAD DE CONTENEDORES SELLADOS
							//* AGREGANDO UN NUEVO CONTENEDOR ABIERTO
							item!.Inventario.push({
								cantidad_de_contenedor: 1,
								esta_abierto: true,
								tipo_contenedor: 'Caja',
								unidad_medida: el.unidad_medida,
								unidades_en_contenedor:
									el.unidades_en_contenedor - cantidadQueRetira
							});
							cantidadQueRetira = 0; //* TERMINA DE RESTAR EL STOCK REQUERIDO
						} else {
							el.unidades_en_contenedor -= cantidadQueRetira;
							cantidadQueRetira = 0;
						}
						break;
					case el.unidades_en_contenedor === cantidadQueRetira: //* EL MONTO REQUERIDO ES IGUAL AL STOCK DISPONIBLE EN EL CONTENEDOR
						el.cantidad_de_contenedor -= 1; //! SE RESTA UN CONTENEDOR EN EL INVENTARIO EVALUADO
						cantidadQueRetira = 0; //* TERMINA DE RESTAR EL STOCK REQUERIDO
						break;
					case el.unidades_en_contenedor < cantidadQueRetira: //* EL MONTO REQUERIDO ES MAYOR AL CONTENEDOR QUE TIENE ESTE INVENTARIO
						cantidadQueRetira -= el.unidades_en_contenedor; //! SE RESTA A LAS UNIDADES REQUERIDAS LO QUE TIENE EN STOCK ESTE CONTENEDOR

						if (el.esta_abierto) {
							//* SI EL CONTENEDOR ESTA ABIERTO
							//* SETEANDO LOS VALORES EN 0 PARA POSTERIORMENTE ELIMINARLO DEL ARRAY
							el.cantidad_de_contenedor = 0;
							el.unidades_en_contenedor = 0;
							return;
						}
						el.cantidad_de_contenedor -= 1;
						break;
					default:
						break;
				}
			}
		});
		//* ELIMNANDO DEL INVENTARIO ENCONTRADO CUALQUIER CONTENEDOR VACIO
		item!.Inventario = item!.Inventario.filter((e) => e.cantidad_de_contenedor !== 0);
		//* RECALCULANDO EL TOTAL DE STOCK DISPONIBLE DEL INVENTARIO
		let TotalInventario = 0;
		item!.Inventario.forEach((inventory) => {
			const cuenta =
				inventory.unidades_en_contenedor * inventory.cantidad_de_contenedor;
			TotalInventario += cuenta;
			item!.TotalInventario = TotalInventario;
		});
		//* EVALUANDO Y SETEANDO EL ESTADO DEL INVENTARIO
		switch (true) {
			case TotalInventario <= item!.Cant_poco_stock && TotalInventario > 0:
				item!.InventoryState = 'Poco Stock';
				break;
			case TotalInventario === 0:
				item!.InventoryState = 'Sin Stock';
				item!.TotalInventario = 0;
				break;
			default:
				item!.InventoryState = 'Stock Suficiente';
				break;
		}
		item!.Inventario.reverse();
		try {
			await item!.save();
			if (index === retiro.itemsRetirados.length - 1) {
				await registerRetiro(retiro);
				return res.json({
					status: true,
					message: 'Unidades retiradas correctamente'
				});
			}
		} catch (error) {
				return res
					.status(500)
					.json({ status: false, message: 'Error al retirar las unidades' });
		}
	}
};

export const addToInventory = async (req: Request, res: Response) => {
	const newStock = req.body as {
		reference: string;
		newStock: IInventoryItem[];
		_id: string;
	};
	const itemToAddInventory = await InventoryModel.findById(newStock._id);

	if (!itemToAddInventory)
		return res.json({
			status: false,
			message: 'No existe el item o aun no esta cargado'
		});

	newStock.newStock.forEach((stock) => {
		if (!stock.esta_abierto) {
			console.log('El contenedor no esta abierto');
			const itemIDX = itemToAddInventory.Inventario.findIndex(
				(e) =>
					!e.esta_abierto &&
					e.tipo_contenedor === stock.tipo_contenedor &&
					e.unidades_en_contenedor === stock.unidades_en_contenedor
			);

			if (itemIDX !== -1) {
				console.log('Existe un contenedor con la misma cantidad de unidades');
				itemToAddInventory.Inventario[itemIDX].cantidad_de_contenedor += 1;
				return;
			}
			console.log('No existe un contenedor con la misma cantidad de unidades');
			if (stock.tipo_contenedor === 'Unidades sueltas') {
				itemToAddInventory.Inventario.push(stock);
				return;
			}
			itemToAddInventory.Inventario.unshift(stock);
			return;
		}
		console.log('El contenedor esta abierto');
		const IDX = itemToAddInventory.Inventario.findIndex(
			(e) =>
				e.esta_abierto &&
				e.tipo_contenedor === stock.tipo_contenedor &&
				e.unidades_en_contenedor === stock.unidades_en_contenedor
		);

		if (IDX !== -1) {
			console.log('hay contenedor abierto con la misma cantidad de unidades');
			itemToAddInventory.Inventario[IDX].cantidad_de_contenedor += 1;
			return;
		}
		console.log('no hay contenedor abierto con la misma cantidad de unidades');

		itemToAddInventory.Inventario.push(stock);
	});

	let totalInventario = 0;
	itemToAddInventory.Inventario.forEach((e) => {
		const total = e.unidades_en_contenedor * e.cantidad_de_contenedor;
		totalInventario += total;
	});

	itemToAddInventory.TotalInventario = totalInventario;

	totalInventario > itemToAddInventory.Cant_poco_stock
		? (itemToAddInventory.InventoryState = 'Stock Suficiente')
		: (itemToAddInventory.InventoryState = 'Poco Stock');

	if (itemToAddInventory.TotalInventario <= 0) {
		itemToAddInventory.InventoryState = 'Sin Stock';
	}

	try {
		await itemToAddInventory.save();
		setTimeout(() => {
			return res.json({
				status: true,
				message: 'Stock cargado correctamente',
				newStock: itemToAddInventory
			});
		}, 3000);
	} catch (error) {
		setTimeout(() => {
			return res.json({
				status: false,
				message: 'Ocurrio un error al actualizar el stock'
			});
		}, 3000);
	}
};

export const deleteInventory = async (req: Request, res: Response) => {
	const itemID = req.params._id;
	const itemToDelete = await InventoryModel.findById(itemID);
	if (!itemToDelete)
		return res.json({ status: false, message: 'No existe tal documento' });

	try {
		itemToDelete.delete();
		return res.json({ status: true, message: 'Inventario eliminado con éxito' });
	} catch (error) {
		return res.json({ status: false, message: 'Error al eliminar del inventario' });
	}
};

export const getLowStock = async (req: Request, res: Response) => {
	const inventory = await InventoryModel.find();
	const lowStock = inventory.filter((e) => e.InventoryState === 'Poco Stock');

	return res.json({ data: lowStock });
};

export const changeMinumumUnitsRequired = async (req: Request, res: Response) => {
	const minimum = req.body.newMinumum;
	const itemID = req.body.itemID;

	const item = await InventoryModel.findById(itemID);

	if (!item) return res.status(404).json({ message: 'No existe el item a modificar' });

	item.Cant_poco_stock = minimum;
	//* EVALUANDO Y SETEANDO EL ESTADO DEL INVENTARIO
	switch (true) {
		case item.TotalInventario <= minimum && item.TotalInventario > 0:
			item.InventoryState = 'Poco Stock';
			break;
		case item.TotalInventario === 0:
			item.InventoryState = 'Sin Stock';
			item.TotalInventario = 0;
			break;
		default:
			item.InventoryState = 'Stock Suficiente';
			break;
	}

	try {
		await item.save();
		return res.json({
			message: 'Monto minimo actualizado con exito',
			itemWithChanges: item.toJSON()
		});
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar item' });
	}
};

//* HELPERS
async function assignNumber(letter: string) {
	const inventory = await InventoryModel.find();

	const itemsWithThisLetter = inventory.filter((e) => e.Categoria.letra === letter);

	if (itemsWithThisLetter.length > 0) {
		itemsWithThisLetter.sort((a, b) => a.NumeroAsignado - b.NumeroAsignado);
		let referencia: string = '';
		const itemNro =
			itemsWithThisLetter[itemsWithThisLetter.length - 1].NumeroAsignado + 1;
		switch (true) {
			case itemNro.toString().length === 1:
				referencia = `${letter}-000${itemNro}`;
				break;
			case itemNro.toString().length === 2:
				referencia = `${letter}-00${itemNro}`;
				break;
			case itemNro.toString().length === 3:
				referencia = `${letter}-0${itemNro}`;
				break;
			case itemNro.toString().length === 4:
				referencia = `${letter}-${itemNro}`;
				break;
			default:
				break;
		}
		return { numero: itemNro, referencia };
	}
	const itemNro = 1;
	const referencia = `${letter}-0001`;
	return { numero: itemNro, referencia };
}
