import { EncuestaService } from './../../providers/encuesta.service';
import { DecisionTreeService } from './../../providers/decision-tree.service';
import { Component, Input, OnInit } from '@angular/core';
import { IonApp, NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { DecisionTree } from '../../entities/decision-tree';
import { DomSanitizer } from '@angular/platform-browser';
import { data } from 'jquery';

@Component({
  selector: 'decision-tree',
  templateUrl: './decision-tree.component.html',
  styleUrls: ['./decision-tree.component.scss'],
})
export class DecisionTreeComponent implements OnInit {

  @Input()
  private color: string;

  @Input()
  private treeID: number;

  @Input()
  private layerId: number;

  @Input()
  private fromAvistamientoCreate: boolean;

  private dropDown = 'Seleccione una opción';
  private listOptions: any[] = [];
  private actionSheet: any;
  private decisionTree: DecisionTree;
  private finalizeFromLeafNode = false;
  private flagDropdown: boolean;
  private rutaAlias: any[] = [];
  private imagenes: any[] = [];
  private action = false;

  constructor(private sanitizer: DomSanitizer,
              private modalCtrl: ModalController,
              private actionSheetCtrl: ActionSheetController,
              private decisionTreeProvider: DecisionTreeService,
              private encuestProvider: EncuestaService) {
    this.imagenes = [
      {
          ruta: 'http://area247-api.adacsc.co/api/multimedia/96055',
      },
      {
          ruta: 'http://area247-api.adacsc.co/api/multimedia/96055',
      },
      {
          ruta: 'http://area247-api.adacsc.co/api/multimedia/96055',
      },
      {
          ruta: 'http://area247-api.adacsc.co/api/multimedia/96055',
      }
    ];
  }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.decisionTree = new DecisionTree();
    this.decisionTreeProvider.getRoot(this.treeID).subscribe(
      response => {
        console.log(response);
        console.log(response[0]);
        this.decisionTree = new DecisionTree(response[0]);
        this.flagDropdown = this.decisionTree.flgChildrenDropdown;
        this.nextNode(this.decisionTree);
      });
  }

  ionViewCanLeave(){
    const canLeave: boolean = this.decisionTree.parent === undefined || this.finalizeFromLeafNode;

    if (!canLeave) {this.previuosNode(); }

    return canLeave;
  }

  previuosNode(): void {
    this.decisionTree = this.decisionTree.parent;
    this.flagDropdown = this.decisionTree.flgChildrenDropdown;
    this.dropDown = 'Seleccione una opción';
    this.rutaAlias.splice(1, this.rutaAlias.length - 1);
  }

  async getModalEncuesta(encuesta, desde) {
    const modal = await this.modalCtrl.create({
        component: DecisionTreeComponent,
        componentProps: {
            encuesta,
            desde
        }
    });
    await modal.present();
  }

  nextNode(decisionTree: DecisionTree): void {
    console.log('el nodo', decisionTree);
    this.rutaAlias.push(decisionTree.alias);
    this.decisionTree = decisionTree;
    if (decisionTree.tipoAdjunto === 'Formulario' && decisionTree.idFormulario != null) {
        this.encuestProvider.getEncuesta().subscribe((response: any) => {
            response.forEach((formulario) => {
                if (formulario.id === this.decisionTree.idFormulario) {
                    // const encuestaModal = this.common.createModal(EncuestaComponent, {
                    //     encuesta: formulario,
                    //     desde: 'arbol',
                    // });
                    // encuestaModal.present();
                    this.getModalEncuesta(formulario, 'arbol');
                }
            });
        });
    }
    this.flagDropdown = this.decisionTree.flgChildrenDropdown;
    if (this.decisionTree.hasChildren) {
        this.decisionTreeProvider.getChildren(decisionTree.id).subscribe(
            (response: any[]) => {
                this.decisionTree.children = DecisionTree.parse(response);
                this.decisionTree.children.forEach(children => {
                    children.listaMultimedia.forEach(multimedia => {
                        if (multimedia.tipoMultimedia.tipo === 'Video'){
                            multimedia.ruta = this.sanitizer.bypassSecurityTrustResourceUrl(multimedia.ruta);
                        }
                    });

                });
                decisionTree.children.sort((a, b) => a.order > b.order ? 1 : -1);
            },
            (error: any): void => {
                console.log(DecisionTreeComponent.name + ' nextNode getChildren error ' + JSON.stringify(error));
            });
    }
  }
  closePage() {
      this.finalizeFromLeafNode = true;
      this.modalCtrl.dismiss();
  }

  presentAction(): void {
    this.action = !this.action;
    // Si los hijos del nodo tienen 'flagHijosDropdow = true' se colocan en la lista del actionSheet
    if (this.decisionTree.flgChildrenDropdown === true) {
        this.listOptions = [];
        const listChildrens: any = this.decisionTree.children;
        listChildrens.forEach((element: any, i) => {
            this.listOptions.push({
                text: element.name,
                cssClass: 'prueba',
                handler: () => {
                    this.action = false;
                    this.dropDown = element.name;
                    element.parent = this.decisionTree;
                    this.nextNode(element);
                }
            });
            if (i === listChildrens.length - 1) {
                // this.actionSheet = this.actionSheetCtrl.create({
                //     title: 'Seleccione una opción',
                //     buttons: this.listOptions,
                //     cssClass: 'prueba',
                // });
                // this.actionSheet.present();
                // this.actionSheet.onDidDismiss((response): void => {
                //     this.action = false;
                // });
                this.presentActionSheet(this.listOptions);
                this.actionSheetCtrl.dismiss((response): void => {
                  this.action = false;
                });
            }
        });
    }
  }

  async presentActionSheet(listOptions) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccione una opción',
      cssClass: 'prueba',
      buttons: listOptions
    });
    await actionSheet.present();
  }

  isAnotherSpecies() {
    this.closeView();
    // this.navCtrl.getPrevious().data.usoArbol = true;
    // this.navCtrl.getPrevious().data.otraEspecie = true;
  }

  closeView() {
    if (this.fromAvistamientoCreate) {
        // this.navCtrl.getPrevious().data.name = this.decisionTree.name;
        // this.navCtrl.getPrevious().data.binomialNomenclature = this.decisionTree.alias;
        // this.navCtrl.getPrevious().data.description = this.decisionTree.description;
        // this.navCtrl.getPrevious().data.usoArbol = true;
        // this.navCtrl.getPrevious().data.rutaAlias = this.rutaAlias;
    }
    console.log('RUTA DEL RECORRIDO', this.rutaAlias);
    this.finalizeFromLeafNode = true;
    this.modalCtrl.dismiss();
    // this.navCtrl.pop();
}


}
