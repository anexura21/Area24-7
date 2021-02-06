import {Component, OnInit} from '@angular/core';


@Component({
    selector: 'app-muevete',
    templateUrl: './muevete.page.html',
    styleUrls: ['./muevete.page.scss'],
})
export class MuevetePage implements OnInit {

    public rowMuevete1 = [
        {
            title: 'Viajes',
            image: '../../../assets/muevete/categorias/viajes.png',
            color: ''
        },
        {
            title: 'EnCicla',
            image: '../../../assets/muevete/categorias/EnCicla.png',
            color: ''
        }
    ];
    public rowMuevete2 = [
        {
            title: 'Puntos cercanos',
            image: '../../../assets/muevete/categorias/Puntos-cercanos.png',
            color: ''
        },
        {
            title: 'Pico y Placa',
            image: '../../../assets/muevete/categorias/PyP.png',
            color: ''
        }
    ];
    public rowMuevete3 = [
        {
            title: 'Líneas y Rutas',
            image: '../../../assets/muevete/categorias/LineasyRutas.png'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }


}
