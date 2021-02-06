export interface MenuOptionModel {
	nombre: string;
	descripcion: string;
	codigoColor: string;
	activo: boolean;
	favorito: boolean;
	capas?: Array<any>;
}