export interface IInventory {
	_id?: string;
	ImgRef: string;
	Inventario: IInventoryItem[];
	Nombre: string;
	Ubicacion: string;
	Cant_poco_stock: number;
	Categoria: { rubro: string; letra: string };
	NumeroAsignado: number;
	Referencia: string;
	TotalInventario: number;
	InventoryState: string;
}

export interface IInventoryItem {
	cantidad_de_contenedor: number;
	tipo_contenedor: string;
	unidad_medida: string;
	unidades_en_contenedor: number;
	esta_abierto: boolean;
}

export interface IRetiro {
	paraQuienRetira: string;
	nombreQuienRetira: string;
	itemsRetirados: IItemRetirado[];
}

export interface IItemRetirado {
	_id: string;
	imgURL: string;
	nombre: string;
	referencia: string;
	retiro: {
		cantidadQueRetira: number;
	};
}
