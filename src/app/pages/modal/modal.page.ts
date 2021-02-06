import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Common } from '../../shared/utilidades/common.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {

  public data: any = {
    texto: ' ',
    imagen: 'assets/menu/menu.svg',
    color: ' ',
    comentarios: ' ',
};

comentarios: AngularFireList<any[]>;
msgVal  = '';
usuario: any;
comentario: any;

drawerOptions = {
  handleHeight: 50,
  thresholdFromBottom: 200,
  thresholdFromTop: 200,
  bounceBack: true
};

constructor(private navParams: NavParams,
            private db: AngularFireDatabase,
            private common: Common) {
                this.usuario = JSON.parse(localStorage.getItem('usuario'));
              }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.data = this.navParams.data;
    console.log('avistamiento seleccionado modal', this.data);
    this.comentarios = this.db.list('/24-7/comentarios/', null);
    // if(this.data.length > 0){

    document.getElementById('bar-modal').style.backgroundColor = this.data.color;
    document.getElementById('img-modal').style.borderColor = this.data.color;
    document.getElementById('img-modal').style.backgroundColor = this.data.color;
    document.getElementById('texto-modal').style.color = this.data.color; // .style.color = this.data.color;
    // }


}

closeModal() {
    this.common.dismissModal();
}

chatSend() {
  this.comentario = {descripcion: String, idUsuario: Number, fechaPublicacion: Date };
  this.comentario.descripcion = this.msgVal;
  this.comentario.idUsuario = this.usuario.id;
  this.comentario.fechaPublicacion = new Date();
  this.comentario.id = this.data.ventanaInformacion.multimedia.idEvento;

//   let respuesta = this.wsAvistamiento.registraComentario(CONFIG_ENV.REST_BASE_URL +
// "/api/comentario/" + this.data.ventanaInformacion.multimedia.idEvento, this.comentario);
  this.msgVal = '';

}


}
