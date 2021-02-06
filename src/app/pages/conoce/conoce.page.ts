import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-conoce',
    templateUrl: './conoce.page.html',
    styleUrls: ['./conoce.page.scss'],
})
export class ConocePage implements OnInit {

    public rowConoce1 = [
        {
            title: 'Sitios de interés',
            image: '../../../assets/conoce/categorias/sitios-de-interes.png',
            color: ''
        },
        {
            title: 'Zonas Protegidas',
            image: '../../../assets/conoce/categorias/zonas-protegidas.png',
            color: ''
        }
    ];

    public rowConoce2 = [
        {
            title: 'Aprovechamiento',
            image: '../../../assets/conoce/categorias/aprovechamientos.png'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
