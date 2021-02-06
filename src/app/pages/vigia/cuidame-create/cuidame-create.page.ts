import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, IonSlides, ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Vigia } from './../../../entities/vigia';
import { Avistamiento } from './../../../entities/avistamiento';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { PictureSourceType, Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MediaObject, Media } from '@ionic-native/media/ngx';
import { VigiaService } from './../../../providers/vigia.service';
import { LocationChangeService } from './../../../providers/location-change.service';
import { Common } from './../../../shared/utilidades/common.service';
import { DecisionTreeService } from './../../../providers/decision-tree.service';
import { GoogleGeocoderService } from './../../../providers/google-geocoder.service';
import { LayerService } from './../../../providers/layer.service';
import { CaptureVideoOptions, MediaCapture, MediaFile, CaptureAudioOptions, CaptureError } from '@ionic-native/media-capture/ngx';
import { UploadService } from './../../../providers/upload.service';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { MessageService } from './../../../providers/message.service';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { CuidameSelectUbicationComponent } from './../../../components/cuidame-select-ubication/cuidame-select-ubication.component';
import { ActivatedRoute } from '@angular/router';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'cuidame-create',
  templateUrl: './cuidame-create.page.html',
})
export class CuidameCreatePage implements OnInit {

  @ViewChild('Slides') slides: IonSlides;
  private decisionTreeSubscribe: Subscription;
  private formGroup: FormGroup;

  private color: string;

  private coordenadas: any;
  private municipio: string;
  private avistamiento: Avistamiento;
  private vigia: Vigia;
  private pictureUri: any[] = [];
  private geoposition: Geoposition;
  private pictureSource: PictureSourceType;
  private address: any = {};
  private directions: any;
  private actionSheet: any;

  private vigiaLayers: {
      id: number;
      name: string;
  }[];

  // variables para captura de audio
  private recording = false;
  private filePath: string;
  private fileName: string;
  private audio: MediaObject;
  private audioList: any[] = [];

  private usoArbol = false;
  private otraEspecie = false;

  private layerId: number;

  private layer: any;

  constructor(private formBuilder: FormBuilder,
              private camera: Camera,
              private vigiaProvider: VigiaService,
              private locationChange: LocationChangeService,
              private common: Common,
              private actionSheetCtrl: ActionSheetController,
              private decisionTreeProvider: DecisionTreeService,
              private geocoder: GoogleGeocoderService,
              private layerProvider: LayerService,
              private media: Media,
              private file: File,
              private mediaCapture: MediaCapture,
              public platform: Platform,
              private _upload: UploadService,
              private imageResizer: ImageResizer,
              private videoEditor: VideoEditor,
              private messageProvider: MessageService,
              private sanitizer: DomSanitizer,
              private webView: WebView,
              private modalCtrl: ModalController,
              private router: ActivatedRoute) {
                // this.directions = new google.maps.Geocoder();
                this.router.queryParams.subscribe( params => {
                  this.color = params['color'];
                  console.log(this.color);
                  this.layerId = params['layerId'];
                });
                this.router.params.subscribe( layer => {
                  console.log(layer);
                  this.layer = layer;
                  console.log(this.layer);
                });
                // Formulario de la informacion del reporte
                this.formGroup = formBuilder.group({
                    locationFormCtrl: [
                        '',
                        Validators.compose([Validators.required])
                    ],
                    descriptionFormCtrl: [
                        '',
                        Validators.compose([Validators.minLength(3), Validators.maxLength(2000), Validators.required])
                    ],
                    vigiaTypeFormCtrl: [
                        '',
                    ]
                });
              }

  ngOnInit() {
    const geoPos = this.geoposition;
    this.multimediaOptions();
  }

  multimediaOptions() {
    if (this.pictureUri.length >= 5) {
      this.common.appToast({ mensaje: 'Ya alcanzó el límite de archivos', duration: 2000, posicion: 'bottom' });
    }
  else {
    this.presentActionSheet();
  }
  }

