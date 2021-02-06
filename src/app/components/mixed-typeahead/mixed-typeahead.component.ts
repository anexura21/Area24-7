import { MapService } from './../../providers/map.service';
import { TerritorioService } from './../../providers/territorio.service';
import { MessageService } from './../../providers/message.service';
import { LayerService } from './../../providers/layer.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Common } from '../../shared/utilidades/common.service';
import { Suggestion } from '../../entities/suggestion';
import { GoogleGeocoderService } from '../../providers/google-geocoder.service';

@Component({
  selector: 'mixed-typeahead',
  templateUrl: './mixed-typeahead.component.html',
  styleUrls: ['./mixed-typeahead.component.scss'],
})
export class MixedTypeaheadComponent implements OnInit {

  static readonly OFFSET_PREDICTION = 3;
  static readonly OFFSET_ADDRESS = 5;
  private static amvaCenterLat = 6.273357;
  private static amvaCenterLng = -75.46679;
  private static amvaRadius = 40000;

  @Input()
  private color: string;

  @Output()
  private clickGoogleSuggestion = new EventEmitter<{ lat: number, lng: number }>();

  @Output()
  private clickApiSuggestion = new EventEmitter<number>();


  private googlePlacesSuggestions: Suggestion[];
  private suggestions: Suggestion[];
  private inputValue = '';
  private autocompleteService: google.maps.places.AutocompleteService;

  public static codificarDireccion(data: any, modo: string): Promise<any> {
      const geocoder = new google.maps.Geocoder();
      let config: any;

      const defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(6.075967, -75.633433),
        new google.maps.LatLng(6.450092, -75.323971)
      );

      if (modo === 'location') {
        config = { location: data, bounds: defaultBounds, region: 'CO' };
      } else {
        config = { address: data, bounds: defaultBounds, region: 'CO' };
      }
      return new Promise((resolve, reject) => {
        geocoder.geocode(config,  (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const dataResult = {
              latitud: results[0].geometry.location.lat(),
              longitud: results[0].geometry.location.lng(),
              descripcion: results[0].formatted_address
            };

            resolve(dataResult);
          } else {
            console.error('GmapsMovilidad:codificarDireccion-error', status);
            reject(status);
          }
        });
      });
    }
  constructor(private layerProvider: LayerService,
              private googleGeocoderProvider: GoogleGeocoderService,
              private common: Common,
              private messageProvider: MessageService,
              private territorioProvider: TerritorioService) {
                this.autocompleteService = new google.maps.places.AutocompleteService();
              }

  ngOnInit() {}

  onInputSearchChange(event: any): void {
    console.log('onInputSearchChange ' + this.inputValue);
    if (!event){
        return;
    }
    const query = event.target.value.toLowerCase();
    console.log('onInputSearchChange ' + query);
    this.inputValue = query;

    if (this.inputValue.length === 0) {
        this.inputValue = '';
        this.suggestions = [];
        this.googlePlacesSuggestions = [];
    }
    if (this.inputValue.length < MixedTypeaheadComponent.OFFSET_PREDICTION) {return; }

    if (this.common.activeLayers.level
        && this.common.activeLayers.level !== ''
        && this.common.activeLayers.ids
        && this.common.activeLayers.ids.length > 0)
    {
        this.layerProvider.getSuggestions(this.common.activeLayers.level,
                                          this.common.activeLayers.ids.toString(),
                                          this.inputValue).subscribe(
            response => {
                console.log(MixedTypeaheadComponent.name + ' onInputSearchChange getSuggestions ' + JSON.stringify(response));
                this.suggestions = Suggestion.parse(JSON.parse(JSON.stringify(response))).slice(0, 4);
                console.log('RESULTADOS', this.suggestions);
            },
            (error: any) =>
                            console.log(MixedTypeaheadComponent.name +
                                ' onInputSearchChange getSuggestions error' + JSON.stringify(error))
        );
    }
    this.getGoogleSuggestions(this.inputValue);
}

