import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-asombrate',
    templateUrl: './asombrate.page.html',
    styleUrls: ['./asombrate.page.scss'],
})
export class AsombratePage implements OnInit {

    public rowAsombrate1 = [
        {
            title: 'Avistamientos',
            image: '../../../assets/asombrate/capas/avistamientos.png',
            color: ''
        },
        {
            title: 'Inventario de fauna',
            image: '../../../assets/asombrate/capas/inventario-de-fauna.png',
            color: ''
        }
    ];

    public rowAsombrate2 = [
        {
            title: 'Reportar un avistamiento',
            image: '../../../assets/asombrate/capas/reportar-avistamiento.png',
            action: '/asombrate/reportar-avistamiento'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
