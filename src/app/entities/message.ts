export class Message {
    titulo: string;
    descripcion: string;

    constructor(values = {}){
        Object.assign(this, values);
    }
}