import { SeleccionarMapaComponent } from './../../components/seleccionar-mapa/seleccionar-mapa.component';
import { MessageService } from './../../providers/message.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Common } from 'src/app/shared/utilidades/common.service';
import { WsMovilidadService } from './../../providers/movilidad/ws-movilidad.service';
import { MODOS_BUSQUEDA, Ubicacion } from './../../entities/movilidad/ubicacion.model';
import { UbicacionFavorita } from './../../entities/movilidad/ubicacion-favorita.model';
import { AppLayer } from './../../entities/app-layer';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
enum Modos {
  NUEVO,
  GUARDAR
}

@Component({
  selector: 'app-ubicacion-favorita',
  templateUrl: './ubicacion-favorita.page.html',
  styleUrls: ['./ubicacion-favorita.page.scss'],
})
export class UbicacionFavoritaPage implements OnInit {

  item: any = {};
  categorias: any[];
  idCategoriaSelected: any;
  ubicacion: Ubicacion;

  titulo = 'Ubicaciones Favoritas';

  public modo: any = Modos.NUEVO;
  public root: any;
  public seleccionarMapaModalFavorito = true;
  public modalFavorito = true;
  public appLayer: AppLayer;
  public isModal = false;


  @Output() clickGuardarUbicacionFavorita ? = new EventEmitter();
  @Output() clickSeleccionarUbicacionMapaFavorita ? = new EventEmitter();

  constructor(private route: ActivatedRoute,
              private wsMovilidad: WsMovilidadService,
              private utilidades: Common,
              private alertCtrl: AlertController,
              private translateService: TranslateService,
              private messageProvider: MessageService,
              private modalCtrl: ModalController) {
    this.route.params.subscribe((dataT: any) => {
      this.appLayer = dataT.root;
      // this.ubicacion = data.ubicacion;
      if (dataT.ubicacion) {
        const data =  dataT.ubicacion as UbicacionFavorita;
        console.log(data);

        const ubi = new Ubicacion();

        ubi.latitud = data.coordenada[1];
        ubi.longitud = data.coordenada[0];
        ubi.descripcion = data.descripcion;


        this.idCategoriaSelected = data.idCategoria;

        this.item = {
          nombre: data.nombre,
          ubicacion: ubi,
          id: data.id
        };

        this.modo = Modos.GUARDAR;
        this.item.ubicacion.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;
      }else {
        const ubi = new Ubicacion();
        ubi.modoBusqueda = MODOS_BUSQUEDA.PREDICCION_GOOGLE;
        this.item = {
          nombre: null,
          ubicacion: ubi,
          id: 0
        };
        this.item.ubicacion.txtPlaceholder = 'Ubicación';
        this.modo = Modos.NUEVO;
        }
      this.utilidades.presentLoading();
      this.onListarCategoriasUbicacionFavorita();
    });
  }

  ngOnInit() {
  }

  onChange(event){
    this.idCategoriaSelected = event;
  }

  clickSeleccionarPrediccion(event) {
    this.utilidades.dismissLoading();
  }

  ionViewDidLeave(){
    this.utilidades.dismissLoading();
  }

  guardar() {
      console.log('UbicacionFavoritaPage:guardar', this.item);
      if (this.item.nombre != null && this.item.nombre !== '' && this.item.ubicacion.descripcion
          && this.idCategoriaSelected != null) {
        const coordenada = [];
        coordenada[1] = this.item.ubicacion.latitud;
        coordenada[0] = this.item.ubicacion.longitud;
        const descripcion = this.item.ubicacion.descripcion;
        const idUsuario = this.utilidades.obtenerUsuarioActivo().id;
        const ubicacionFavorita =
            new UbicacionFavorita(this.item.id, this.item.nombre, descripcion, coordenada, idUsuario, this.idCategoriaSelected);
        this.utilidades.presentLoading();
        if (this.modo === Modos.NUEVO) {
          this.onCrearUbicacionFavorita(ubicacionFavorita);
        } else {
          this.onActualizarUbicacionFavorita(ubicacionFavorita);
        }

        // if(this.isModal){
        this.utilidades.dismissModal();
        // }else{
        //   this.navCtrl.pop();
        // }
        this.modalCtrl.dismiss();

      }else {
        this.mostrarAlerta('Faltan campos por diligenciar!');
      }
  }

  async mostrarAlerta(message) {
    const alert = await this.alertCtrl.create({
      header: 'Advertencia',
      subHeader: message,
      buttons: ['ACEPTAR']
    });
    return alert.present();
  }