  async presentActionSheet() {
    console.log('Opciones');
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Elija el origen de la multimedia',
      buttons: [
          {
              text: 'Seleccionar desde galería',
              handler: () => {
                  this.pictureSource = PictureSourceType.PHOTOLIBRARY;
                  this.takePictureAndLocation();
              }
          },
          {
              text: 'Tomar una fotografía',
              handler: () => {
                  this.pictureSource = PictureSourceType.CAMERA;
                  this.takePictureAndLocation();
              }
          },
          {
              text: 'Grabar un video',
              handler: () => {
                  this.takeVideo();
              }
          },
          {
              text: 'Grabar un audio',
              handler: () => {
                  this.takeAudio();
              }
          },
      ]
    });
    return actionSheet.present();
  }

  // Tomar una fotografia o seleccionar una imagen desde la galeria
  takePictureAndLocation(): void {
    // this.common.presentLoading();
    const options: CameraOptions = {
        sourceType: this.pictureSource,
        cameraDirection: this.camera.Direction.BACK,
        correctOrientation: true,
        quality: 30,
        destinationType: this.camera.DestinationType.FILE_URI,
        // encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.ALLMEDIA,
        saveToPhotoAlbum: false,
    };
    this.camera
        .getPicture(options)
        .then(
            (pictureUri: string): void => {
                console.log('picturi', JSON.stringify(pictureUri));
                if (pictureUri.includes('mp4') || pictureUri.includes('MOV')) {
                    this.pictureUri.push({
                        url: this.webView.convertFileSrc(pictureUri),
                        tipo: 'video'
                    });
                }
                else {
                    this.pictureUri.push({
                        url: this.webView.convertFileSrc(pictureUri),
                        tipo: 'image'
                    });
                }
                setTimeout(() => {
                    this.slides.slideNext();
                }, 500);
            }
        )
        .catch(
            (reason: any): any =>
                console.log(
                    CuidameCreatePage.name +
                    ' takePicture error ' +
                    JSON.stringify(reason)
                )
        );
  }

  takeVideo() {
    if (!this.platform.is('cordova')) {
        this.common.appToast({ mensaje: 'Dispositivo no puede grabar video', posicion: 'bottom', duration: 2000 });
    } else {
        this.common.presentLoading();
        this.pictureSource = PictureSourceType.CAMERA;
        const options: CaptureVideoOptions = { limit: 0, quality: 1, duration: 15 };
        this.mediaCapture.captureVideo(options).then(
            (data: MediaFile[]) => {
                this.common.dismissLoading();
                const video = data[0];
                this.pictureUri.push({
                    tipo: 'video',
                    url: this.webView.convertFileSrc(video.fullPath),
                });
                console.log('url del video', video.fullPath);
                setTimeout(() => {
                    this.slides.slideNext();
                }, 500);
                // this.videoEditor.transcodeVideo({
                //     fileUri: normalizeURL(video.fullPath),
                //     outputFileName: 'output-name',
                //     outputFileType: this.videoEditor.OutputFileType.MPEG4,
                //     saveToLibrary: false,
                //     maintainAspectRatio: true,
                //     width: 240,
                //     height: 320,
                //     videoBitrate: 250000,
                // })
                //     .then((fileUri: string) => {
                //         this.common.dismissLoading();
                //         this.pictureUri.push({
                //             tipo: 'video',
                //             url: normalizeURL(fileUri),
                //         });
                //         setTimeout(() => {
                //             this.slides.slideNext();
                //         }, 500);
                //     })

                //     .catch((error: any) => console.log('error', error.json()));
            },
            (err: CaptureError) => {
                this.common.dismissLoading();
                console.log(JSON.stringify(err));
            }
        );
    }
  }

  // Grabar un audio
  async takeAudio() {
      if (!this.platform.is('cordova')) {
          this.common.appToast({ mensaje: 'Dispositivo no puede grabar video', posicion: 'bottom', duration: 2000 });
      } else {
          this.common.presentLoading();
          this.pictureSource = PictureSourceType.CAMERA;
          const options: CaptureAudioOptions = { limit: 1, duration: 30 };

          await this.mediaCapture.captureAudio(options).then(
              (data: MediaFile[]) => {
                  const audio: any = data[0];
                  this.common.dismissLoading();
                  this.pictureUri.push({
                      tipo: 'audio',
                      url: this.webView.convertFileSrc(audio.fullPath),
                  });
                  setTimeout(() => {
                      this.slides.slideNext();
                  }, 500);
              },
              (err: CaptureError) => {
                  this.common.dismissLoading();
                  console.log(JSON.stringify(err));
              }
          );
      }
  }

  selectLocationFromMap() {
    // Se abre modal de mapa para que el usuario seleccione ubicacion
    /* this.pictureUri.push(
        {
            tipo: 'image',
            url: 'https://app247pruebas.metropol.gov.co:9094/api/multimedia/1129582'
        },
    ) */
    console.log('Location');
    this.getModalCuidameSelect();
  }

  async getModalCuidameSelect() {
    console.log('Modal Cuidame Ubication');
    const selectLocationModal = await this.modalCtrl.create({
      component: CuidameSelectUbicationComponent,
      componentProps: { color: this.color, layerId: this.layerId }
    });
    selectLocationModal.onDidDismiss().then((address: any) => {
      console.log(address.data.direction);
      console.log(address.data.coordenadas);
      this.formGroup.controls.locationFormCtrl.setValue(address.data.direction);
      this.coordenadas = address.data.coordenadas;
    });
    return selectLocationModal.present();
  }

  identificarReporte(): void {
    // Se abre pagina que contiene el arbol de decision
    this.common.presentLoading();
    this.decisionTreeSubscribe = this.decisionTreeProvider.getTree(this.layerId).subscribe((response) => {
        console.log(response);
        this.common.dismissLoading();
        if (this.pictureUri) {
            this.pictureUri.forEach(element => {
            });
            // this.navCtrl.push(DecisionTreeVigiaComponent, {
            //     info: this.formGroup.controls,
            //     fromVigiaCreate: true,
            //     treeID: response.json().id,
            //     color: this.color,
            //     municipio: this.municipio,
            //     pictures: this.pictureUri,
            //     coordenadas: this.coordenadas,
            // });
        }
        else {
            // this.navCtrl.push(DecisionTreeVigiaComponent, {
            //     info: this.formGroup.controls,
            //     fromVigiaCreate: true,
            //     treeID: response.json()[0].id,
            //     color: this.color,
            //     municipio: this.municipio,
            //     picture: '',
            //     coordenadas: this.coordenadas,
            // });
        }
    }, (error: any): void =>
            console.log(
                CuidameCreatePage.name +
                ' identificarReporte error ' +
                JSON.stringify(error),
            ));
}

ionViewDidEnter() {
    // Si la pagina regresa con el usoArbol activo es que se debe cerrar la pagina porque ya se creo un reporte
    // if (this.navParams.get('usoArbol')) {
    //     this.navCtrl.pop();
    // }
    // this.usoArbol = this.navParams.get('usoArbol') || false;
    // this.otraEspecie = this.navParams.get('otraEspecie') || false;
}

// Eliminar un multimedia
deleteMedia(item: number) {
    this.pictureUri.splice(item, 1);
    this.slides.slidePrev();
}

}
