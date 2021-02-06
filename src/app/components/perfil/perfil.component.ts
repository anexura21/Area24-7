import { NavController, ModalController } from '@ionic/angular';
import { User } from './../../entities/user';
import { Common } from './../../shared/utilidades/common.service';
import { AuthenticationService } from './../../providers/authentication.service';
import { TerritorioService } from './../../providers/territorio.service';
import { Municipality } from './../../entities/municipality';
import { Department } from './../../entities/department';
import { Country } from './../../entities/country';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

    static readonly AMVA_TERRITORIES = [
        'MEDELLIN',
        'BARBOSA',
        'BELLO',
        'CALDAS',
        'COPACABANA',
        'ENVIGADO',
        'GIRARDOTA',
        'ITAGUI',
        'LA ESTRELLA',
        'SABANETA'
    ];

  @Input()
  private datos: any;

  formGroup: FormGroup;
  countries: Country[];
  departments: Department[];
  showDepartments: boolean;
  municipalities: Municipality[];
  showMunicipalities: boolean;
  birthdateValue: string;
  loading: boolean;
  currentDate: string;

  constructor(public territorioProvider: TerritorioService,
              public authProvider: AuthenticationService,
              public formBuilder: FormBuilder,
              public common: Common,
              public navCtrl: NavController,
              private modalCtrl: ModalController) {
                this.formGroup = this.createFormGroup();
                this.loading = true;
              }

  ngOnInit() {}

  ionViewWillEnter() {
    // console.log('navId from perfil ' + this.navCtrl.id);
    // let n0 = this.app.getRootNavs();
    // console.log(' getting n0 ' + (typeof(n0)));
    //
    console.log('Entró ionViewDidEnter Perfil Component');

    this.currentDate = new Date(Date.now()).toISOString();

    this.territorioProvider.getCountries().subscribe(
        (countries: Country[]) => {
            countries.sort((c1: Country, c2: Country): number => {
                return c1.name.localeCompare(c2.name);
            });
            this.countries = this.moveUpAmvaTerritories(countries, [
                'COLOMBIA'
            ]);
            this.countries[0].departments = this.moveUpAmvaTerritories(
                this.countries[0].departments,
                ['ANTIOQUIA']
            );

            this.countries[0].departments[0].municipalities = this.moveUpAmvaTerritories(
                this.countries[0].departments[0].municipalities,
                PerfilComponent.AMVA_TERRITORIES
            );

            this.authProvider.get().subscribe(
                (response: any) => {
                    this.loadDataToForm(User.parseFromApi(response));
                    this.loading = false;
                },
                error => {
                    console.log(
                        'authProvider get error' + JSON.stringify(error)
                    );
                }
            );
        },
        error => {
            console.log(PerfilComponent.name + ' ionViewDidLoad territorioProvider getCountries error ' + JSON.stringify(error));
        }
    );
  }


    minPossibleDate(): string {
        const date = new Date(Date.now());
        // console.log('date ' + JSON.stringify(date));
        return String(date.getFullYear() - 5);
    }

    goBack() {
        console.log('goBack');

        this.modalCtrl.dismiss();
    }

    update(): void {
        this.common.presentLoading();
        const user: User = this.getDataFromForm();
        this.authProvider.update(user).subscribe(
            (response: any) => {
                console.log(PerfilComponent.name + ' update ' + JSON.stringify(response));
                this.common.dismissLoading();
                const msg = response;
                this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                this.modalCtrl.dismiss();
            },
            error => {
                console.log(PerfilComponent.name + ' update error ' + JSON.stringify(error));
            }
        );
    }

    getDataFromForm(): User {
        const user: User = new User();
        user.username = this.formGroup.value.username;
        user.email = this.formGroup.value.email;
        user.phone = this.formGroup.value.phone;
        user.name = this.formGroup.value.name;
        user.surname = this.formGroup.value.surname;
        user.birthdate = new Date(this.formGroup.value.birthdate);
        user.educationLevel = this.formGroup.value.educationLevel;
        user.gender = this.formGroup.value.gender;
        user.password = JSON.parse(localStorage.getItem('usuario')).contrasena;
        user.registrySource = JSON.parse(localStorage.getItem('usuario')).nombreFuenteRegistro;
        let territory = this.formGroup.value.country;
        user.country =
            'string' === typeof territory ? territory : territory.name;
        territory = this.formGroup.value.department;
        user.department =
            'string' === typeof territory ? territory : territory.name;
        territory = this.formGroup.value.municipality;
        user.municipality =
            'string' === typeof territory ? territory : territory.name;
        return user;
    }

    moveUpAmvaTerritories(
        territories: any[],
        amvaTerritories: string[]
    ): any[] {
        const amvaTerritories_ = amvaTerritories.map((amvaTerritory: any) => {
            const index: number = territories.findIndex(
                (territory: any) => territory.name === amvaTerritory
            );
            return territories.splice(index, 1)[0];
        });
        return amvaTerritories_.concat(territories);
    }

  createFormGroup(): FormGroup {
    return this.formBuilder.group({
        username: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(255)
            ])
        ],
        phone: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(255)
            ])
        ],
        name: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(255)
            ])
        ],
        surname: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(255)
            ])
        ],
        educationLevel: ['', Validators.required],
        country: ['', Validators.compose([Validators.required])],
        department: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(255)
            ])
        ],
        municipality: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(255)
            ])
        ],
        email: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(5),
                Validators.maxLength(255)
            ])
        ],
        birthdate: ['', Validators.required],
        gender: ['', Validators.compose([Validators.required])]
    });
}

