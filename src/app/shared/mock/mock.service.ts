import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockService {

  history: any[] = [];
  challenges: any[] = [];
  challengesUser: any[] = [];
  encuestas: any[] = [];
  currentChallenge: any[] = [];
  challengeForDays: any [] = [];

  defaultItem: any = {
    name: 'Burt Bear',
    profilePic: 'assets/img/speakers/bear.jpg',
    about: 'Burt is a Bear.',
  };

  constructor() {
    const history = [
      {
        fecha: '21/03/2019 4:00pm',
        nivel: '¡Bajo nivel de consumo!',
        litros: '250',
      },
      {
        fecha: '22/03/2019 3:00pm',
        nivel: '¡Medio nivel de consumo!',
        litros: '680'
      },
      {
        fecha: '23/03/2019 2:00pm',
        nivel: '¡Alto nivel de consumo!',
        litros: '740'
      },
      {
        fecha: '25/03/2019 1:00pm',
        nivel: '¡Bajo nivel de consumo!',
        litros: '560'
      },
      {
        fecha: '27/03/2019 12:00pm',
        nivel: '¡Alto nivel de consumo!',
        litros: '720'
      },
      {
        fecha: '29/03/2019 11:00pm',
        nivel: '¡Medio nivel de consumo!',
        litros: '699'
      },

    ];

    const challenges = [
      {
        categoria: 'Personal',
        retos: [
          { reto: 'Ponte una meta y cumplela los 21 días', id: 1 }
        ],
      },
      {
        categoria: 'Baño',
        retos: [
          { reto: 'Reducir tiempo de ducha', id: 2 },
          { reto: 'Cerrar la llave mientras usas jabón o shampoo', id: 3 },
          { reto: 'Cerrar la llave mientras te enjabonas las manos', id: 4 },
        ],
      },
      {
        categoria: 'Cocina',
        retos: [
          { reto: 'Cerrar la llave cuando laves los platos', id: 5, }
        ],
      },
      {
        categoria: 'Lavado de pisos',
        retos: [
          { reto: 'Reducir el número de veces que lavas en un mes', id: 6 }
        ],
      },
      {
        categoria: 'Lavado de auto',
        retos: [
          { reto: 'Reducir el número de veces que lavas en un mes', id: 7 }
        ],
      },

    ];

    const challengeForDays = [
      { id: 1, completo: 8, incompleto: 12, actual: 18 },
      { id: 2, completo: 9 },
    ];

    const encuestasUSer = [
      // { id: 61, completa: false },
      { id: 61, completa: false },
    ];

    const challengesUser = [
      { id: 1, categoria: 'Personal', activo: true },
      { id: 3, categoria: 'Baño', activo: false },
      { id: 5, categoria: 'Cocina', activo: false },
    ];

    const currentChallenge = [
      {
        cumplido: 7,
        noCumplido: 10,
        reto: [
          { id: 1, reto: 'Ponte una meta y cumplela los 21 días' }
        ],
      }
    ];

    for (const item of history) {
      this.history.push(item);
    }

    for (const item of challengeForDays) {
      this.challengeForDays.push(item);
    }

    for (const item of encuestasUSer) {
      this.encuestas.push(item);
    }

    for (const item of challengesUser) {
      this.challengesUser.push(item);
    }

    for (const item of challenges) {
      this.challenges.push(item);
    }

    for (const item of currentChallenge) {
      this.currentChallenge.push(item);
    }
  }

  queryHistory(params?: any) {
    if (!params) {
      return this.history;
    }
  }

  queryEncuestas(params?: any) {
    if (!params) {
      return this.encuestas;
    }
  }

  queryChallenge(params?: any) {
    if (!params) {
      return this.challenges;
    }
  }

  queryChallengeForDays(id: number) {
    const encontrado: any[] = [];
    this.challengeForDays.forEach((element, i) => {
      if (element.id === id){
        encontrado.push(this.challengeForDays[i]);
      }
    });

    if (encontrado.length > 0){
      return encontrado;
    }

  }



  queryChallengeByUser(params?: any) {
    if (!params) {
      return this.challengesUser;
    }
  }

  queryCurrentChallenge(params?: any) {
    if (!params) {
      return this.currentChallenge;
    }
  }

  add(item: any) {
    this.history.push(item);
  }

  cancel(item: any){
    this.challengesUser.forEach((challenge, i) => {
      if (challenge.categoria === item.categoria){
        challenge.activo = false;
      }
      if ((i + 1) === this.challengesUser.length ){
      }
    });
  }

  closeEncuesta(id: number) {
    this.encuestas.forEach(element => {
      if (element.id === id){
        element.completa = true;
      }
    });
  }


  delete(item: any) {
    this.history.splice(this.history.indexOf(item), 1);
  }
}
