import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-siata',
    templateUrl: './siata.page.html',
    styleUrls: ['./siata.page.scss'],
})
export class SiataPage implements OnInit {

    public rowSiata1 = [
        {
            title: 'Pronóstico',
            image: '../../../assets/siata/categorias/pronostico.png',
            color: ''
        },
        {
            title: 'Calidad del aire',
            image: '../../../assets/siata/categorias/calidad-de-aire.png',
            color: ''
        }
    ];
    public rowSiata2 = [
        {
            title: 'Monitoreo hídrico',
            image: '../../../assets/siata/categorias/monitoreo-hidrico.png',
            color: ''
        },
        {
            title: 'Pico y Placa Ambiental',
            image: '../../../assets/siata/categorias/PyP-ambiental.png',
            color: ''
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
