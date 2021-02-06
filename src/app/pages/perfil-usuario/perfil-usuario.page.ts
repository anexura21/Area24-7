import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-perfil-usuario',
    templateUrl: './perfil-usuario.page.html',
    styleUrls: ['./perfil-usuario.page.scss'],
})
export class PerfilUsuarioPage implements OnInit {

    selectedTab = 'datos';
    nombreUsuario = 'Nombre usuario';
    nivel = 'Nivel 1';
    rango = 'Novato';
    puntos = '000';

    public gridPuntosLogros = [
        {
            image: '../../../assets/midete/categorias/calculo-consumo-de-agua.png',
            descrption: 'Termina el Álbum de Aves del Valle de Aburrá'
        },
        {
            image: '',
            descrption: 'Valida xx avistamientos y suma de puntos'
        },
        {
            image: '',
            descrption: 'Completa tus datos personales en la opción de Datos'
        }
    ];
    public gridActividadReciente = [
        {
            image: '../../../assets/midete/categorias/calculo-consumo-de-agua.png',
            descrption: 'Validaste el avistamiento de XXXX'
        },
        {
            image: '',
            descrption: 'Validaste el avistamiento de XXXX'
        }
    ];
    public gridInsignias = [
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
