import { GooglemapsService } from './../../providers/googlemaps.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { InformationComponent } from './../information/information.component';
import { PolicyComponent } from './../policy/policy.component';
import { UpdatePasswordComponent } from './../update-password/update-password.component';
import { PerfilComponent } from './../perfil/perfil.component';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Component, OnInit } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { AppRate } from '@ionic-native/app-rate/ngx';

@Component({
  selector: 'general-configuration',
  templateUrl: './general-configuration.component.html',
  styleUrls: ['./general-configuration.component.scss'],
})
export class GeneralConfigurationComponent implements OnInit {

  private logoutState = false;
    options: InAppBrowserOptions = {
        location: 'yes', // Or 'no'
        hidden: 'no', // Or  'yes'
        clearcache: 'yes',
        clearsessioncache: 'yes',
        zoom: 'yes', // Android only ,shows browser zoom controls
        hardwareback: 'yes',
        mediaPlaybackRequiresUserAction: 'no',
        shouldPauseOnSuspend: 'no', // Android only
        closebuttoncaption: 'Cerrar', // iOS only
        disallowoverscroll: 'no', // iOS only
        toolbar: 'yes', // iOS only
        enableViewportScale: 'yes', // iOS only
        allowInlineMediaPlayback: 'yes', // iOS only
        presentationstyle: 'pagesheet', // iOS only
        toolbarposition: 'top',
        fullscreen: 'yes', // Windows only
    };

  constructor(private theInAppBrowser: InAppBrowser,
              private plt: Platform,
              private modalCtrl: ModalController,
              private appRate: AppRate,
              private oneSignal: OneSignal,
              private googleMaps: GooglemapsService,
              private navCtrl: NavController) { }

  ngOnInit() {}

  helpModal(){
    let target = '_blank';
    if (this.plt.is('ios')) {
        target = '_blank';
    }
    this.theInAppBrowser.create('https://youtu.be/_mXVNNWHM6I', target, this.options);
  }
  async perfilUsuario(){
    console.log('Perfil Usuario');
    const datos = JSON.parse(localStorage.getItem('usuario'));
    const perfilModal = await this.modalCtrl.create({
      component: PerfilComponent,
      componentProps: {
        datos
      }
    });
    return perfilModal.present();
  }

  showUpdatePasswordOption(): boolean {
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (user) {return user.nombreFuenteRegistro === 'AP'; }
    else{ return false; }
  }

  async updatePassword(){
    const updatePsswrd = await this.modalCtrl.create({
      component: UpdatePasswordComponent
    });
    return updatePsswrd.present();
  }

  async policyModal(){
    const policy = await this.modalCtrl.create({
      component: PolicyComponent
    });
    return policy.present();
  }
  async openModal(){
    const info = await this.modalCtrl.create({
      component: InformationComponent
    });
    return info.present();
  }
  qualify(){
    this.appRate.preferences = {
      displayAppName: 'Área 24/7',
      usesUntilPrompt: 2,
      useCustomRateDialog: true,
      simpleMode: true,
      promptAgainForEachNewVersion: false,
      storeAppURL: {
        ios: '1386193166',
        android: 'market://details?id=co.gov.metropol.area247'
      },
      customLocale: {
        title: '¿Te gusta la app Área 24/7?',
        message: 'Queremos conocer tu experiencia, califica nuestra App',
        cancelButtonLabel: 'No, gracias',
        laterButtonLabel: 'Ahora no',
        rateButtonLabel: 'Calificar'
      },
      callbacks: {
        onRateDialogShow: (callback) => {
          console.log('rate dialog shown!');
        },
        onButtonClicked: (buttonIndex) => {
          console.log('Selected index: -> ' + buttonIndex);
        }
      }
    };
    this.appRate.promptForRating(true);
    console.log('calificar app');
  }
  logout(){
    this.logoutState = true;
    this.oneSignal.deleteTag(
        JSON.parse(localStorage.getItem('usuario')).username
    );
    localStorage.removeItem('usuario');
    localStorage.removeItem('username');

    this.oneSignal.setSubscription(false);
    this.googleMaps.removerMapa();
    // this.app.getRootNav().setRoot(LoginPage);
    this.navCtrl.navigateRoot('/login');

  }

}
