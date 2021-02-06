import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-usuario',
    templateUrl: './usuario.page.html',
    styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {

    nombreUsuario = 'Nombre usuario';
    nivel = 'Nivel 1';
    rango = 'Novato';
    puntos = '000';

    public logrosInsignias = [
        {
            image: '../../../assets/icono-asombrate.png',
            descrption: 'Avistador Junior'
        },
        {
            image: '../../../assets/icono-asombrate.png',
            descrption: 'Perfil Validador'
        }
    ];


    constructor() {
    }

    ngOnInit() {
    }

}
