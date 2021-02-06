import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';

@Injectable({
  providedIn: 'root'
})
export class GoogleGeocoderService {

  private static amvaCenterLat = 6.273357;
  private static amvaCenterLng = -75.46679;
  private static amvaRadius = 40000;

  constructor(private http: HttpClient) { }

  autocompletionRequest(query: string): google.maps.places.AutocompletionRequest {
    const componentRestrictions: google.maps.places.ComponentRestrictions = {
        country: 'co'
    };
    return {
          input: query
        , location: new google.maps.LatLng(GoogleGeocoderService.amvaCenterLat, GoogleGeocoderService.amvaCenterLng)
        , radius: GoogleGeocoderService.amvaRadius
        , offset: 0
        , componentRestrictions
    };
  }

  getDetailsRequest(placeId: string): any {
    return {
        placeId,
        fields: ['geometry']
    };
  }

  getDetails(placeId: string) {
      const url = 'https://maps.googleapis.com/maps/api/place/details/json'
              + '?placeid=' + placeId
              + 'fields=geometry'
              + '&language=es'
              + '&region=co'
              + '&key=' + CONFIG_ENV.GOOGLE_MAPS_KEY;
      console.log(GoogleGeocoderService.name + ' getDetails url ' + url);
      return this.http.get(url);
  }

  geocodeAddress(address: string) {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json'
            + '?address=' + encodeURIComponent(address)
            + '&components=country:co'
            + '&language=es'
            + '&region=co'
            + '&key=' + CONFIG_ENV.GOOGLE_MAPS_KEY;
    console.log(GoogleGeocoderService.name + ' geocodeAddress url ' + url);
    return this.http.get(url);
  }

}
