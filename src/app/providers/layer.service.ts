import { MapService } from './map.service';

import { Injectable } from '@angular/core';
import { AppLayer } from '../entities/app-layer';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CONFIG_ENV } from '../shared/config-env-service/const-env';
import { Layer } from '../entities/layer';
import { APPS } from '../shared/apps';
import { InicioPage } from '../pages/inicio/inicio.page';
import { Preferences } from '../entities/preferences/preferences';
import { TransportPreferences } from '../entities/preferences/transport-preferences';
import { TransportMode } from '../entities/transport-mode';
import { AppPreferences } from '../entities/preferences/app-preferences';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { refCount, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  private static resetFusionLayer = new Subject<void>();
  static resetFusionLayer$ = LayerService.resetFusionLayer.asObservable();
  private appsChange = new BehaviorSubject<AppLayer[]>([]);
  private transportModesChange = new BehaviorSubject<TransportMode[]>([]);
  appsChange$ = this.appsChange.asObservable();
  transportModesChange$ = this.transportModesChange.asObservable();

  private currentAppChange = new BehaviorSubject<AppLayer>(
    LayerService.getNoApp()
);

currentAppChange$ = this.currentAppChange.asObservable();


  static getNoApp(): AppLayer {
    return new AppLayer({
        codigoColor: '#transparent',
        notificacion: true,
        nombre: 'Medellín',
        id: -1,
        recomendaciones: '',
        radius: 0,
        minRadius: 0,
        maxRadius: 0
    });
}

constructor(private http: HttpClient,
            private mapService: MapService,
            private oneSignal: OneSignal) { }

static emitResetFusionLayer(): void {
    LayerService.resetFusionLayer.next();
}

emitCurrentAppChange(app: AppLayer): void {
    this.currentAppChange.next(app);
}

emitAppsChange(apps: AppLayer[]): void {
  this.appsChange.next(apps);
}

emitTransportModesChange(transportModes: TransportMode[]): void {
    this.transportModesChange.next(transportModes);
}

getAppsChangeValue(): AppLayer[] {
  return this.appsChange.value;
}

getTransportModeChangeValue(): TransportMode[] {
    return this.transportModesChange.value;
}

integrateChanges(): void {
  this.getPreferences().subscribe(
      response => {
        /*  console.log(
              LayerService.name +
                   ' integrateAppsChanges getPreferences '  +
                  JSON.stringify(response)
          );*/
          const preferences: Preferences = new Preferences(response);
          this.integrateAppsChanges(preferences.appsPreferences);
          this.integrateTransportModesChanges(
              preferences.transportsPreferences
          );
      },
      (error: any): void => {
          console.log(
              LayerService.name +
                  ' integrateAppsChanges getPreferences error ' +
                  JSON.stringify(error)
          );
      }
  );
}

// Pendientes preferencias sobrecarga no permitida adicionar cambios sobre este mismo
  integrateAppsChanges(appsPreferences: AppPreferences[]) {
    console.log('integrateAppsChanges method');
    this.getMenu().subscribe(
    response => {
        // console.log('Entraaaaaaaaaaaaaaaaaaaaaaaaaaaaa ' + JSON.stringify(response));
        let apps: AppLayer[] = AppLayer.parseApps(Object.values(response));

     /*   console.log(
          LayerService.name +
              ' integrateAppsChanges getMenu ' );*/
        apps = this.mergeIncomingApps(apps);
        // apps = this.pruneInactiveApps(apps);
        apps = this.mergeAppsWithPreferences(apps, appsPreferences);
        apps = this.sortApps(apps);
        apps = this.sortLayers(apps);
        // remove holes in order after inactivating an app
        for (let i = 0; i < apps.length; i++) {apps[i].order = i + 1; }

        this.initializeNotificationsOneSignal(apps);
        this.emitAppsChange(apps);
        console.log(apps);

        const currentAppIncoming: AppLayer = apps.find(
            app => app.id === this.currentAppChange.value.id
        );
        if (currentAppIncoming) {
            this.emitCurrentAppChange(currentAppIncoming);
        }else if (this.currentAppChange.value.id !== -1) {
            InicioPage.emitGoToHome(); }
      }, (error: any): void => {
        console.log(
            LayerService.name +
                ' integrateAppsChanges getMenu error ' +
                JSON.stringify(error)
        );
    }
    );
  }

  mergeAppsWithPreferences(apps: AppLayer[], appsPreferences: any[]): AppLayer[] {
    return apps.map(
        (app: AppLayer): AppLayer => {
            const appPreferences: any = appsPreferences.find(
                (appPreferences_: any): boolean => {
                    return appPreferences_.id === app.id;
                }
            );

            if (appPreferences) {
                if (
                    app.minRadius <= appPreferences.actionRadius &&
                    appPreferences.actionRadius <= app.maxRadius
                ) {
                    app.radius = appPreferences.actionRadius;
                }
                app.order = appPreferences.order;
                app.notification = appPreferences.notification;
            }
            return app;
        }
    );
    }

    sortApps(apps: AppLayer[]): AppLayer[] {
      return apps.sort((app1: AppLayer, app2: AppLayer): number => {
          return app1.order - app2.order;
      });
  }

  sortLayers(apps: AppLayer[]): AppLayer[] {
      apps.forEach(app => {
          app.children.sort((a, b) => (a.order > b.order ? 1 : -1));
      });
      return apps;
  }

  integrateTransportModesChanges(
    transportsPreferences: TransportPreferences[]
): void {
    this.getModosTransporte().subscribe(
        response => {
            console.log(
                LayerService.name +
                    ' integrateTransportModesChanges getModosTransporte ' +
                    JSON.stringify(response)
            );

            let transportModes: TransportMode[] = TransportMode.parse(
                Object.values(response)
            );
            transportModes = this.pruneTransportModes(transportModes);
            transportModes = this.mergeTransportModesWithPreferences(
                transportModes,
                transportsPreferences
            );
            this.emitTransportModesChange(transportModes);
        },
        (error: any): void => {
            console.log(
                LayerService.name +
                    ' integrateTransportModesChanges getModosTransporte error ' +
                    JSON.stringify(error)
            );
        }
    );
}

pruneTransportModes(transportModes: TransportMode[]): TransportMode[] {
    return transportModes.filter(
        (transportMode: TransportMode): boolean => {
            return transportMode.active;
        }
    );
}

mergeTransportModesWithPreferences(
    transportModes: TransportMode[],
    transportsPreferences: TransportPreferences[]
): TransportMode[] {
    return transportModes.map(
        (transportMode: TransportMode): TransportMode => {
            const transportPreferences: TransportPreferences = transportsPreferences.find(
                (transportPreferences_: TransportPreferences): boolean => {
                    return transportPreferences_.id === transportMode.id;
                }
            );

            if (transportPreferences){
                transportMode.active = transportPreferences.active;
            }
            return transportMode;
        }
    );
}

initializeNotificationsOneSignal(apps: AppLayer[]) {
    apps.forEach(app => {
        this.setAppNotificationOneSignal(app.id, app.notification);
    });
}

setAppNotificationOneSignal(appId: number, notificationStatus: boolean) {
    switch (appId) {
        case 1:
            if (notificationStatus) {
                this.oneSignal.sendTag('Recórreme', '1');
            } else {
                this.oneSignal.deleteTag('Recórreme');
                // this.common.submenu.sMovilidad = false;
            }
            break;
        case 2:
            if (notificationStatus) {
                this.oneSignal.sendTag('Cuídame', '1');
            } else {
                this.oneSignal.deleteTag('Cuídame');
                // this.common.submenu.sMovilidad = false;
            }
            break;
        case 3:
            if (notificationStatus) {
                this.oneSignal.sendTag('Asómbrate', '1');
            } else {
                this.oneSignal.deleteTag('Asómbrate');
                // this.common.submenu.sMovilidad = false;
            }
            break;
        case 4:
            if (notificationStatus) {
                this.oneSignal.sendTag('Conóceme', '1');
            } else {
                this.oneSignal.deleteTag('Conóceme');
                // this.common.submenu.sMovilidad = false;
            }
            break;
        case 5:
            if (notificationStatus) {
                this.oneSignal.sendTag('Disfrútame', '1');
            } else {
                this.oneSignal.deleteTag('Disfrútame');
                // this.common.submenu.sMovilidad = false;
            }
            break;
        case 6:
            if (notificationStatus) {
                this.oneSignal.sendTag('Mídeme', '1');
            } else {
                this.oneSignal.deleteTag('Mídeme');
                // this.common.submenu.sMovilidad = false;
            }
            break;
    }
    console.log(
        'LayerProvider',
        'setAppNotificationOneSignal',
        'toggle state app ' + notificationStatus
    );
}

  mergeIncomingApps(newApps: AppLayer[]): AppLayer[] {
    const apps: AppLayer[] = this.appsChange.value;
    newApps = newApps.filter(app => app.id !== APPS.CONTENEDORA);
    const appsToClean: AppLayer[] = newApps.filter(
        (app: AppLayer): boolean => !app.active
    );

    appsToClean.forEach((appToClean: AppLayer): void => {
        const appIndex: number = apps.findIndex(
            (app_: AppLayer): boolean => app_.id === appToClean.id
        );

        if (appIndex !== -1) {
          // Implementación: Map Services
            // this.mapProvider.cleanApp(apps[appIndex]);
            apps.splice(appIndex, 1);
        }
    });

    const appsToMerge: AppLayer[] = newApps
        .filter((app: AppLayer): boolean => app.active)
        .map((app: AppLayer) => {
            app.children = app.children.filter(
                (layer: Layer): boolean => layer.active
            );
            return app;
        });

    appsToMerge.forEach((appToMerge: AppLayer): void => {
        const app: AppLayer = apps.find(
            (app_: AppLayer): boolean => app_.id === appToMerge.id
        );

        if (app) {
            app.color = appToMerge.color;
            app.maxRadius = appToMerge.maxRadius;
            app.minRadius = appToMerge.minRadius;
            app.name = appToMerge.name;
            app.recommendation = appToMerge.recommendation;
            app.children = this.mergeIncomingLayers(
                app.children,
                appToMerge.children
            );
            // layer has children?
        } else {
            apps.push(appToMerge);
        }
    });
    return apps;
    }

    mergeIncomingLayers(layers: Layer[], newLayers: Layer[]): Layer[] {
      const mergedLayers = new Array<Layer>();
      newLayers.forEach((newLayer: Layer) => {
          let layer: Layer = layers.find(
              (layer_: Layer): boolean => layer_.id === newLayer.id
          );

          if (layer) {
              layer.name = newLayer.name;
              layer.urlIcon = newLayer.urlIcon;
              layer.active = newLayer.active;
          } else {layer = newLayer; }

          mergedLayers.push(layer);
      });

      layers.forEach((layer: Layer) => {
          const newLayer: Layer = newLayers.find(
              (layer_: Layer): boolean => layer_.id === layer.id
          );
          if (!newLayer) {this.mapService.cleanLayer(layer); }
      });
      return mergedLayers;
    }

    getMenu() {
        const url = CONFIG_ENV.REST_BASE_URL + '/api/aplicacion/menu';
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        console.log('URL ---> ' + url);
        return this.http.get(url, { headers });
    }

    getModosTransporte() {
        const url = CONFIG_ENV.REST_BASE_URL + '/api/modosTransporte';
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        // headers.append('Content-Type', 'application/json');
        // headers.append('Authorization', localStorage.getItem('bearer'));
        return this.http.get(url, { headers });
    }

    getPreferences() {
        let username = localStorage.getItem('username');
        username = encodeURIComponent(username);
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/usuario/' +
            username +
            '/preferencias';
        // const headers = new HttpHeaders();
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        // headers.append('Content-Type', 'application/json');
        // headers.append('Authorization', localStorage.getItem('bearer'));
        return this.http.get(url, { headers });
    }

    putPreferences() {
        const apps: AppLayer[] = this.getAppsChangeValue();
        const transportModes: TransportMode[] = this.getTransportModeChangeValue();
        const preferences: Preferences = new Preferences();
        preferences.appsPreferences = AppPreferences.projectAppsToPreferences(
            apps
        );
        preferences.transportsPreferences = TransportPreferences.projectTransportModesToPreferences(
            transportModes
        );

        const username = localStorage.getItem('username');
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/usuario/' +
            username +
            '/preferencias';
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.put(url, JSON.stringify(preferences),
                             { headers });
    }

    getGeometries(layerType: string, args: any) {
        let url: string;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        console.log('tipo de layer', layerType);
        console.log('parámetros del layer', args);
        // debugger;

        switch (layerType) {
            case 'MAPA DE AGUA':
            case 'MAPA DE AIRE':
            case 'MAPA DE CLIMA':
            case 'MAPA':
                if (args.layerId === 1081) {
                    // url = CONFIG_ENV.REST_BASE_URL + "/rutas/encicla/";
                    return;
                } else {
                    url =
                        CONFIG_ENV.REST_BASE_URL +
                        '/api/contenedora/markers/' +
                        args.layerLevel +
                        '/' +
                        args.layerId;
                }

                break;

            case 'MAPA DE INVENTARIO DE FLORA':
            case 'AVISTAMIENTO':
                if (this.currentAppChange.value.id === APPS.VIGIAS) {
                    url =
                        CONFIG_ENV.REST_BASE_URL +
                        '/api/vigia/marcadoresPorIdUsuarioOEstado?estado=APROBADO';
                } else {
                    url =
                        CONFIG_ENV.REST_BASE_URL +
                        '/api/avistamiento/find/' +
                        args.layerLevel +
                        '/' +
                        args.layerId +
                        '?latitud=' +
                        args.lat +
                        '&longitud=' +
                        args.lng +
                        '&radioAccion=' +
                        args.actionRadius;
                }

                break;

            case 'MIS PUBLICACIONES':
                if (args.layerId === 263 || args.layerLevel === 'CATEGORIA') {
                    url =
                        CONFIG_ENV.REST_BASE_URL +
                        '/api/avistamiento/usuario/' +
                        JSON.parse(localStorage.getItem('usuario')).id;
                } else {
                    if (this.currentAppChange.value.id === APPS.VIGIAS) {
                        url =
                            CONFIG_ENV.REST_BASE_URL +
                            '/api/vigia/marcadoresPorIdUsuarioOEstado/' +
                            '?idUsuario=' +
                            JSON.parse(localStorage.getItem('usuario')).id;
                    }
                }
                break;

            case 'BUSQUEDA':
                url =
                    CONFIG_ENV.REST_BASE_URL +
                    '/api/avistamiento/findbyname' +
                    '?nombre=' +
                    args.name +
                    '&latitud=' +
                    args.lat +
                    '&longitud=' +
                    args.lng;
                break;
        }
        console.log('URL', url);
        return this.http.get(url, { headers });
    }

    getMarkerInfo(id: number) {
        console.log('LayerProvider getMarkerInfo id ' + id);
        const url =
            CONFIG_ENV.REST_BASE_URL + '/api/contenedora/marker-info/' + id;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.get(url, { headers });
    }

    getNLayer(level: string, idLayer: number) {
        console.log(
            'LayerProvider getNLayer level: ' + level + ', idLayer: ' + idLayer
        );
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/contenedora/capa-n' +
            '/' +
            level +
            '/' +
            idLayer;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.get(url, { headers });
    }

    search(
        latLng: { lat: number; lng: number },
        name: string
    ) {
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/avistamiento/findbyname' +
            '?nombre=' +
            name +
            '&latitud=' +
            latLng.lat +
            '&longitud=' +
            latLng.lng;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.get(url, { headers });
    }

    getAllGeometries(
        layerLevel: string,
        layerId: number
    ) {
        let url: string;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        switch (layerId) {
            case 5: // Avistamientos - Mis avistamientos
                url =
                    CONFIG_ENV.REST_BASE_URL +
                    '/api/avistamiento/usuario/' +
                    JSON.parse(localStorage.getItem('usuario')).id;
                break;

            case 185: // Avistamientos - Buscador
                url = CONFIG_ENV.REST_BASE_URL + 'api/avistamiento/';
                break;
            default:
                url =
                    CONFIG_ENV.REST_BASE_URL +
                    '/api/contenedora/markers/' +
                    layerLevel +
                    '/' +
                    layerId;
                break;
        }
        return this.http.get(url, { headers });
    }

    getSuggestions(
        level: string,
        idsLayers: string,
        query: string
    ) {
        console.log(
            'LayerProvider getSuggestions level ' +
                level +
                ' idsLayers ' +
                idsLayers +
                ' query ' +
                query
        );
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/contenedora/markers/' +
            level +
            '/' +
            idsLayers +
            '/' +
            query;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.get(url, { headers });
    }

    getGeometriesByRadius(
        layerLevel: string,
        layerId: number,
        lat: number,
        lng: number,
        actionRadius: number
    ) {
        console.log(LayerService.name + ' getGeometriesByRadius');
        const url =
            CONFIG_ENV.REST_BASE_URL +
            '/api/avistamiento/find/' +
            layerLevel +
            '/' +
            layerId +
            '?latitud=' +
            lat +
            '&longitud=' +
            lng +
            '&radioAccion=' +
            actionRadius;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('bearer')
        };
        return this.http.get(url, { headers });
    }

}
