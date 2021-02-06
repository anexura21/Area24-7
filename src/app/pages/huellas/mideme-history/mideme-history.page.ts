import { ActivatedRoute } from '@angular/router';
import { MessageService } from './../../../providers/message.service';
import { MidemeService } from './../../../providers/mideme.service';
import { UserHistory } from './../../../entities/userHistory';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mideme-history',
  templateUrl: './mideme-history.page.html',
  styleUrls: ['./mideme-history.page.scss'],
})
export class MidemeHistoryPage implements OnInit {

  color: string;
  clase = 'meh';
  nivel = 'Medio';
  valor = '150';

  historiales: any[] = [];
  titulo: any;

  history: UserHistory[] = [];
  intervals: any[] = [];

  constructor(private midemeProvider: MidemeService,
              private messageProvider: MessageService,
              private routerActual: ActivatedRoute) {
    this.routerActual.queryParams.subscribe( params => {
      console.log('Color: ', params['color']);
      this.color = params['color'];
    });
               }

  ngOnInit() {
    // Consultamos el mensaje parametrizado que ira de encabezado
    this.messageProvider.getByNombreIdentificador('Huellas->Historial').subscribe(
      (response: any): void => {
        console.log(MidemeHistoryPage.name + 'Encabezado de historia getByNombreIdentificador ' + JSON.stringify(response));
        this.titulo = response;
      },
      (error: any): any => {
        console.log(MidemeHistoryPage.name + 'Encabezado de historia ERROR getByNombreIdentificador ' + JSON.stringify(error));
      });
    this.midemeProvider.getHistoryFromService().subscribe((response: UserHistory[]) => {
      console.log('This are the history registers: ', response);

      this.history = response;

      this.history.forEach((element) => {
        if(element.descriptionLevel.length > 29){
          element.class = '1rem';
        }
        else{
          element.class = '1.6rem';
        }
        if(element.descriptionLevel.includes('bajo')){
          element.class = 'good';
        }
        else if(element.descriptionLevel.includes('medio')){
          element.class = 'meh';
        }
        else if(element.descriptionLevel.includes('alto')){
          element.class = 'bad';
        }
      });

      this.history.sort((a, b) => new Date(a.dateCreate).getTime() > new Date(a.dateCreate).getTime() ? 1 : -1);

      console.log('After update ', this.history);

    });
  }

}
