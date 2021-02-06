import { NavController, ModalController } from '@ionic/angular';
import { AuthenticationService } from './../../providers/authentication.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Common } from 'src/app/shared/utilidades/common.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {

  private formGroup: FormGroup;

  constructor(private common: Common,
              private formBuilder: FormBuilder,
              private authenticationProvider: AuthenticationService,
              private navCtrl: NavController,
              private modalCtrl: ModalController) {
                this.formGroup = this.createFormGroup();
              }

  ngOnInit() {}

  createFormGroup(): FormGroup {
    return this.formBuilder.group({
        currentPassword: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(255)
            ])
        ],
        matchingPasswords: this.formBuilder.group(
            {
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
        )
    });
  }

  matchValidator(ac: AbstractControl) {
      const password = ac.get('password').value;
      const passwordConfirmation = ac.get('passwordConfirmation').value;
      if (password === passwordConfirmation) {return null; }

      ac.get('passwordConfirmation').setErrors({ matchValidator: true });
  }

  updatePassword(): void {
      this.common.presentLoading();

      const currentPassword: string = this.formGroup.value.currentPassword;
      const newPassword: string = this.formGroup.value.matchingPasswords.password;
      const username: string = localStorage.getItem('username');
      this.authenticationProvider.updatePassword(username, currentPassword, newPassword).subscribe(
          (response: any): void => {
              console.log(UpdatePasswordComponent.name + ' updatePassword response ' + JSON.stringify(response));
              this.common.dismissLoading();
              const msg = response;
              this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
              this.formGroup.reset();
              this.modalCtrl.dismiss();
          },
          (error: any): void => {
              console.log(UpdatePasswordComponent.name + ' updatePassword error ' + JSON.stringify(error));
              this.formGroup.reset();
          }
      );
  }

  goBack(): void {
      this.modalCtrl.dismiss();
  }

}
