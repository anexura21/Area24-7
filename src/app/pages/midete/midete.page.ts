import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-midete',
    templateUrl: './midete.page.html',
    styleUrls: ['./midete.page.scss'],
})
export class MidetePage implements OnInit {

    public rowMidete = [
        {
            title: 'Cálculo consumo de agua',
            image: '../../../assets/midete/categorias/calculo-consumo-de-agua.png',
            color: ''
        },
        {
            title: 'Residuos posconsumo',
            image: '../../../assets/midete/categorias/residuos-posconsumo.png',
            color: ''
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