onEnter(): void {
    console.log('onEnter ' + this.inputValue);
    if (this.inputValue.length < MixedTypeaheadComponent.OFFSET_ADDRESS) {return; }

    this.googleGeocoderProvider.geocodeAddress(this.inputValue).subscribe(
        response => {
            const jsonResponse = JSON.parse(JSON.stringify(response));

            console.log('googleGeocoderProvider geocodeAddress: ' + JSON.stringify(jsonResponse));
            if (jsonResponse.status === 'OK') {
                const latLng = jsonResponse.results[0].geometry.location;
                this.territorioProvider.getInsideAmva(
                  jsonResponse.results[0].geometry.location.lat, jsonResponse.results[0].geometry.location.lat).
                                subscribe((responseInside) => {
                    if (JSON.parse(JSON.stringify(responseInside)) === true){
                        this.clickGoogleSuggestion.emit(latLng);
                        this.suggestions = [];
                        this.googlePlacesSuggestions = [];
                    }
                    else{
                        this.inputValue = '';
                        // this.common.basicAlePrtCss('Ubicación fuera del AMVA',
                        // 'La ubicación seleccionada se encuentra fuera del AMVA seleccione
                        // otra dirección.', 'warning sGenRep alertAv btnSolo', 'Aceptar');
                    }
                });
            }
            else {
                console.log(MixedTypeaheadComponent.name + ' onEnter ' + JSON.stringify(jsonResponse));
                this.messageProvider.getByNombreIdentificador('Login->google').subscribe(
                    responseMess => {
                        console.log(MixedTypeaheadComponent.name + ' onEnter getByNombreIdentificador ' + JSON.stringify(response));
                        const msg = JSON.parse(JSON.stringify(responseMess));
                        // this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                    },
                    error => console.log(MixedTypeaheadComponent.name + ' onEnter getByNombreIdentificador error ' + JSON.stringify(error))
                );
            }
        },
        (error: any) => console.log('googleGeocoderProvider geocodeAddress error ' + JSON.stringify(error))
    );
}

onBlurInputSearch(): void {
    console.log('onBlurInputSearch');
    this.suggestions = [];
    this.googlePlacesSuggestions = [];
}

onFocusInputSearch(): void {
    this.inputValue = '';
    console.log('onFocusInputSearch');
    this.onInputSearchChange(null);
}

onMouseDownGooglePlacesSuggestion(id: string): void {
    console.log('onMouseDownGooglePlacesSuggestion ');
    const request = this.googleGeocoderProvider.getDetailsRequest(id);
    const service = new google.maps.places.PlacesService(MapService.map);
    service.getDetails(request
        , (result: google.maps.places.PlaceResult, status: google.maps.places.PlacesServiceStatus): void => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('onMouseDownGooglePlacesSuggestion response ' + JSON.stringify(result));
                const latLng = result.geometry.location;
                this.clickGoogleSuggestion.emit({ lat: latLng.lat(), lng: latLng.lng() });
                // this.inputValue = "";
                this.suggestions = [];
                this.googlePlacesSuggestions = [];
            }
            else {
                // this.common.presentAcceptAlert('Ups!', 'Servicio no disponible, inténtalo más tarde.');
                console.log('onClickGooglePlacesSuggestion error ' + JSON.stringify(status));
            }
        });
}

onMouseDownApiSuggestion(suggestion: any): void {
    console.log('selecciono', suggestion);
    this.clickApiSuggestion.emit(suggestion.id);
    this.inputValue = suggestion.description;
    this.suggestions = [];
    this.googlePlacesSuggestions = [];
}

autocompletionRequest(query: any): google.maps.places.AutocompletionRequest {
    const defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(6.273357, -75.46679),
        new google.maps.LatLng(6.273357, -75.46679)
      );
    const componentRestrictions: google.maps.places.ComponentRestrictions = {
        country: 'co'
    };
    // const sessionToken = new google.maps.places.AutocompleteSessionToken();
    return {
          input: query
        , location: new google.maps.LatLng(MixedTypeaheadComponent.amvaCenterLat, MixedTypeaheadComponent.amvaCenterLng)
        , radius: MixedTypeaheadComponent.amvaRadius
        , offset: MixedTypeaheadComponent.OFFSET_PREDICTION
        , componentRestrictions
        , bounds: defaultBounds
        // , sessionToken
    };
}

getGoogleSuggestions(query: string) {
    const autocompletionRequest = this.autocompletionRequest(query);
    console.log('autocomplete', autocompletionRequest);
    this.autocompleteService.getPlacePredictions(autocompletionRequest
        , (autocompletePredictions: google.maps.places.AutocompletePrediction[],
           status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log('googleGeocoderProvider getSuggestions ' + JSON.stringify(autocompletePredictions));
            this.googlePlacesSuggestions = Suggestion.parseFromGoogleAutocomplete(autocompletePredictions).slice(0, 3);
        }
        else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // this.common.presentAcceptAlert('Ups!', 'Servicio no disponible, inténtalo más tarde.');
            console.log('onClickGooglePlacesSuggestion error ' + JSON.stringify(status));
        }
    });
}

}
