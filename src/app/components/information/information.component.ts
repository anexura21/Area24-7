import { Device } from '@ionic-native/device/ngx';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { Common } from './../../shared/utilidades/common.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { InAppBrowserOptions, InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent implements OnInit {

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
  version: any;

  constructor(private common: Common,
              private appVersion: AppVersion,
              private modalCtrl: ModalController,
              private plt: Platform,
              private theInAppBrowser: InAppBrowser,
              private appAvailability: AppAvailability,
              private device: Device) {
                this.appVersion.getVersionNumber().then((numero) => {
                  this.version = numero;
                });
               }

  ngOnInit() {}

  goBack(): void {
    this.modalCtrl.dismiss();
  }


  /**
   * Funcion que abre el navegador a la URL establecida
   */
  navigate() {
    let target = '_blank';
    if (this.plt.is('ios')) {
        target = '_blank';
    }
    this.theInAppBrowser.create('https://www.metropol.gov.co/area/Paginas/Medios-de-informacion/app-area-24-7.aspx', target, this.options);
  }

  launchExternalApp(iosSchemaName: string, androidPackageName: string, appUrl: string, httpUrl: string, username: string) {
    let app: string;
    if (this.plt.is('ios') || this.device.platform === 'ios') {
        app = iosSchemaName;
    } else if (this.plt.is('android')  || this.device.platform === 'android') {
        app = androidPackageName;
    } else {
        this.theInAppBrowser.create(httpUrl + username, '_system');
        return;
    }

    this.appAvailability.check(app).then(
        () => { // success
            this.theInAppBrowser.create(appUrl + username, '_system');
        },
        () => { // error
            this.theInAppBrowser.create(httpUrl + username, '_blank');
        }
    );
  }

  openInstagram(username: string) {
      this.launchExternalApp('instagram://', 'com.instagram.android', 'instagram://user?username=', 'https://www.instagram.com/', username);
  }

  openTwitter(username: string) {
      this.launchExternalApp('twitter://', 'com.twitter.android', 'twitter://user?screen_name=', 'https://twitter.com/', username);
  }

  openFacebook(username: string) {
      if (this.plt.is('android')  || this.device.platform === 'android') {
          username = '147350028628916';
      }
      this.launchExternalApp('fb://', 'com.facebook.katana', 'fb://page/', 'https://www.facebook.com/profile.php?id=', username);
  }

}
