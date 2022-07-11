export interface IPresupuestoMetadata {
  Sres: string;
  PresupuestoNum: string;
  Obra: string;
  Fecha: string;
  Referencia: string;
}

export interface Item {
  itemNro: number;
  Descripcion: string;
  Precio: string;
}

export interface IPaymentMethods {
  metodo: string;
  PlazodeEntrega: string;
  LugardeEntrega: string;
  ValidezdelPresupuesto: string;
  SubTotal: string;
  Iva21: string;
  Total: string;
}

export interface IPage {
  pageNumber: number;
  pageData: Item[];
  isActual: boolean;
  showFooter: boolean;
}
export interface IPresupesto {
  _id?: string;
  Cliente: IPresupuestoMetadata;
  FormadePago: IPaymentMethods;
  Paginas: IPage[];
}