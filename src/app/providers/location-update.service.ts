import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Observable, Subject } from 'rxjs';
import { Common } from '../shared/utilidades/common.service';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

interface SubjectSettings {
  subject: Subject<any>;
  changeDistance: number;
  changePeriod: number;
  lastUpdateTimestamp: number;
};

@Injectable({
  providedIn: 'root'
})
export class LocationUpdateService {

  // Only for iOS
  static switchedToLocationSettings = false;

  // Only for Android
  static resultLocationDialogCanceled = false;

  // bloquea multiples requests para evitar que el plugin se bloquee
  static isRequestInProgress = false;

  private static currentGeoposition: { lat: number, lng: number, time: number };
  private static INTERVAL_CHECK_LOCATION_ENABLED = 5000;
  private static watchingLocation = false;

  private subjectsToEmit: SubjectSettings[];

  constructor(private geolocation: Geolocation,
              private locationAccuracy: LocationAccuracy,
              private diagnostic: Diagnostic,
              private common: Common,
              private platform: Platform) { 
                this.platform.ready().then(() => {
                  this.geolocation.getCurrentPosition({ maximumAge: Number.POSITIVE_INFINITY, timeout: 1000, enableHighAccuracy: false })
                      .then((value: Geoposition): any => {
                          console.log('getCurrentGeoposition constructor');
                          LocationUpdateService.currentGeoposition = this.castGeoposition(value);
                      })
                      .catch((reason: any): any => {
                          console.log('getCurrentGeoposition constructor error ' + JSON.stringify(reason));
                      });
                  }
              );
    }
    init(): void { this.checkLocationEnabled(); }

    castGeoposition(geoposition: Geoposition): { lat: number, lng: number, time: number } {
        return {
            lat: geoposition.coords.latitude,
            lng: geoposition.coords.longitude,
            time: geoposition.timestamp
        };
    }

    private checkLocationEnabled(): void {
      // this.getCurrentPosition();
       // this.watchLocation();
       setInterval(
           () => {
         //      this.displayLocationDialog_();
               this.displayLocationDialog();
           },
           LocationUpdateService.INTERVAL_CHECK_LOCATION_ENABLED
       );
   }

   private displayLocationDialog() {
    console.log(LocationUpdateService.name + ' displayLocationDialog ');
    this.diagnostic.isLocationEnabled()
        .then((locationEnabled: boolean): any => {
            console.log(LocationUpdateService.name + ' displayLocationDialog isLocationEnabled ' + JSON.stringify(locationEnabled));

            if (!locationEnabled && !LocationUpdateService.resultLocationDialogCanceled) {
                if (this.platform.is('ios')) {this.locationDialogIos(); }
                else if (this.platform.is('android')) {this.locationDialogAndroid(); }
            }

            if (locationEnabled && !LocationUpdateService.watchingLocation) { 
              LocationUpdateService.watchingLocation = true;
              this.watchLocation();
            }
        })
        .catch((reason: any): any => {
            console.log(LocationUpdateService.name + ' displayLocationDialog isLocationEnabled error' + JSON.stringify(reason));
        });
  }

  private watchLocationOptions(): GeolocationOptions {
    return {
        maximumAge: (1000 * 60),
        timeout: 1000,
        enableHighAccuracy: false
    };
  }

  private watchLocation() {
    this.geolocation
        .watchPosition(this.watchLocationOptions())
        // .filter((geoposition) => geoposition.coords !== undefined)
        .subscribe(
            (geoposition: Geoposition) => {
                console.log(LocationUpdateService.name + ' watchPosition ' + JSON.stringify(geoposition));

                const castedGeoposition: { lat: number, lng: number, time: number } = this.castGeoposition(geoposition);

                this.emitLocationUpdate(LocationUpdateService.currentGeoposition, castedGeoposition);
                LocationUpdateService.currentGeoposition = castedGeoposition;
        },
        (error) => console.log(LocationUpdateService  .name + ' watchPosition error ' + JSON.stringify(error)) 
    );
  }

  private emitLocationUpdate(currGeoposition: { lat: number, lng: number, time: number },
                             newGeoposition: {lat: number, lng: number, time: number }): void {
    if (!this.subjectsToEmit) {return; }

    this.subjectsToEmit.forEach((subjectToEmit: SubjectSettings): void => {
        const currLatLng: google.maps.LatLng = new google.maps.LatLng(
              currGeoposition.lat
            , currGeoposition.lng);
        const newLatLng: google.maps.LatLng = new google.maps.LatLng(
              newGeoposition.lat
            , newGeoposition.lng);
        const distance: number = google.maps.geometry.spherical.computeDistanceBetween(currLatLng, newLatLng);
        const time: number = newGeoposition.time - subjectToEmit.lastUpdateTimestamp;
        console.log(LocationUpdateService.name + ' emitLocationUpdate distance: ' + distance + ', time: ' + time);
        if (distance > subjectToEmit.changeDistance && time > subjectToEmit.changePeriod) {
            subjectToEmit.lastUpdateTimestamp = newGeoposition.time;
            console.log(LocationUpdateService.name + ' emitLocationUpdate distance: ' + distance + ', time: ' + time);
            subjectToEmit.subject.next({
                lat: newGeoposition.lat,
                lng: newGeoposition.lng
            });
        }
    });
  }

