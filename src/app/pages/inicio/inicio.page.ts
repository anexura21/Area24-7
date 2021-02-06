import {TerritorioService} from './../../providers/territorio.service';
import {GooglemapsService} from './../../providers/googlemaps.service';
import {MapService} from './../../providers/map.service';
import {SideMenuPage} from './../side-menu/side-menu.page';
import {AuthenticationService} from './../../providers/authentication.service';
import {Common} from './../../shared/utilidades/common.service';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LayerService} from '../../providers/layer.service';
import {Subject, Observable, Subscription} from 'rxjs';
import {AppLayer} from '../../entities/app-layer';
import {MenuController, NavController} from '@ionic/angular';
import {FUENTES_REGISTRO} from '../../shared/fuente-registro';
import {User} from '../../entities/user';
import {OneSignal, OSNotification} from '@ionic-native/onesignal/ngx';
import {AngularFireList, AngularFireDatabase} from 'angularfire2/database';
import {Municipality} from '../../entities/municipality';
import {FusionLayerComponent} from '../../components/fusion-layer/fusion-layer.component';
import {AsombratePage} from '../asombrate/asombrate.page';


@Component({
    selector: 'inicio',
    templateUrl: './inicio.page.html',
    styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, OnDestroy {

    public images = [
        {
            id: '1',
            title: 'Asómbrate',
            imageUrl: '../../../assets/icono-asombrate.png',
            border: 'colorAsombrate'
        },
        {
            id: '2',
            title: 'Muévete',
            imageUrl: '../../../assets/icono-muevete.png',
            border: 'colorMuevete'
        },
        {
            id: '3',
            title: 'Conoce',
            imageUrl: '../../../assets/icono-conoce.png',
            border: 'colorConoce'
        }
    ];
    public imagesSecondRow = [
        {
            id: '4',
            title: 'Mídete',
            imageUrl: '../../../assets/icono-midete.png',
            border: 'colorMidete'
        },
        {
            id: '5',
            title: 'Cuídame',
            imageUrl: '../../../assets/icono-cuidamee.png',
            border: 'colorCuidame'
        },
        {
            id: '6',
            title: 'SIATA',
            imageUrl: '../../../assets/icono-siata.png',
            border: 'colorSiata'
        }
    ];

    static municipalities: Municipality[];

    private static goToHome: Subject<void> = new Subject<void>();

    static goToHome$: Observable<void> = InicioPage.goToHome.asObservable();

    static readonly MIN_ZOOM = 9;
    static readonly MAX_ZOOM = 21;
    static readonly LOCATION_UPDATES_INTERVAL = 60000;
    static readonly DISTANCE_TOLERANCE = 0;


    private timerId: any;
    private alto: string;

    private apps: AppLayer[];
    private insideAmva = true;
    private firebaseItemsChange: AngularFireList<any[]>;
    private zoom = 9;
    private locationSubscription: Subscription;
    private positionSubscription: Subscription;
    private locationUpdateSubscription: Subscription;
    private flagMapInitiated = false;
    private currentApp: AppLayer; // TODO: currentApp is needed (html)
    // ODO: do not assign anithing to current app, just subscribe to the current app changes
    private defaultApp = {
        color: '#96c93d',
        name: 'Área 24/7'
    };
    watch: any;
    drawerOptions: any;

    static emitGoToHome(): void {
        InicioPage.goToHome.next();
    }

    /**
     * Se implementará autenticación temporal sin page de login
     * luego se trasladará al login lo importante es poder obtener
     * el token y utilizarlo en el resto de la aplicación
     */

    constructor(private menu: MenuController,
                private layerService: LayerService,
                private common: Common,
                private authService: AuthenticationService,
                private oneSignal: OneSignal,
                private angularFireDatabase: AngularFireDatabase,
                private mapService: MapService,
                private googleMapsService: GooglemapsService,
                private territorioService: TerritorioService,
                public nav: NavController) {
        this.loginTempo();
        this.firebaseSetup();
        this.drawerOptions = {
            handleHeight: 20,
            thresholdFromBottom: 200,
            thresholdFromTop: 200,
            bounceBack: true
        };
    }

    firebaseSetup() {
        this.firebaseItemsChange = this.angularFireDatabase.list('/');
        this.firebaseItemsChange.valueChanges().subscribe((change) => {
                console.log('FirebaseSetup valueChanges ' + JSON.stringify(change));
                this.layerService.integrateChanges();
            },
            (error: any) => {
                console.log('FirebaseSetup valueChanges error ' + JSON.stringify(error));
            }
        );
    }

    loginTempo() {
        const user: User = new User();
        user.username = 'alandres7';
        user.password = 'cristian';
        user.registrySource = FUENTES_REGISTRO.MOBILE_APP;
        this.authService.login(user).subscribe(response => {
//            console.log(InicioPage.name + ' loginWithApi ' + JSON.stringify(response));
            const json = JSON.stringify(response);
            const data = JSON.parse(json);
            localStorage.setItem('bearer', data.token);
            localStorage.setItem('username', data.usuario.username);
            // console.log('response persist login' + JSON.stringify(json));
            if (json.indexOf('Bearer') > -1 && json.indexOf('usuario') > -1) {
                data.usuario.contrasena = user.password;
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }
        });
    }

    absolute(): string {
        if (
            this.common.submenu.sEntorno ||
            this.common.submenu.sHuellas ||
            this.common.submenu.sVigias ||
            this.common.submenu.sAvistamientos ||
            this.common.submenu.sMovilidad ||
            this.common.submenu.sOrdenamiento ||
            this.common.submenu.sEcociudadanos
        ) {
            return 'initial anim';
        } else {
            return 'absolute';
        }
    }

    ngOnInit() {
        console.log('ngOnInit - Inicio page component...');
        this.layerService.currentAppChange$.subscribe((app: AppLayer): void => {
            this.currentApp = app;
        });

        this.layerService.appsChange$.subscribe((tree: AppLayer[]) => {
            // console.log('treeChanged');
            this.apps = tree;
           // console.log('aplicaciones', this.apps);
            if (this.apps.length <= 3) {
                this.alto = '';
            } else {
                this.alto = 'calc(100vh - 54px)';
            }

            // this.common.dismissLoading();
        });

        this.layerService.currentAppChange$.subscribe((app: AppLayer): void => {
            this.currentApp = app;
            // console.log('current app changed ' + JSON.stringify(app));
        });

        InicioPage.goToHome$.subscribe((): void => {
            this.onClickHome();
        });
    }

    ngOnDestroy(): void {
        this.locationUpdateSubscription.unsubscribe();
        //  this.turnOffLocationUpdates();
        this.watch = undefined;
        this.googleMapsService.removerMapa();
    }

    onClickHome(): void {
        if (this.currentApp.children) {
            this.currentApp.children.forEach(child => {
                if (child.active) {
                    child.active = false;
                }
            });

            this.common.submenu.sMovilidad = false;
            this.common.submenu.sVigias = false;
            this.common.submenu.sAvistamientos = false;
            this.common.submenu.sOrdenamiento = false;
            this.common.submenu.sEntorno = false;
            this.common.submenu.sHuellas = false;
            this.common.submenu.sInformate = false;
            this.common.submenu.sEcociudadanos = false;
            this.common.submenu.sEmprendedores = false;

            FusionLayerComponent.emitDeleteAllMarkers();
        }
        this.layerService.emitCurrentAppChange(LayerService.getNoApp());
    }

    parseRecomendaciones(recomendaciones: string) {
        return recomendaciones.split(', ');
    }

    toCapitalCaseLetter(str: string): string {
        if (!str || str.length === 0) {
            return str;
        } else {
            return str[0].toUpperCase() + str.substring(1).toLowerCase();
        }
    }

    public getApp(appId: number): AppLayer {
        appId = Number(appId);
        return this.apps.find((app: AppLayer) => appId === app.id);
    }

    reorderApps(indexes): void {
        const from = indexes.detail.from;
        const to = indexes.detail.to;
        const appFrom = this.apps[from];
        const appTo: AppLayer = this.apps[to];

        appFrom.order = appTo.order;

        // Reordenamiento de arriba-abajo
        if (from < to) {
            for (let i = from + 1; i <= to; i++) {
                this.apps[i].order -= 1;
            }
        } else {
            // Reordenamiento de abajo-arriba
            for (let i = from - 1; i >= to; i--) {
                this.apps[i].order += 1;
            }
        }

        this.apps = this.layerService.sortApps(this.apps);
        console.log('Aplicaciones:');
        console.log(this.apps);

        this.layerService.emitAppsChange(this.apps);
        this.layerService.putPreferences().subscribe(
            response => {
                console.log(SideMenuPage.name + ' onCloseMenu putPreferences ' + JSON.stringify(response));
            },
            (error: any): any => {
                alert(SideMenuPage.name + ' onCloseMenu putPreferences error ' + JSON.stringify(error));
            }
        );
        indexes.detail.complete();
    }

    swtAplicacion(key) {
        console.log(key);
        switch (key) {
            case 1:
                this.common.submenu.sMovilidad = true;
                break;
            case 2:
                this.common.submenu.sVigias = true;
                break;
            case 3:
                this.common.submenu.sAvistamientos = true;
                break;
            case 4:
                this.common.submenu.sOrdenamiento = true;
                break;
            case 5:
                this.common.submenu.sEntorno = true;
                // this.menu.swipeEnable(false);
                // TODO: disable menu gesture
                break;
            case 6:
                this.common.submenu.sHuellas = true;
                break;
            case 8:
                this.common.submenu.sInformate = true;
                break;
            case 9:
                this.common.submenu.sEcociudadanos = true;
                break;
            case 10:
                this.common.submenu.sEmprendedores = true;
            /* default:
                 break; */
        }
        // this.accessUserProvider.createAccess( key );
        const appToGo: AppLayer = this.apps.find(app => app.id === key);
        console.log(appToGo);
        this.layerService.emitCurrentAppChange(appToGo);
    }

    switchNotification(app: AppLayer) {
        app.notification = !app.notification;
        this.layerService.setAppNotificationOneSignal(app.id, app.notification);
        this.layerService.putPreferences().subscribe(
            response => {
                console.log(SideMenuPage.name + ' onCloseMenu putPreferences ' + JSON.stringify(response));
            },
            error => {
                console.log(SideMenuPage.name + ' onCloseMenu putPreferences error ' + JSON.stringify(error));
            }
        );
    }

    ionViewWillEnter() {
        this.ionViewDidLoad();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad');

        this.initMap();

        this.subscribeToZoomChanges();

        this.territorioService.getAmvaMunicipalities().then(
            (municipalities: Municipality[]): void => {
                console.log(municipalities);
                InicioPage.municipalities = municipalities;
                this.loadMunicipalitiesToMap();
            },
            (error: any): void =>
                console.log(InicioPage.name + ' ngOnInit getAmvaMunicipalities error ' + JSON.stringify(error))
        );

        this.setOneSignalUserTag();
    }

    subscribeToZoomChanges(): void {
        this.googleMapsService.zoomChanged$.subscribe((zoom: number) => {
            this.zoom = zoom;
            console.log('zoomChanged$: ' + zoom);
        });
    }

    initMap(): void {
        this.mapService.initMap();
        MapService.map = this.mapService.getMap();
        this.setZoomListener();
    }

    setOneSignalUserTag(): void {
        this.oneSignal.setSubscription(true);
        this.oneSignal.sendTag('Personal', JSON.parse(localStorage.getItem('usuario')).username);
    }

    setZoomListener(): void {
        MapService.map.addListener('zoom_changed', () => {
            console.log('zoom_changed fired');
            this.googleMapsService.emitZoomChange(MapService.map.getZoom());
        });
    }

    loadMunicipalitiesToMap(): void {
        InicioPage.municipalities.forEach(
            (municipality: Municipality): void => {
                const decoded = google.maps.geometry.encoding.decodePath(
                    municipality.polygonLineStr
                );
                const paths = decoded.map(item => {
                    return {lat: item.lat(), lng: item.lng()};
                });
                const polygon = new google.maps.Polygon({
                    paths,
                    map: MapService.map,
                    fillColor: '#D9EBB8',
                    strokeColor: '#96C93D'
                });
            }
        );
    }
}
