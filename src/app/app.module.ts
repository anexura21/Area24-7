import { MapaDirective } from './directives/movilidad/mapa.directive';
import { ContenidoMapaDirective } from './directives/movilidad/contenido-mapa.directive';
import { PipesModule } from './pipes/pipes.module';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { FormBuilder } from '@angular/forms';
import { DynamicControlsService } from './providers/forms/dynamic-controls.service';
import { ControlsService } from './providers/forms/controls.service';
import { ComponentsModule } from './components/components.module';
import { SideMenuPage } from './pages/side-menu/side-menu.page';
import { GlobalErrorHandlerService } from './shared/error-manager-svc/global-error-handler.service';
import { NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

// Cambio del idiomas de DatePipe
import localeES from '@angular/common/locales/es';
import { registerLocaleData, CommonModule, DatePipe } from '@angular/common';

import { IonicModule, IonicRouteStrategy, isPlatform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigEnvService } from './shared/config-env-service/config-env.service';
import { Environments } from './shared/config-env-service/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Instagram } from '@ionic-native/instagram/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { Device } from '@ionic-native/device/ngx';
import {AppRate} from '@ionic-native/app-rate/ngx';
import { environment } from '../environments/environment';



registerLocaleData(localeES);

/*
export const firebaseConfig = {
    apiKey: "AIzaSyAXXkopxvVwyY5rDNB_8ORRIW5X2_LQqK0",
    authDomain: "xgep-91621.firebaseapp.com",
    databaseURL: "https://xgep-91621.firebaseio.com",
    projectId: "xgep-91621",
    storageBucket: "xgep-91621.appspot.com",
    messagingSenderId: "406029628587"
};
*/

// QA
export const firebaseConfig = {
  apiKey: 'AIzaSyAX_sX6Nnpj1S6cJ6CTubNsQqfa3X0pCyk',
  authDomain: 'https://area-24-7-qa.firebaseio.com',
  databaseURL: 'https://area-24-7-qa.firebaseio.com',
  projectId: 'area-24-7-qa',
  storageBucket: 'area-24-7-qa.appspot.com',
  messagingSenderId: '102435221686',
};

// Prod
/* export const firebaseConfig = {
  apiKey: 'AIzaSyAAqWHUKXPUkx9sBDwKaUjZu3fNeDySknU',
  authDomain: 'https://area-24-7-40242.firebaseio.com',
  databaseURL: 'https://area-24-7-40242.firebaseio.com',
  projectId: 'area-24-7-40242',
  storageBucket: 'area-24-7-40242.appspot.com',
  messagingSenderId: '692074027754',
}; */

const getConfig = () => {
  if (isPlatform('ios')) {
    return {backButtonText: ' ' };
  }
};

@NgModule({
  declarations: [AppComponent, MapaDirective, ContenidoMapaDirective],
  entryComponents: [AppComponent],
  imports: [BrowserModule,
  IonicModule.forRoot(getConfig()),
  AppRoutingModule,
  ComponentsModule,
  CommonModule,
  HttpClientModule,
  PipesModule,
  AngularFireModule.initializeApp(firebaseConfig, 'area24-7'),
  AngularFireDatabaseModule
],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    OneSignal,
    Geolocation,
    NativeGeocoder,
    Diagnostic,
    LocationAccuracy,
    SocialSharing,
    FileTransfer,
    Clipboard,
    DatePipe,
    File,
    Instagram,
    WebView,
    ControlsService,
    DynamicControlsService,
    FormBuilder,
    VideoEditor,
    Media,
    MediaCapture,
    Camera,
    ImageResizer,
    Facebook,
    GooglePlus,
    AppVersion,
    AppAvailability,
    Device,
    AppRate,
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    // { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Cambio del DatePipe a español
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  mykey = firebaseConfig.apiKey;
  constructor() {
      ConfigEnvService.setEnvironment(Environments.AmvaQa);
  }
}