  private locationDialogAndroid(): void {
    console.log('locationDialogAndroid ');
    if (!LocationUpdateService.isRequestInProgress) {
        LocationUpdateService.isRequestInProgress = true;

        this.locationAccuracy.canRequest()
            .then((value: boolean) => {
                console.log(LocationUpdateService.name + ' displayLocationDialog canRequest ' + JSON.stringify(value));

                if (value) {
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_LOW_POWER)
                        .then(( val ) => {
                            console.log(LocationUpdateService.name + ' displayLocationDialog request ' + JSON.stringify(val));

                            LocationUpdateService.isRequestInProgress = false;
                        })
                        .catch((reason: any) => {
                            console.log(LocationUpdateService.name + ' displayLocationDialog request error ' + JSON.stringify(reason));

                            LocationUpdateService.isRequestInProgress = false;

                            // User chose not to make required location settings changes: "No, Gracias"
                            if (reason.code === 4) {
                              LocationUpdateService.resultLocationDialogCanceled = true;
                            }
                        });
                }
            })
            .catch((reason: any) => {
                console.log(LocationUpdateService.name + ' displayLocationDialog canRequest error ' + JSON.stringify(reason));
            });
    }
  }

  private locationDialogIos(): void {
      console.log('locationDialogIos ');
      if (!LocationUpdateService.switchedToLocationSettings) {
          this.common.presentAlert(this.alertOptions());
      }
  }

  private alertOptions(): any {
    return {
          title: ''
        , message: 'Para continuar, activa la ubicación del dispositivo, que usa el servicio de ubicación de Google'
        , buttons: [
            {
                  text: 'NO, GRACIAS'
                , handler: () => {
                  LocationUpdateService.resultLocationDialogCanceled = true;
                }
            },
            {
                  text: 'ACEPTAR'
                , handler: () => {
                  LocationUpdateService.switchedToLocationSettings = true;
                  this.diagnostic.switchToSettings();
                }
            }
        ]
    };
  }

  getObservable(changeDistance: number, changePeriod: number): Observable<{ lat: number, lng: number }> {
    if (this.subjectsToEmit) {
        const subjectSettings: SubjectSettings = this.subjectsToEmit.find(
            (subjectSettings_: SubjectSettings): boolean => {
                return subjectSettings_.changeDistance == changeDistance
                    && subjectSettings_.changePeriod == changePeriod;
        });

        if (subjectSettings) {return subjectSettings.subject.asObservable(); }
        else {
            const newSubjectSettings: SubjectSettings = {
                subject: new Subject<any>(),
                changeDistance,
                changePeriod,
                lastUpdateTimestamp: 0
            };
            this.subjectsToEmit.push(newSubjectSettings);
            return newSubjectSettings.subject.asObservable();
        }
    }
    else {
        this.subjectsToEmit = new Array();
        const subjectSettings: SubjectSettings = {
            subject: new Subject<any>(),
            changeDistance,
            changePeriod,
            lastUpdateTimestamp: 0
        };
        this.subjectsToEmit.push(subjectSettings);
        return subjectSettings.subject.asObservable();
    }
  }


  private getCurrentPosition(): void {
   this.geolocation
       .getCurrentPosition()
       .then((geoposition: Geoposition): any => {
           console.log('entro en getCurrentPosition', JSON.stringify(geoposition))
           LocationUpdateService.currentGeoposition = this.castGeoposition(geoposition);
           console.log(LocationUpdateService.name + ' getCurrentPosition ' + JSON.stringify(geoposition));
       })
       .catch((reason: any): any => {
           console.log(LocationUpdateService.name + ' getCurrentPosition error ' + JSON.stringify(reason));
       });
}

getCurrentGeoposition(): { lat: number, lng: number, time: number } | Promise<{ lat: number, lng: number, time: number}> { 
   if (LocationUpdateService.currentGeoposition) {return LocationUpdateService.currentGeoposition; }
   else {
       this.geolocation.getCurrentPosition()
            .then((value: Geoposition): any => {
                console.log('getCurrentGeoposition ');
                LocationUpdateService.currentGeoposition = this.castGeoposition(value);
                return LocationUpdateService.currentGeoposition;
            })
            .catch((reason: any): any => {
                console.log('getCurrentGeoposition error ' + JSON.stringify(reason));
            });
   }
}

}
