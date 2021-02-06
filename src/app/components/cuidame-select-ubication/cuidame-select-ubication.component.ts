import { ModalController } from '@ionic/angular';
import { MessageService } from './../../providers/message.service';
import { TerritorioService } from './../../providers/territorio.service';
import { LocationChangeService } from './../../providers/location-change.service';
import { DecisionTreeService } from './../../providers/decision-tree.service';
import { VigiaService } from './../../providers/vigia.service';
import { GoogleGeocoderService } from './../../providers/google-geocoder.service';
import { Component, Input, OnInit } from '@angular/core';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { Common } from '../../shared/utilidades/common.service';
import { Vigia } from './../../entities/vigia';
import { CuidameDetailComponent } from '../cuidame-detail/cuidame-detail.component';
import { MapSelectLocationComponent } from '../map-select-location/map-select-location.component';

@Component({
  selector: 'cuidame-select-ubication',
  templateUrl: './cuidame-select-ubication.component.html',
  styleUrls: ['./cuidame-select-ubication.component.scss'],
})
export class CuidameSelectUbicationComponent implements OnInit {


  @Input()
  private color: string;
  @Input()
  private layerId: number;
  private loading = true;
  private getqry: Subscription;
  private currentPage = 5;
  private showMore = false;
  private geoposition: Geoposition;
  private address: any = {};
  private directions: any;
  private reports: any[] = [];

  constructor(private common: Common,
              private geocoder: GoogleGeocoderService,
              private vigiaProvider: VigiaService,
              private decisionTreeProvider: DecisionTreeService,
              private locationChange: LocationChangeService,
              private territorioProvider: TerritorioService,
              private messageProvider: MessageService,
              private modalCtrl: ModalController) {
                console.log('Entro a seleccionar location');
                // Variable que controlara la ubicacion
                this.directions = new google.maps.Geocoder();
              }

  ngOnInit() {
    this.address.direction = '';
    // Consultamos la ubicacion del usuario
    this.geoposition = this.locationChange.getGeoposition();
    const locationStr: string = this.geoposition.coords.latitude + ', ' + this.geoposition.coords.longitude;
    this.directions.geocode({lat: this.geoposition.coords.latitude, lng: this.geoposition.coords.longitude},
    (results: any) => {
        // Consultamos que la ubicacion que se selecciono esta dentro o fuera del AMVA
        this.territorioProvider.getInsideAmva(this.geoposition.coords.latitude, this.geoposition.coords.longitude).subscribe((response) => {
            if (response === true) {
                this.address.direction = results[0].formatted_address;
                this.address.coordenadas = { lat: this.geoposition.coords.latitude, lng: this.geoposition.coords.longitude };
                this.getListReports();
            }
            else {
                this.loading = false;
                // Consultamos el mensaje cuando la ubicacion esta fuera del Amva
                this.messageProvider.getByNombreIdentificador('Ubicacion->FueraDelAmva').subscribe(
                    (response2: any): void => {
                        console.log(CuidameSelectUbicationComponent.name + 'Ubicacion->FueraDelAmva' + JSON.stringify(response2));
                        this.common.basicAlePrtCss(response2.titulo, response2.descripcion, 'sGenRep alertAv btnSolo', 'Aceptar');
                    },
                    (error: any): any => {
                        console.log(CuidameSelectUbicationComponent.name +
                                    'Encabezado de historia ERROR getByNombreIdentificador ' +
                                    JSON.stringify(error));
                    });
                this.address.direction = '';
                // this.getListReports();
            }
        },
            error => console.log(CuidameSelectUbicationComponent.name + ' ngOnInit getInsideAmva error ' + JSON.stringify(error)));
    });
  }

