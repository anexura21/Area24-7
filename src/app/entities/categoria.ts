export class Categoria {
    id: number;
    nombre: string;
    descripcion: string;

    constructor(json: any) {
        if (!json) {return; }
        this.id = json.id;
        this.nombre = json.nombre;
        this.descripcion = json.descripcion;
    }

    static parse(json: any[]): Categoria[] {
        return json.map((item: any): Categoria => new Categoria(item));
    }

    static parseCategorias(json: any[]): Categoria[] {
        return json.map((item: any): Categoria => {
        const categoria: Categoria = new Categoria(null);
        categoria.id = item.id;
        categoria.nombre = item.nombre;
        categoria.descripcion = item.descripcion;
        return categoria;
        });
    }
}
