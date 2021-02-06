import { CommentComponent } from './../comment/comment.component';
import { TerritorioService } from './../../providers/territorio.service';
import { DecisionTreeService } from './../../providers/decision-tree.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { AlertController, IonSlides, Platform, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Common } from 'src/app/shared/utilidades/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { VigiaService } from 'src/app/providers/vigia.service';
import { Vigia } from '../../entities/vigia';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { DatePipe } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'cuidame-detail',
  templateUrl: './cuidame-detail.component.html',
  styleUrls: ['./cuidame-detail.component.scss'],
})
export class CuidameDetailComponent implements OnInit, OnDestroy  {

  @ViewChild('slides') slides: IonSlides;
  private commentsSubscribe: Subscription;
  private nodoSubscribe: Subscription;
  private vigia: any;

  @Input()
  private color: string;
  @Input()
  private markerID: number;
  @Input()
  private fromComponent: string;
  @Input()
  private commentS: string;

  private loading: boolean;
  private comment: Comment;
  private closeView = true;
  private numberRadicado: string;
  private autoridad: any;
  private comentarios = true;
  private prueba: any;
  private pruebaImagen: any;
  private flag = false;
  private iconoAmva = false;
  private cargoImages = false;
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


  constructor(private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private common: Common,
              private vigiaProvider: VigiaService,
              private decisionTreeProvider: DecisionTreeService,
              private theInAppBrowser: InAppBrowser,
              private clipboard: Clipboard,
              private sanitizer: DomSanitizer,
              private plt: Platform,
              private territorioProvider: TerritorioService,
              private social: SocialSharing,
              private datePipe: DatePipe,
              private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.vigiaProvider.getVigia(this.markerID, this.fromComponent).subscribe((vigia: Vigia) => {
      this.loading = false;
      this.vigia = vigia;
      this.vigiaProvider.getAutoridades().subscribe((autoridades: any) => {
        autoridades.foreach( autoridad => {
          if (autoridad.id === 1 && this.vigia.nombreAutoridadCompetente === autoridad.nombre) {
            this.iconoAmva = true;
            this.vigia.iconoAutoridad = autoridad.urlMultimedia;
          }
        });
      });
      // this.vigia.multimedias.foreach((multimedia, i) => {
      //   if (multimedia.tipoMultimedia === 'Video') {
      //     // multimedia.rutaMultimedia = this.sanitizer.bypassSecurityTrustResourceUrl(multimedia.rutaMultimedia);
      //     // multimedia.rutaMultimedia = multimedia.rutaMultimedia + '.mp4'
      //   }
      //   if (multimedia.tipoMultimedia === 'Audio') {
      //       // multimedia.rutaMultimedia = this.sanitizer.bypassSecurityTrustResourceUrl(multimedia.rutaMultimedia);
      //       // multimedia.rutaMultimedia = multimedia.rutaMultimedia + '.m4a'
      //   }
      //   if (multimedia.tipoMultimedia === 'Imagen') {
      //       this.pruebaImagen = multimedia.rutaMultimedia;
      //   }
      // });
      // this.vigia.fechaReporte = moment(this.vigia.fechaReporte).format('DD/MM/YYYY, h:mm:ss a');
      this.vigia.fechaReporte = this.datePipe.transform(this.vigia.fechaReporte, 'dd/MM/yyyy, h:mm:ss a');
      console.log('Reporte seleccionado', this.vigia);

      if (this.vigia.estado === 'RECHAZADO') {
          this.comentarios = false;
          this.color = '#B22D2C';
      }
      this.vigia.titulo = vigia.nombreRecurso;
      this.vigia.subtitulo = vigia.nombreAfectacion;
      if (this.vigia.estado === 'PENDIENTE') {
          this.color = '#808080';
          this.comentarios = false;
      }
      else {
          if (this.vigia.estado === 'OCULTO') {
              this.comentarios = false;
          }
      }
      this.commentsSubscribe =
            this.vigiaProvider.getVigiaComments(this.vigia.id).subscribe((comments: any) => {
        this.loading = false;
        let comentarios: any[] = [];
        comentarios = comments;
        comments.sort((a, b) => a.id > b.id ? -1 : 1);
        this.comment = comments[0];
      }, (error: any): void =>
      console.log(
          CuidameDetailComponent.name +
          ' getvigia error ' +
          JSON.stringify(error),
      ));
    });
  }

  ngOnDestroy(): void {
    this.commentsSubscribe.unsubscribe();
  }

  viewReport() {
    this.vigiaProvider.getUrl().subscribe((url: string) => {
      console.log('la url que se recibio', url);
      let target = '_blank';
      if (this.plt.is('ios')) {
          target = '_blank';
      }
      this.theInAppBrowser.create(url.toString(), target, this.options);
    }, error => {
      console.log(error);
      console.log(error.error.text);
      this.theInAppBrowser.create(error.error.text, '_blank', this.options);
    });
  }

  // Se abre una alerta con las isntrucciones para consultar estado del reporte
  async showState() {
    const alertOptions = {
      message:
          `Tu número de radicado es #${this.vigia.radicadoSim} y se ha copiado en el portapapeles, selecciona Ir para consultar el estado de tu reporte.`,
      cssClass: 'success sGenRep alertAv',
      buttons: [
          {
              text: 'Cancelar',
              handler: (value: any): void => {
              }
          },
          {
              text: 'Ir',
              handler: (value: any): void => {
                  this.common.appToast({ mensaje: 'El número de radicado se ha copiado en el portapapeles', duration: 2000, posicion: 'bottom' });
                  // Se copia en portapapeles el numero de radicado del reporte
                  this.clipboard.copy(this.vigia.radicadoSim.toString());
                  setTimeout(() => {
                      this.viewReport();
                  }, 1500);
              }
          },
          {
              text: '',
              cssClass: 'closeBt',
              handler: (value: any): void => {
              }
          }
      ]
    };
    const alert = await this.alertCtrl.create(alertOptions);
    await alert.present();
  }

  // Falta por implementar método: viewStoriesOrComments(): void
  getMessageForSharing(): string {
    let message = '';
    if (this.vigia.description) {message += 'Descripción: ' + this.vigia.description + '. '; }
    message += 'Descripción: ' + this.vigia.description + '.';
    this.clipboard.copy(message);
    return message;
  }

  parseJPGvigiaUrlMedia(url: string): string {
    if (url.substring(url.length - 4, url.length).toLocaleLowerCase() === '.jpg') {
        url = url.substring(0, url.length - 4);
    }
    return url;
  }

  closeModal() {
    // this.common.dismissModal();
    this.modalCtrl.dismiss();
  }

  // método para genear un nuevo comentario no implementado.
  async newComment2() {
    const modalComment = await this.modalCtrl.create({
      component: CommentComponent,
      componentProps: {
        id: this.vigia.id,
        color: this.color,
        fromComponent: 'Vigia'
      }
    });
    await modalComment.present();
  }

  newComment() {
    const navigateParamsL: NavigationExtras = {
      queryParams: {
        id: this.vigia.id,
        color: this.color,
        fromComponent: 'Vigia'
      }
    };
    this.router.navigate([`/comment`], navigateParamsL);
  }

  ionViewDidEnter() {
    if (this.commentS === 'comment') {
        this.closeView = true;
    }
}

}
