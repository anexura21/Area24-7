import { Injectable, Injector } from '@angular/core';
import { AlertController, ModalController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class Common {

  private static injector: Injector;

  submenu = {
    sHuellas: false,
    sAvistamientos: false,
    sEntorno: false,
    sOrdenamiento: false,
    sVigias: false,
    sMovilidad: false,
    sConcursoFotografia: false,
    sInformate: false,
    sEcociudadanos: false,
    sEmprendedores: false
  };

  stackActiveLayersSubcapas: number[] = new Array();

  capas = [];
  activeLayers = {
    ids: [],
    level: ''
  };
  alert: any;
  private modalStack: any[] = new Array<any>();

  static setInjector(injector: Injector) { Common.injector = injector; }

  static getInjector(): Injector { return Common.injector; }

  constructor(public alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController) {
    // this.alertCtrl.create();
    // this.alert = this.alertCtrl;
  }

  obtenerUsuarioActivo(): any {
    return JSON.parse(localStorage.getItem('usuario'));
  }

  // Omití opciones
  async createModal(component: any, data?: any, opts?: any) {
    const modalOptions = {
      component,
      data,
      opts
    };
    const modal = await this.modalCtrl.create({
      component,
      componentProps: data
    });
    await modal.present();
  }

  async internalBasicAlePrtCss(titulo: string, mensaje: string, css: string, boton: string, resolve, reject) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      backdropDismiss: true,
      cssClass: css,
      subHeader: mensaje,
      buttons: [
        {
          text: boton,
          handler: () => {
            resolve(true);
          }
        },
        {
          text: '',
          cssClass: 'closeBt',
          handler: () => {
            reject(false);
          }
        }
      ]
    });
    await alert.present();
  }

  basicAlePrtCss(titulo: string, mensaje: string, css: string, boton: string) {
    return new Promise((resolve, reject) => {
      this.internalBasicAlePrtCss(titulo, mensaje, css, boton, resolve, reject);
    });
  }

  async presentAcceptCancelAlert(title: string, message: string, onAccept: () => void) {
    // if (this.alert) {return; }
    const alert = await this.alertCtrl.create({
      header: title,
      message,
      buttons: [
        {
          text: 'Aceptar',
          handler: onAccept
        },
        {
          text: 'Regresar'
        },
        {
          text: '',
          cssClass: 'closeBt',
        }
      ]
    });
    this.alert.onDidDismiss((data: any, role: string) => {
      this.alert = null;
    });
    await this.alert.present();
  }

  async presentAlert(alertOptions: any) {
    // if (this.alert) {return; }
    this.alert = await this.alertCtrl.create(alertOptions);
    this.alert.onDidDismiss((data: any, role: string) => {
      this.alert = null;
    });
    await this.alert.present();
  }

  async generalAlert(pTitle, pSubtitle) {
    const alert = await this.alertCtrl.create({
      header: '<ion-toolbar color="primary">' + pTitle + '</ion-toolbar>',
      subHeader: pSubtitle,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            // this.platform.exitApp();

          }
        },
        {
          text: '',
          cssClass: 'closeBt',
          handler: () => {
            // reject(false);
          }
        }
      ],
      cssClass: '{background-color: white; color: red; button{ color: red;}}'
    });

    await alert.present();
  }

  async basicAlert(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'alertAv',
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'Aceptar',
        },
        {
          text: '',
          cssClass: 'closeBt',
        }
      ]
    });

    await alert.present();
  }

  async presentAcceptAlert(title: string, message: string, onAccept?: () => void) {

    const options: any = {
      header: title,
      enableBackdropDismiss: true,
      message,
      cssClass: 'alert-button',
      buttons: [
        {
          text: 'Aceptar',
          role: 'cancel',
          handler: onAccept
        }
      ]
    };
    this.alert = await this.alertCtrl.create(options);
    this.alert.onDidDismiss((data: any, role: string) => {
      this.alert = null;
    });
    return this.alert.present();
  }

  async confirmAlert(titulo: string, mensaje: string, ) {
    return new Promise( async (resolve, reject) => {
      const alert = await this.alert.create({
        header: titulo,
        enableBackdropDismiss: true,
        subHeader: mensaje,
        cssClass: 'warning  alertAv',
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {
              reject(false);
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              resolve(true);
            }
          },
          {
            text: '',
            cssClass: 'closeBt',
            handler: () => {
              reject(false);
            }
          }
        ]
      });
      alert.present();
    });
  }

  dismissModal(data?: any, role?: string, navOptions?: any): Promise<any> {
    if (this.canDismissModal()) {
      //
      console.log('dismissing modal');
      const modal: any = this.modalStack.pop();
      return modal.dismiss(data, role, navOptions);
    }
    return null;
  }

  canDismissModal(): boolean {
    console.log('modalStack ' + this.modalStack.length);
    return this.modalStack.length > 0;
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Un momento por favor...',
      backdropDismiss: true,
    });
    return loading.present();
  }

  async presentFullLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: null,
      message: '<img src="assets/logo3.png"/>',
      cssClass: 'custom-loading'
    });
    return loading.present();
  }

  async appToast(objetoToast: any) {
    const toast = await this.toastCtrl.create({
      message: objetoToast.mensaje,
      duration: objetoToast.duration,
      position: objetoToast.posicion
    });
  }

  dismissLoading(): void {
    this.loadingCtrl.dismiss();
  }


  convertColorArrayToRgb(arrayColor: any) {

    const element = { r: Number, g: Number, b: Number };
    const rgbArray: Array<any> = JSON.parse(arrayColor); // arrayColor.replace('"', ' '); //arrayColor[0].split(",");
    element.r = rgbArray[0];
    element.g = rgbArray[2];
    element.b = rgbArray[1];
    // rgbArray[3];
    return this.convertColorRgbToHex(element);
  }

  convertColorRgbToHex(objRGB: any) {
    return '#' + this.componentToHex(objRGB.r) + this.componentToHex(objRGB.g) + this.componentToHex(objRGB.b);
  }


  componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  crearCoordendas(cooredenadasResponse: any[]): any {
    const coordenadasRuta = [];
    for (let index = 0; index < cooredenadasResponse.length; index++ , index++) {
      const lat = +cooredenadasResponse[index];
      const lng = +cooredenadasResponse[index + 1];
      coordenadasRuta.push({ latitud: lat, longitud: lng });
    }
    return coordenadasRuta;
  }

  obtenerModosTransportesActivos(preferenciasTransporte: any[]) {
    const modosTransportes = [];
    for (const pTrans of preferenciasTransporte) {
      if (pTrans._active) {
        const res = pTrans._id;
        if (res !== null ) {
          modosTransportes.push(res);
        }
      }
    }
    if (modosTransportes.length > 0) {
      return '9,' + modosTransportes.toString();
    } else {
      return '9';
    }
  }

  obtenerModoTransporteIdService(modoTransporteIn: any) {
    let modoTransporte = null;
    if (modoTransporteIn.id === 1) {
      modoTransporte = '2';
    }

    if (modoTransporteIn.id === 2) {
      modoTransporte = '0';
    }

    if (modoTransporteIn.id === 3) {
      modoTransporte = '6';
    }

    if (modoTransporteIn.id === 4) {
      modoTransporte = '3';
    }

    if (modoTransporteIn.id === 5) {
      modoTransporte = '4,7';
    }

    if (modoTransporteIn.id === 6) {
      modoTransporte = '1';
    }

    if (modoTransporteIn.id === 7) {
      modoTransporte = '5';
    }

    if (modoTransporteIn.id === 8) {
      modoTransporte = '8';
    }


    if (modoTransporteIn.id === 9) {
      modoTransporte = '7';
    }

    return modoTransporte;
  }


}
