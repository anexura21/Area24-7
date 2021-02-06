import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-cuidame',
    templateUrl: './cuidame.page.html',
    styleUrls: ['./cuidame.page.scss'],
})
export class CuidamePage implements OnInit {

    public rowCuidame1 = [
        {
            title: 'Todos los Reportes',
            image: '../../../assets/cuidame/categorias/todos-los-reportes.png',
            color: ''
        },
        {
            title: 'Mis Reportes',
            image: '../../../assets/cuidame/categorias/mis-reportes.png',
            color: ''
        }
    ];

    public rowCuidame2 = [
        {
            title: 'Reportar',
            image: '../../../assets/cuidame/categorias/reportar.png'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
