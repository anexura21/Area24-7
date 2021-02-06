import { LoginPage } from './pages/login/login.page';
import { LocationUpdateService } from './providers/location-update.service';
import { MessageService } from './providers/message.service';
import { Common } from './shared/utilidades/common.service';
import { InicioPage } from './pages/inicio/inicio.page';
import { SideMenuPage } from './pages/side-menu/side-menu.page';
import { Component, ViewChild, Injector } from '@angular/core';
import { Location } from '@angular/common';

import { Platform, NavController, IonNav, MenuController, ModalController, PopoverController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OneSignal, OSNotificationOpenedResult } from '@ionic-native/onesignal/ngx';
import { CONFIG_ENV } from './shared/config-env-service/const-env';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  @ViewChild(SideMenuPage) sideMenu: SideMenuPage;

  rootPage: any = LoginPage;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private location: Location,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private common: Common,
    private messageService: MessageService,
    private injector: Injector,
    private oneSignal: OneSignal,
    private locationUpdate: LocationUpdateService
  ) {
      this.common.submenu.sAvistamientos = false;
      this.common.submenu.sEntorno = false;
      this.common.submenu.sHuellas = false;
      this.common.submenu.sMovilidad = false;
      this.common.submenu.sOrdenamiento = false;
      this.common.submenu.sVigias = false;
      this.common.submenu.sConcursoFotografia = false;
      this.common.submenu.sInformate = false;
      this.common.submenu.sEcociudadanos = false;
      this.common.submenu.sEmprendedores = false;

      platform.ready().then(
        () => {
            if (platform.is('cordova')) {this.cordovaSetUps(); }
            this.appLifeCycleEvents();
            // this.locationUpdate.init();
        }
      );
  }

  cordovaSetUps(): void {
    this.registerBackButton();
    this.statusBar.styleDefault();
    this.statusBar.overlaysWebView(false);
    this.splashScreen.hide();
    this.oneSignalSetup();
  }

  oneSignalSetup(): void {
    // this.oneSignal.setLogLevel({ logLevel: 6, visualLevel: 6 });
    this.oneSignal.startInit(CONFIG_ENV.ONESIGNAL_APPLICATION_ID, CONFIG_ENV.ONESIGNAL_SENDER_ID);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    // this.oneSignal.setSubscription(true);
    this.oneSignal.handleNotificationReceived().subscribe(
        (item: any) => { });

    this.oneSignal.handleNotificationOpened().subscribe(
        (result: OSNotificationOpenedResult) => {
            console.log('Notificación ', JSON.stringify(result));
            if (!result.notification.payload.additionalData.urlImagen) {// Notificacones mídeme
                // let notificacinMideme = this.common.createModal(MidemeModalCheckChallengeComponent, {
                //     reto: result.notification.payload.additionalData,
                // });
                // notificacinMideme.present();
            } else {// Notificaciones globales
                // let notificacionModal = this.common.createModal(NotificacionAlertComponent, {
                //     titulo: result.notification.payload.title,
                //     descripcion: result.notification.payload.body,
                //     imagen: result.notification.payload.additionalData.urlImagen,
                // });
                // notificacionModal.present();
            }
        });
    this.oneSignal.endInit();
  }

  registerBackButton() {
    this.platform.backButton.subscribeWithPriority(10, (processNextHandlet) => {
      if (this.common.submenu.sAvistamientos
        || this.common.submenu.sConcursoFotografia
        || this.common.submenu.sEntorno
        || this.common.submenu.sHuellas
        || this.common.submenu.sMovilidad
        || this.common.submenu.sOrdenamiento
        || this.common.submenu.sVigias
        || this.common.submenu.sInformate
        || this.common.submenu.sEcociudadanos
        || this.common.submenu.sEmprendedores) {
        console.log('onClickHome ');
        InicioPage.emitGoToHome();
    }else if (this.modalCtrl.getTop()) {
      this.modalCtrl.dismiss();
    } else if (this.menuCtrl.isOpen()){
      this.menuCtrl.close();
    } else {
        console.log('exit app');
        this.messageService.getByNombreIdentificador('salir app').subscribe(
            response => {
                console.log('registerBackButton getByNombreIdentificador ' + JSON.stringify(response));
                console.log(response);
                const msg = response;
                // this.common.presentAcceptCancelAlert(msg.titulo, msg.descripcion, () => {
                //   navigator['app'].exitApp();
                // });
            },
            error => console.log('registerBackButton getByNombreIdentificador error ' + JSON.stringify(error))
        );
    }
    });

  }

  public onCloseMenu(): void {
    this.sideMenu.onCloseMenu();
  }

  appLifeCycleEvents(): void {
    document.addEventListener(
        'resume'
        , () => {
            LocationUpdateService.switchedToLocationSettings = false;
        }
        , false
    );
}

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.splashScreen.hide();
      this.notification({});
    });
  }

  notification(data) {
    if (this.platform.is('ios') || this.platform.is('android')) {
        this.oneSignal.startInit(CONFIG_ENV.ONESIGNAL_APPLICATION_ID, CONFIG_ENV.ONESIGNAL_SENDER_ID);
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
        // this.oneSignal.setSubscription(true);
        this.oneSignal.getIds().then((ids: any) => {
            const objUsuarioW = JSON.parse(localStorage.getItem('usuarioWeb'));
            const objUsuario = JSON.parse(localStorage.getItem('usuario'));
            objUsuario.tokenDispositivo = JSON.stringify(ids);
            objUsuarioW.tokenDispositivo = JSON.stringify(ids);
            // localStorage.setItem('usuario', JSON.stringify(objUsuario));
            localStorage.setItem('usuario', JSON.stringify(objUsuario));
            localStorage.setItem('usuarioWeb', JSON.stringify(objUsuarioW));
        });

        try {
            this.oneSignal.handleNotificationReceived().subscribe((item: any) => {
                alert('recibi mensaje!!');
                console.log('llego mensaje', item.data.prueba1);
            });

            this.oneSignal.handleNotificationOpened().subscribe(() => {
                // do something when a notification is opened
            });
        } catch (error) {

        }
        this.oneSignal.endInit();
    }
}

}
