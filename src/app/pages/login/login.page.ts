import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AlertController, Platform, ModalController, NavController, LoadingController, MenuController } from '@ionic/angular';
import { RegistroComponent } from 'src/app/components/registro/registro.component';
import { TerminosCondicionesComponent } from 'src/app/components/terminos-condiciones/terminos-condiciones.component';
import { User, PASSWORD_WILDCARD } from 'src/app/entities/user';
import { AuthenticationService } from 'src/app/providers/authentication.service';
import { GooglemapsService } from 'src/app/providers/googlemaps.service';
import { MessageService } from 'src/app/providers/message.service';
import { FUENTES_REGISTRO } from 'src/app/shared/fuente-registro';
import { Common } from 'src/app/shared/utilidades/common.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


    public img = [
        {
            imgUrl: '../../../assets/logo2.png'
        }
    ];
  static readonly MSG_FACEBOOK_NOT_AVAILABLE: string =
        'El Servicio de Facebook no se encuentra disponible.';
  static readonly MSG_GOOGLE_NOT_AVAILABLE: string =
        'El servicio de Google no se encuentra disponible';

  private FACEBOOK_PERMISSIONS: string[] = ['public_profile', 'email'];
  private formGroup: FormGroup;

  ionViewWillEnter(): void {
      this.tryAutoLogin();
  }

    constructor(
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private menu: MenuController,
        private googleMaps: GooglemapsService,
        private formBuilder: FormBuilder,
        private utilidades: Common,
        private facebook: Facebook,
        private googlePlus: GooglePlus,
        private common: Common,
        private alertCtrl: AlertController,
        private authProvider: AuthenticationService,
        private messageProvider: MessageService,
        private platform: Platform,
        private modalCtrl: ModalController,
        private router: Router
    ) {
        this.menu.enable(false);

        this.formGroup = formBuilder.group({
            username: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(5),
                    Validators.maxLength(255)
                ])
            ],
            contrasena: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(255)
                ])
            ]
        });
    }
    ngOnInit(): void {
    }

    loginWithFacebook(): void {
        this.common.presentFullLoading();
        this.facebook
            .getLoginStatus()
            .then(response => {
                console.log(LoginPage.name + ' loginWithFacebook getLoginStatus ' + JSON.stringify(response));
                switch (response.status) {
                    case 'connected':
                        this.registerWithFacebook();
                        break;
                    // case 'unknown':
                    //     this.presentAcceptAlert('facebook status unknown');
                    //     this.showDialogFacebook();
                    //     this.loading.dismiss();
                    //     break;
                    default:
                        this.facebook
                            .login(this.FACEBOOK_PERMISSIONS)
                            .then((res: FacebookLoginResponse) => {
                                console.log(LoginPage.name + ' loginWithFacebook login ' + JSON.stringify(res));
                                this.registerWithFacebook();
                            })
                            .catch(error => {
                                console.log(LoginPage.name + 'loginWithFacebook login error ' + JSON.stringify(error));
                                this.common.presentLoading();
                                this.messageProvider.getByNombreIdentificador('Login->facebook').subscribe(
                                    (response2: any): void => {
                                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador ' +
                                                    JSON.stringify(response2));
                                        const msg = response2;
                                        this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                                        this.common.dismissLoading();
                                    },
                                    (error2: any): any => {
                                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador error' + 
                                                    JSON.stringify(error2));
                                    }
                                );
                            });
                        break;
                }
            })
            .catch(error => {
                console.log(LoginPage.name + 'loginWithFacebook getLoginStatus error ' + JSON.stringify(error));
                this.common.presentLoading();
                this.messageProvider.getByNombreIdentificador('Login->facebook').subscribe(
                    (response: any): void => {
                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador ' + JSON.stringify(response));
                        const msg = response;
                        this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                        this.common.dismissLoading();
                    },
                    (error2: any): any => {
                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador error' +
                                    JSON.stringify(error2));
                    }
                );
            });
    }

    showDialogFacebook(): void {
        this.facebook.showDialog({
            method: 'login',
            href: '',
            caption: ''
        });
    }


    loginWithForm(): void {
       // this.common.presentFullLoading();
        const user: User = new User();
        user.username = this.formGroup.value.username.toLowerCase();
        user.password = this.formGroup.value.contrasena;
        user.registrySource = FUENTES_REGISTRO.MOBILE_APP;
        this.formGroup.reset();
        this.loginWithApi(user);
    }

    registerWithFacebook(): void {
        const url = '/me?fields=email,first_name,last_name,gender,locale,age_range';
        this.facebook
            .api(url, this.FACEBOOK_PERMISSIONS)
            .then(response => {
                console.log(LoginPage.name + ' registerWithFacebook ' + JSON.stringify(response));
                const user: User = User.parseFromFacebook(response);
                user.password = PASSWORD_WILDCARD;
                user.registrySource = FUENTES_REGISTRO.FACEBOOK;

                // Busca si ya esta registrado
                this.authProvider.existUser(user.email).subscribe( (response2: any) => {
                    if (JSON.parse(response2.text())) {
                        this.loginWithApi(user);
                    } else {
                        this.enrollWithApiCheckTermsConditions(user);
                    }
                });
            })
            .catch(e => {
                console.log(LoginPage.name + ' registerWithFacebook error ' + JSON.stringify(e));
                this.common.presentLoading();
                this.messageProvider.getByNombreIdentificador('Login->facebook').subscribe(
                    (response: any): void => {
                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador ' + JSON.stringify(response));
                        const msg = response;
                        this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                        this.common.dismissLoading();
                    },
                    (error: any): any => {
                        console.log(LoginPage.name + 'loginWithFacebook login error getByNombreIdentificador error' +
                                    JSON.stringify(error));
                    }
                );
            });
    }

    logoutFromFacebook(): void {
        this.facebook
            .logout()
            .then(res =>
                console.log('logoutFromFacebook ' + JSON.stringify(res))
            )
            .catch(e =>
                console.log('logoutFromFacebook error' + JSON.stringify(e))
            );
    }

    loginWithGoogle(): void {
        this.common.presentFullLoading();
        this.googlePlus
            .login({
                //  webClientId: '159728882731-c0sil7mael77eetgvnojsjfgmehbhmd4.apps.googleusercontent.com'
            })
            .then(response => {
                const user: User = User.parseFromGoogle(response);
                user.password = PASSWORD_WILDCARD;
                user.registrySource = FUENTES_REGISTRO.GOOGLE_PLUS;
                user.termsConditions = false;
                console.log('user ' + JSON.stringify(user));

                // Busca si ya esta registrado
                this.authProvider.existUser(user.email).subscribe( (response2: any) => {
                    // console.debug('-----DEBUG-----', 'existe Usuario', response2.text());

                    if (JSON.parse(response2.text())) {
                        this.loginWithApi(user);
                    } else {
                        this.enrollWithApiCheckTermsConditions(user);
                    }
                });
            })
            .catch(error => {
                console.log(LoginPage.name + ' loginWithGoogle error ' + JSON.stringify(error));
                this.common.presentLoading();
                this.messageProvider.getByNombreIdentificador('Login->google').subscribe(
                    (response: any): void => {
                        console.log(LoginPage.name + 'loginWithGoogle login error getByNombreIdentificador ' + JSON.stringify(response));
                        const msg = response;
                        this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
                        this.common.dismissLoading();
                    },
                    (error2: any): any => {
                        console.log(LoginPage.name + 'loginWithGoogle login error getByNombreIdentificador error' + JSON.stringify(error2));
                    }
                );
            });
    }

    logoutFromGoogle(): void {
        this.googlePlus
            .logout()
            .then(response =>
                console.log('logoutFromgoogle' + JSON.stringify(response))
            )
            .catch(error =>
                console.log('logoutFromgoogle error' + JSON.stringify(error))
            );
    }

    async enrollWithApiCheckTermsConditions(user: User) {
            this.common.dismissLoading();
            const modal = await this.modalCtrl.create(
                {
                    component: TerminosCondicionesComponent, // TerminosCondicionesPage
                    componentProps: {acceptButtons: true}
                });
            modal.onDidDismiss().then((aceptaTerminos: any) => {
                if (aceptaTerminos) {
                    user.termsConditions = aceptaTerminos;
                    this.enrollWithApi(user);
                }
             });
            return modal.present();
    }

    enrollWithApi(user: User): void {
        this.authProvider.enroll(user).subscribe(
            (response: any) => {
                console.log(LoginPage.name + ' enrollWithApi ' + JSON.stringify(response));
                const msg = response;
                this.common.presentAcceptAlert(msg.titulo, msg.descripcion, () => this.common.dismissModal());
                this.loginWithApi(user);
            },
            error => {
                console.log(LoginPage.name + ' enrollWithApi error ' + JSON.stringify(error));
            }
        );
    }

    loginWithApi(user: User): void {
        this.authProvider.login(user).subscribe(
            response => {
                console.log(LoginPage.name + ' loginWithApi ' + JSON.stringify(response));
                this.persistLogin(JSON.stringify(response), user.password);
                console.log('Pasó router login');
                this.router.navigate(['/inicio'])
            },
            error => {
                console.log(LoginPage.name + ' loginWithApi error ' + JSON.stringify(error));
            }
        );
    }

    persistLogin(json: string, password: string): void {
        const data = JSON.parse(json);
        localStorage.setItem('bearer', data.token);
        localStorage.setItem('username', data.usuario.username);

        console.log('response persist login' + JSON.stringify(json));

        if (json.indexOf('Bearer') > -1 && json.indexOf('usuario') > -1) {
            data.usuario.contrasena = password;
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
    }

    tryAutoLogin(): void {
        const pusuario: any = JSON.parse(localStorage.getItem('usuario'));
        if (pusuario !== null && pusuario !== undefined) {
         //   this.common.presentFullLoading();
            const user: User = new User();
            user.username = pusuario.username;
            user.password = pusuario.contrasena;
            user.registrySource = pusuario.nombreFuenteRegistro;
            this.loginWithApi(user);
        }
    }

    /*
    tryAutoLogin(): void {
        console.log('platform ' + JSON.stringify(this.platform.platforms()));
        if (this.platform.is('cordova')) {
            this.common.presentFullLoading();
            this.nativeStorage.getItem('user')
                .then((value: any): any => {
                    console.log(LoginPage.name + ' tryAutoLogin getItem ' + JSON.stringify(value));
                    if (value) {
                        let valueObject = JSON.parse(value);
                        let user: User = new User();
                        user.username = valueObject.username;
                        user.password = valueObject.contrasena;
                        user.registrySource = valueObject.nombreFuenteRegistro;
                        console.log('user ' + JSON.stringify(user));
                        this.loginWithApi(user);
                    }
                })
                .catch((reason: any): any => {
                    this.common.dismissLoading();
                    console.log(LoginPage.name + ' tryAutoLogin getItem error ' + JSON.stringify(reason));
                });
        }
        else this.tryAutoLoginNoNative();
    }*/

    async enrollWithForm() {
        const modal = await this.modalCtrl.create({
            component: RegistroComponent // RegistroPage
        });
        return modal.present();
    }

    async restorePasswordDialog() {
        const options: any  = {
            header: 'Recuperación de contraseña',
            message:
                'Ingrese su correo para recibir una nueva contraseña',
            inputs: [
                {
                    name: 'email',
                    placeholder: 'Correo',
                    type: 'email'
                }
            ],
            buttons: [
                {
                    cssClass: 'btnTxtGris',
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Enviar',
                    handler: emailObject =>
                        this.restorePassword(emailObject.email)
                }
            ]
        };
        const alert = await this.alertCtrl.create(options);
        return alert.present();
    }

    restorePassword(email: string): void {
        this.common.presentLoading();
        this.authProvider.restore(email).subscribe(
            (response: any) => {
                console.log(LoginPage.name + ' restorePassword ' + JSON.stringify(response));
                this.common.dismissLoading();
                const msg = response;
                this.common.presentAcceptAlert(msg.titulo, msg.descripcion);
            },
            (error: any) => {
                console.log(LoginPage.name + ' restorePassword error ' + JSON.stringify(error));
            }
        );
    }

    async terminosCondiciones() {
        const modal =  await this.modalCtrl.create(
            { component: TerminosCondicionesComponent // 'TerminosCondicionesPage'
        });
        return modal.present();
    }

}
