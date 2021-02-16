import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { ActionSheetController } from "@ionic/angular";
import { Especie } from "src/app/entities/especie";
import { EspecieSugeridaIA } from "src/app/entities/especieSugeridaIA";
import { SlideOps } from "src/app/entities/SlideOps";
import { AsombrateService } from "src/app/providers/asombrate.service";
import { LocationUpdateService } from "src/app/providers/location-update.service";

@Component({
  selector: "app-reportar-avistamiento",
  templateUrl: "./reportar-avistamiento.page.html",
  styleUrls: ["./reportar-avistamiento.page.scss"],
  providers: [AsombrateService],
})
export class ReportarAvistamientoPage {
  image: string;
  slideOps: SlideOps;
  formRegistro: FormGroup;
  idImagenes: number = 0;
  especie: Especie;
  especieSugeridaIA: EspecieSugeridaIA;
  peticionesServicios: boolean = false;

  dataImage: {
    id: number;
    url: string;
  }[] = [];

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    private asombrateService: AsombrateService,
    private locationUpdate: LocationUpdateService
  ) {
    this.construirVariables();
    this.contruirFormulario();
  }

  construirVariables() {
    this.slideOps = {
      initialSlide: 0,
      spaceBetween: 15,
      slidesPerView: 4,
    };

    this.dataImage = [
      {
        id: 1,
        url: `data:image/jpeg;base64,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`,
      },
    ];
  }

  contruirFormulario() {
    this.formRegistro = this.formBuilder.group({
      nombreComun: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
      nombreCientifico: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
      descripcion: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
    });
  }

  takePicture(pictureSourceTypeCustom: string) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 500,
      targetHeight: 500,
      sourceType:
        pictureSourceTypeCustom === "CAMERA"
          ? this.camera.PictureSourceType.CAMERA
          : this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        let image = {
          id: this.idImagenes++,
          url: `data:image/jpeg;base64,${imageData}`,
        };

        this.consultarIASugerenciaEspecie(imageData);

        if (this.dataImage.length <= 10) {
          this.dataImage.push(image);
        }
      },
      (error) => {
        console.error("takePicture", error);
      }
    );
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: "Elija el origen de la imagen",
      cssClass: "center-align-buttons",
      buttons: [
        {
          text: "Selecciona de la galería",
          handler: () => {
            this.takePicture("PHOTOLIBRARY");
          },
        },
        {
          text: "Tomar una fotografía",
          handler: () => {
            this.takePicture("CAMERA");
          },
        },
      ],
    });
    await actionSheet.present();
  }

  borrarImagen(idImagen): void {
    this.dataImage = this.dataImage.filter((elem) => elem.id !== idImagen);
    if (this.dataImage.length === 0) {
      this.borrarDatosVariables();
    }
  }

  borrarDatosVariables(): void {
    this.formRegistro.reset();
    this.especieSugeridaIA = null;
  }

  seleccionarEspecieIA(especieSeleccionada: EspecieSugeridaIA) {
    this.formRegistro
      .get("nombreComun")
      .setValue(especieSeleccionada.Imagen.NombreComun);
    this.formRegistro
      .get("nombreCientifico")
      .setValue(especieSeleccionada.Imagen.NombreCientifico);
    this.formRegistro
      .get("descripcion")
      .setValue(especieSeleccionada.Imagen.Descripcion);
  }

  consultarIASugerenciaEspecie(imageData): void {
    this.peticionesServicios = true;
    const parametrosServicio = {
      Imagenes: [
        {
          Foto: imageData,
          NombreArchivo: "",
          NombreComun: "",
          NombreCientifico: "",
          Descripcion: "",
        },
      ],
    };

    this.asombrateService
      .obtenerSugerenciaAvistamiento(parametrosServicio)
      .subscribe((response: EspecieSugeridaIA) => {
        this.especieSugeridaIA = response;
        this.peticionesServicios = false;
      });
  }

  async guardarRegistro(formulario: Especie) {
    const especieSeleccionada: Especie = {
      nombreComun: formulario.nombreComun,
      nombreCientifico: formulario.nombreCientifico,
      descripcion: formulario.descripcion,
    };

    const geoposition: {
      lat: number;
      lng: number;
    } = await this.locationUpdate.getCurrentGeoposition();

    this.dataImage.forEach((value) => {
      this.asombrateService
        .guardarReporteAvistamiento(especieSeleccionada, value, geoposition)
        .subscribe((response) => {
          console.log("guardarReporteAvistamiento", response);
          this.borrarDatosVariables();
        });
    });
  }

  publicarRegistro(formulario): void {
    console.log(formulario);
  }
}