  async selectLocationFromMap() {
    // Se abre modal de mapa para que el usuario seleccione la ubicacion
    console.log('Ubication...');
    const mapSelectLocationModal =
        await this.modalCtrl.create({component: MapSelectLocationComponent,
                                     componentProps: { desde: 'Vigia',
                                    color: this.color
                                    },
                                     cssClass: 'mapaUbicacion'});
                                    //  {geoposition: Geoposition, role: string}
    mapSelectLocationModal.onDidDismiss().then((ubicacion: any) => {
        if (ubicacion.role === 'OK') {
            this.geoposition = ubicacion.data;
            const locationStr: any = {
                lat: this.geoposition.coords.latitude,
                lng: this.geoposition.coords.longitude
            };
            // Consultamos que la ubicacion que se selecciono esta dentro o fuera del AMVA
            this.territorioProvider.getInsideAmva(this.geoposition.coords.latitude, this.geoposition.coords.longitude)
                .subscribe((response) => {
                if (response === true) {
                    this.common.presentLoading();
                    this.directions.geocode( {location : { lat: this.geoposition.coords.latitude, lng: this.geoposition.coords.longitude }},
                         (results: any) => {
                              this.address.direction = results[0].formatted_address;
                              this.address.coordenadas = locationStr;
                              this.getListReports();
                              setTimeout(() => {
                                  this.common.dismissLoading();
                              }, 1000);
                          });
                }
                else {
                    // Consultamos el mensaje cuando la ubicacion esta fuera del Amva
                    this.messageProvider.getByNombreIdentificador('Ubicacion->FueraDelAmva').subscribe(
                        (response2: any): void => {
                            console.log(CuidameSelectUbicationComponent.name + 'Ubicacion->FueraDelAmva' + JSON.stringify(response2));
                            this.common.basicAlePrtCss(response2.titulo, response2.descripcion, 'sGenRep alertAv btnSolo', 'Aceptar');
                        },
                        (error: any): any => {
                            console.log(CuidameSelectUbicationComponent.name +
                                        'Encabezado de historia ERROR getByNombreIdentificador ' +
                                        JSON.stringify(error));
                        });
                    this.address.direction = '';
                }
            },
                error => console.log(CuidameSelectUbicationComponent.name +
                                      ' selectLocationFromMap getInsideAmva error ' +
                                      JSON.stringify(error)));
        }
    });
    await mapSelectLocationModal.present();
}
closeModal() {
    // this.common.dismissModal(this.address);
    this.modalCtrl.dismiss(this.address);
}

generateReport() {
    // Se cierra el modal y se envia el objeto con la direccion que selecciono el usuario
    // this.common.dismissModal(this.address);
    console.log(this.address);
    this.modalCtrl.dismiss(this.address);
}

// Abre modal con informacion del reporte seleccionado
async viewReport(item: Vigia) {
    const detailsModal = await this.modalCtrl.create({component: CuidameDetailComponent,
       componentProps: {
        markerId: item.id,
        color: this.color,
        from: 'select'
    }});
    await detailsModal.present();
}

getListReports() {
    this.reports = [];
    this.showMore = false;
    let idCapa: number;
    this.vigiaProvider.getAvistamientoLayers().subscribe((response: any) => {
        idCapa = response[0].id;
        // Se cargan todos los reportes que esten cerca de la ubicacion del usuario
        this.vigiaProvider.getReports(this.address.coordenadas, idCapa).subscribe((response2: any) => {
            console.log(CuidameSelectUbicationComponent.name + 'Reportes a 500 metros' + JSON.stringify(response2));
            let list: any[] = [];
            this.loading = true;
            if (response2.markersPoint) {
                list = response2.markersPoint;
            }
            else {
                list = response2;
            }
            if (list.length === 0) {
                this.loading = false;
            }
            list.forEach((report, i) => {
                this.vigiaProvider.getVigia(report.idMarker, 'marker').subscribe((vigia: any) => {
                    if (vigia.estado !== 'PENDIENTE' && vigia.estado !== 'RECHAZADO') {
                        this.reports.push(vigia);
                    }
                    if (i + 1 === list.length) {
                        this.loading = false;
                        // Ordenamos los reportes de manera cronologica (por fecha)
                        this.reports.sort((a, b) => a.fechaReporte > b.fechaReporte ? -1 : 1);
                        // Si hay mas de 5 reportes activara la opcion de ver mas
                        if (this.reports.length > 5) {
                            this.showMore = true;
                        }
                    }
                });
            });
        },
            (err: any) => {
                this.loading = false;
                console.log(JSON.stringify(err));
            }
        );
    });
  }

// Despliega 5 reportes mas en la lista de sugerencias
  viewMore() {
    this.loading = true;
    setTimeout(() => {
        this.loading = false;
        this.currentPage = this.currentPage + 5;
        if (this.currentPage >= this.reports.length) {
            this.showMore = false;
        }
    }, 500);
  }

}
