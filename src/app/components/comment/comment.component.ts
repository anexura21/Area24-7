import { ModalController } from '@ionic/angular';
import { Comment } from './../../entities/comment';
import { VigiaService } from './../../providers/vigia.service';
import { Common } from './../../shared/utilidades/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicationState } from '../../enums/publication-state';
import { AvistamientoService } from '../../providers/avistamiento.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {

  @Input()
  private color: string;

  @Input()
  private fromComponent: string;

  @Input()
  private id: number;

  private PublicationState = PublicationState;
  private state: string;
  private comments: Comment[];
  private formGroup: FormGroup;
  private isAvistamientoComment: boolean;
  private loading: boolean;
  private user: any;

  constructor(private formBuilder: FormBuilder,
              private common: Common,
              private vigiaProvider: VigiaService,
              private avistamientoProvider: AvistamientoService,
              private datePipe: DatePipe,
              private modalCtrl: ModalController) {
    this.formGroup = formBuilder.group({
        contentFormCtrl: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(255)])]
    });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario'));
    console.log(this.user);
    console.log(this.id);
    console.log(this.fromComponent);
    this.loading = true;
    if (this.id) {
      if (this.fromComponent === 'Avistamiento') {
          this.avistamientoProvider.getAvistamientoComments(this.id).subscribe(
              (comments: Comment[]): void => {
                  this.comments = comments;
                  console.log('Comentarios', comments);
                  this.comments.forEach(element => {
                      // element.creationDate = moment(element.creationDate).format('DD/MM/YYYY, h:mm:ss a');
                      element.creationDate = this.datePipe.transform(element.creationDate, 'dd/MM/yyyy, h:mm:ss a');
                  });
                  // this.comments.sort((a, b) => new Date(b.creationDate).getTime() > new Date(a.creationDate).getTime() ? 1 : -1);
                  comments.sort((a, b) => a.fechaCreacion > b.fechaCreacion ? -1 : 1);

                  this.loading = false;
              }
          );
      }
      else {
          if (this.fromComponent === 'Vigia') {
              console.log(this.fromComponent);
              const comentarios: any[] = [];
              this.vigiaProvider.getVigiaComments(this.id).subscribe(
                  (comments: any[]): void => {
                      console.log(comments);
                      comments.forEach((comment, i) => {
                          console.log('commment', comment);
                          console.log('User', this.user);
                          // comment.fechaCreacion = moment(comment.fechaCreacion).format('DD/MM/YYYY, h:mm:ss a');
                          comment.fechaCreacion = this.datePipe.transform(comment.fechaCreacion, 'dd/MM/yyyy, h:mm:ss a');
                          comment.content = comment.descripcion;
                          comment.creationDate = comment.fechaCreacion;
                          switch (comment.estado) {
                              case 'PENDIENTE':
                                  comment.publicationState = PublicationState.Pending;
                                  if (comment.idUsuario === this.user.id){
                                      comentarios.push(comment);
                                  }
                                  break;
                              case 'APROBADO':
                                  comment.publicationState = PublicationState.Published;
                                  comentarios.push(comment);
                                  break;
                              case 'RECHAZADO':
                                  break;

                              default:
                                  break;
                          }
                          if (i + 1 === comments.length) {
                              comments.sort((a, b) => a.fechaCreacion > b.fechaCreacion ? 1 : -1);
                          }
                      });
                      this.comments = comentarios;
                      this.comments.sort((a, b) => a.creationDate > b.creationDate ? 1 : -1);
                      this.loading = false;
                  }
              );
          }
      }
  }
  else {
      this.avistamientoProvider.getStoryComments(this.id).subscribe(
          (comments: Comment[]): void => {
              this.comments = comments;
              this.comments.forEach(element => {
                  element.creationDate = moment(element.creationDate).format('DD/MM/YYYY, h:mm:ss a');
              });
              this.loading = false;

          }
      );
  }
  }

  closeModal() {
      const modal = this.modalCtrl.getTop();
      console.log(modal);
      modal.then( modalX => {
        console.log(modalX);
        modalX.dismiss();
        // this.modalCtrl.dismiss();
      });
  }

}