  ubicacionValida(item) {
    if (item != null) {
      return item.nombre != null;
    }
    return false;
  }

  mostrarErrores() {
    console.log('UbicacionFavoritaPage:mostrarErrores');
  }

  chooseItem2(item: any) {
    console.log('modal > chooseItemmmmm > item > ', this, item);
    this.item.ubicacion.descripcion = item.description;
    this.item = item;
  }



  async clickSeleccionarUbicacionMapa(event: any) {
    const params = {
      ubicacion: this.ubicacion,
      root: this.appLayer,
      animate: false
    };

    const options = {
      showBackdrop: false,
      enableBackdropDismiss: false
    };

    const seleccionarMapaModal = await this.modalCtrl.create(
      {
        component: SeleccionarMapaComponent,
        componentProps: params,
        backdropDismiss: false
      });

    seleccionarMapaModal.onDidDismiss().then((res: any) => {
      if (res){
        const {latitud, longitud, descripcion} = res;
        const ubi = new Ubicacion();
        ubi.descripcion = descripcion;
        ubi.latitud = latitud;
        ubi.longitud = longitud;
        this.item.ubicacion = ubi;
      }
    });

    seleccionarMapaModal.present();
  }

  clickAceptarUbicacion() {
    this.seleccionarMapaModalFavorito = false;
    this.modalFavorito = true;
  }

  crearMarkerFlotante() {
    console.log('BuscarUbicacionComponent:crearMarkerFlotante', this);
    const DomElementMarker = document.createElement('div');
    DomElementMarker.id = 'domElementMarker';
    DomElementMarker.className = 'Centrarpin';

  }


  onCrearUbicacionFavorita(ubicacionFavorita: UbicacionFavorita) {
    this.wsMovilidad.crearUbicacionFavorita(ubicacionFavorita)
      .subscribe(
      succces => {
        this.utilidades.dismissLoading();
        console.log('Exito servicio CrearUbicacionFavorita', succces);
        this.wsMovilidad.updateListUbicaciones(ubicacionFavorita.idUsuario);
      },
      error => {
        if (error.status === 409) {
         this.messageProvider.getByNombreIdentificador('ubicaciones_max').subscribe(
            (response: any): void => {
              this.utilidades.dismissLoading();
              const msg = response;
              this.utilidades.confirmAlert(msg.titulo, msg.descripcion);
            }
        );
        } else {
          this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
            (response: any): void => {
                const msg = response;
                this.utilidades.confirmAlert(msg.titulo, msg.descripcion).then(r => {this.utilidades.dismissLoading(); });
            }
          );
        }
        console.log('Error servicio rutas cercanas', error);
      }
      );
  }

  onActualizarUbicacionFavorita(ubicacionFavorita: UbicacionFavorita) {
    this.wsMovilidad.actualizarUbicacionFavorita(ubicacionFavorita)
      .subscribe(
      succces => {

        this.utilidades.dismissLoading();
        console.log('Exito servicio actualizarUbicacionFavorita', succces);
        this.wsMovilidad.updateListUbicaciones(ubicacionFavorita.idUsuario);
      },
      error => {
        console.log('Error servicio actualizarUbicacionFavorita', error);
        this.messageProvider.getByNombreIdentificador('inconveniente_movilidad').subscribe(
          (response: any): void => {
              const msg = response;
              this.utilidades.confirmAlert(msg.titulo, msg.descripcion).then( r => {this.utilidades.dismissLoading(); });
          }
       );
      }
      );
  }

  onListarCategoriasUbicacionFavorita() {
    this.wsMovilidad.obtenerCategoriasUbcacionFavorita()
      .subscribe(
      (succces: any) => {
        console.log('Favoritas', succces);
        this.utilidades.dismissLoading();
        this.categorias = succces;
      },
      error => {
        const {title, inconveniente} = this.translateService.instant('app');
        this.utilidades.dismissLoading();
        this.utilidades.basicAlert(title, inconveniente);
      }
      );
  }

  async seleccionarMapa(event: any){
    const params = {
      ubicacion: this.ubicacion,
      root: this.root,
      animate: false
    };
    const navOptions = {
      showBackdrop: false,
      enableBackdropDismiss: false
    };

    const establecerUbicacionModal = await this.modalCtrl.create(
      {
        component: SeleccionarMapaComponent,
        componentProps: params,
        backdropDismiss: false
      });
      // SeleccionarMapaPage,params,navOptions)

    establecerUbicacionModal.onDidDismiss().then(data => {
        this.item.ubicacion = data;
        console.log(data);
      });

    return establecerUbicacionModal.present();
  }

}
