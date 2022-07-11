import { IItemRetirado } from "./inventory.interface";

export interface ICliente {
	_id?: string;
	nombre: string;
	cuit: string;
	telefono: string;
	email: string;
	presupuestos: string[];
	Obras: IObra[];
}
export interface IObra {
	_id?: string;
	nombre: string;
	horasTrabajadas: number;
	MaterialGastado: IItemRetirado[];
}