loadDataToForm(user: User): void {
    this.formGroup.get('username').setValue(user.username);
    this.formGroup.get('name').setValue(user.name);
    this.formGroup.get('surname').setValue(user.surname);
    this.formGroup.get('educationLevel').setValue(user.educationLevel);
    this.formGroup.get('email').setValue(user.email);
    this.formGroup.get('gender').setValue(user.gender);
    this.formGroup.get('phone').setValue(user.phone);

    if (user.birthdate != null) {
        this.birthdateValue = new Date(user.birthdate).toISOString();
    }

    if (user.country) {
        const country: Country = this.countries.find(
            country_ =>
                country_.name.toUpperCase() === user.country.toUpperCase()
        );
        this.formGroup.get('country').setValue(country);
        this.onCountryChanged();
    }

    if (user.department) {
        const department: Department = this.departments.find(
            department_ =>
                department_.name.toUpperCase() ===
                user.department.toUpperCase()
        );
        if (department !== undefined) {
            this.formGroup.get('department').setValue(department);
            this.onDepartmentChanged();

            const municipality: Municipality = this.municipalities.find(
                municipality_ =>
                    municipality_.name.toUpperCase() ===
                    user.municipality.toUpperCase()
            );
            this.formGroup.get('municipality').setValue(municipality);
        } else {
            this.formGroup.get('department').setValue(user.department);
            this.formGroup.get('municipality').setValue(user.municipality);
        }
    }
  }

  onCountryChanged(): void {
    const country: Country = this.formGroup.value.country;
    if (country && country.departments.length > 0) {
        this.municipalities = [];
        this.departments = country.departments;
        this.showDepartments = true;
        this.showMunicipalities = true;
    } else {
        this.formGroup.controls.department.reset();
        this.formGroup.controls.municipality.reset();
        this.municipalities = [];
        this.departments = [];
        this.showDepartments = false;
        this.showMunicipalities = false;
    }
  }

  onDepartmentChanged(): void {
      const department: Department = this.formGroup.value.department;
      if (department.municipalities.length > 0) {
          this.municipalities = department.municipalities;
      } else {
          this.municipalities = [];
      }
  }

}
