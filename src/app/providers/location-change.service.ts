import { Injectable } from '@angular/core';
import { GeolocationOptions, Geoposition, Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { Observable, Subject, Subscription } from 'rxjs';

interface SubjectSettings {
  subject: Subject<any>;
  changeDistance: number;
  changePeriod: number;
  lastUpdateTimestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationChangeService {

  private currentGeoposition: Geoposition = {
    coords: {
        accuracy: -1,
        altitude: -1,
        altitudeAccuracy: -1,
        heading: -1,
        latitude: 6.255389,
        longitude: -75.5855671,
        speed: -1
    },
    timestamp: -1
  };

  private currentLocation: { lat: number, lng: number };
  private lastUpdateTimestamp: number;
  private locationSubscription: Subscription;
  private subjectsSettings: SubjectSettings[] = [];

  constructor(private platform: Platform,
              private geolocation: Geolocation) {
              this.watchLocation_();
  }

  getGeoposition(): Geoposition { return this.currentGeoposition; }



  // todo: remove subjectSettings from array when observable unsubscribes

  getCurrentLocation(): { lat: number, lng: number } {
      return this.currentLocation;
  }

  wathLocation(changeDistance: number, changePeriod: number): Observable<{ lat: number, lng: number}> {
      const subject: Subject<{ lat: number, lng: number }> = new Subject<{ lat: number, lng: number }>();
      const subjectSettings: SubjectSettings = {
            subject,
            changeDistance,
            changePeriod,
            lastUpdateTimestamp: 0
      };
      this.subjectsSettings.push(subjectSettings);
      return subject.asObservable();
  }

  private watchLocation_(): void {
      this.locationSubscription = this.geolocation
          .watchPosition()
          .subscribe(
              (geoposition: Geoposition) => {
                  console.log('watchPosition ' + JSON.stringify(geoposition.coords));

                  this.currentGeoposition = geoposition;
                  const newLocation: { lat: number, lng: number } =
                        { lat: geoposition.coords.latitude, lng: geoposition.coords.longitude };
                  this.emitLocationChange(newLocation, geoposition.timestamp);
          },
          (error) => {
              console.log('watchPosition error' + JSON.stringify(error));
          }
      );
  }

  private emitLocationChange(latLng: { lat: number, lng: number }, newTimestamp: number): void {
      let distance: number;
      let timeElapsed: number;
      if (this.currentLocation && this.lastUpdateTimestamp) {
          const currentLocation = new google.maps.LatLng(this.currentLocation.lat, this.currentLocation.lng);
          const newLocation = new google.maps.LatLng(latLng.lat, latLng.lng);
          distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, newLocation);
          timeElapsed = newTimestamp - this.lastUpdateTimestamp;
      }
      else {
          distance = Number.MAX_VALUE;
          timeElapsed = Number.MAX_VALUE;
      }

      this.subjectsSettings.forEach((subjectSettings: SubjectSettings) => {
          if     (distance >= subjectSettings.changeDistance
              || timeElapsed >= subjectSettings.changePeriod) {
                  subjectSettings.subject.next(latLng);
              }
      });
      this.currentLocation = latLng;
      this.lastUpdateTimestamp = newTimestamp;
  }
}
