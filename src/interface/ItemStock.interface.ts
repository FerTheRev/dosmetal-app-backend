export interface ItemStock {
	_id?: string;
	referencia: string;
	categoria: string;
	detalle: string;
	cajas: number;
	unidades_por_caja: number;
	unidades_sueltas: number;
	total: number;
	necesitaRecargarStock: boolean;
	stockMinimo: number;
	ubicacion: string;
	image: string;
}
