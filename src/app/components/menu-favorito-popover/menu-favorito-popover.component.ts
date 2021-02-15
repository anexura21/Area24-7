import { Router, NavigationExtras } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { WsMovilidadService } from './../../providers/movilidad/ws-movilidad.service';
import { MessageService } from './../../providers/message.service';
import { FavoritosService } from './../../providers/movilidad/favoritos.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-favorito-popover',
  templateUrl: './menu-favorito-popover.component.html',
  styleUrls: ['./menu-favorito-popover.component.scss'],
})
export class MenuFavoritoPopoverComponent {

  @Input()
  ubicacion: any;
  @Input()
  root: any;

  private deleteUbicacionFavoritaSubscription: Subscription;

  constructor(public favoritosProvider: FavoritosService,
              private utilidades: Common,
              public wsMovilidad: WsMovilidadService,
              private messageProvider: MessageService,
              private navCtrl: NavController,
              private route: Router,
              private popoverCtrl: PopoverController) { }

  editarUbicacionFavorita() {
    const navigateParamsUF: NavigationExtras = {
      queryParams: {
      ubicacion: this.ubicacion,
      root: this.root,
      isModal: false
     }
    };

    // this.navCtrl.push(UbicacionFavoritaPage, pageParams);
    this.route.navigate(['/ubicacion-favorita'], navigateParamsUF);
    this.popoverCtrl.dismiss();
  }

  eliminarUbicacionFavorita() {
    this.utilidades.confirmAlert('Movilidad', '¿Está seguro que desea eliminar esta ubicacion favorita?')
        .then((data) => {
          this.utilidades.presentLoading();
          this.onEliminarUbicacionFavorita(this.ubicacion.id);
        })
        .catch((data) => {
          this.popoverCtrl.dismiss();
        });


    this.popoverCtrl.dismiss();
  }

  onEliminarUbicacionFavorita(idUbicacionFavorita: number) {
    this.wsMovilidad.eliminarUbicacionFavorita(idUbicacionFavorita).toPromise()
        .then(res => {
            this.utilidades.dismissLoading();
            this.popoverCtrl.dismiss();
            this.wsMovilidad.removerUbicacionFavorita(idUbicacionFavorita);
        })
        .catch(err => {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').toPromise()
            .then(response => {
              const msg = response;
              this.utilidades.basicAlert(msg.titulo, msg.descripcion);
              this.utilidades.dismissLoading();
            });
        });
  }

  close() {
    this.popoverCtrl.dismiss();
  }

}
