export class UbicacionFavorita {
    id: number;
    nombre: string;
    descripcion: string;
    nombreCategoria: string;
    coordenada: any[];
    idUsuario: number;
    idCategoria: number;

    constructor(
      id: number,
      nombre: string,
      descripcion: string,
      coordenada: any,
      idUsuario: number,
      idCategoria: number
    ) {
      this.id = id;
      this.nombre = nombre;
      this.descripcion = descripcion;
      this.coordenada = coordenada;
      this.idUsuario = idUsuario;
      this.idCategoria = idCategoria;
    }
}
