import { User } from './../../entities/user';
import { FUENTES_REGISTRO } from './../../shared/fuente-registro';
import { AuthenticationService } from './../../providers/authentication.service';
import { Common } from './../../shared/utilidades/common.service';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {

  formGroup: FormGroup;
  check = false;

  constructor(public navCtrl: NavController,
              public formBuilder: FormBuilder,
              public common: Common,
              public authProvider: AuthenticationService,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController) {
                this.formGroup = this.createFormGroup();
              }

  ngOnInit() {}

  enrollWithForm(): void {
    this.common.presentLoading();
    const user: User = new User();
    user.username = this.formGroup.value.username.toLowerCase();
    user.email = this.formGroup.value.email;
    user.phone = this.formGroup.value.phone;
    user.password = this.formGroup.value.matchingPasswords.password;
    user.termsConditions = this.formGroup.value.termsConditions;
    user.registrySource = FUENTES_REGISTRO.MOBILE_APP;
    this.enrollWithApi(user);
    }

    enrollWithApi(user: User): void {
        this.authProvider.enroll(user).subscribe(
            (response: any) => {
                console.log(RegistroComponent.name + ' enrollWithApi ' + JSON.stringify(response));
                this.common.dismissLoading();
                const msg = response;
                this.common.presentAcceptAlert(msg.titulo, msg.descripcion, () => this.common.dismissModal());
            },
            (error: any): void => console.log(RegistroComponent.name + ' enrollWithApi error' + JSON.stringify(error))
        );
    }

  createFormGroup(): FormGroup {
    return this.formBuilder.group({
        username: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(5),
                Validators.maxLength(255),
                Validators.pattern(/^\w*$/)
            ])
        ],
        email: [
            '',
            Validators.compose([
                Validators.required,
                Validators.pattern(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/),
                Validators.minLength(5),
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
        matchingPasswords: this.formBuilder.group({
            password: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(255)
                ])
            ],
            passwordConfirmation: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(255)
                ])
            ]
        },
        { validator: this.matchValidator }
        ),
        termsConditions: [
            null,
            Validators.requiredTrue
        ]
    });
  }

  matchValidator(ac: AbstractControl) {
      const password = ac.get('password').value;
      const passwordConfirmation = ac.get('passwordConfirmation').value;
      if (password === passwordConfirmation) {return null; }

      if (passwordConfirmation.length == 0) {ac.get('passwordConfirmation').setErrors({ matchValidator: true, required: true }); }
      else {ac.get('passwordConfirmation').setErrors({ matchValidator: true }); }
  }

  goBack() {
    this.modalCtrl.dismiss();
}

}
