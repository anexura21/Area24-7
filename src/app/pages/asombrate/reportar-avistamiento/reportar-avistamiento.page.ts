import { Component, OnInit } from "@angular/core";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";

@Component({
  selector: "app-reportar-avistamiento",
  templateUrl: "./reportar-avistamiento.page.html",
  styleUrls: ["./reportar-avistamiento.page.scss"],
})
export class ReportarAvistamientoPage implements OnInit {
  image: string;
  slideOps: any;

  data = [
    {
      url: `data:image/jpeg;base64,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`,
    },
    {
      url: `data:image/jpeg;base64,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`,
    },
    {
      url: `data:image/jpeg;base64,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`,
    },
    {
      url: `data:image/jpeg;base64,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`,
    },
    {
      url: `data:image/jpeg;base64,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`,
    },
  ];

  constructor(private camera: Camera) {}

  ngOnInit() {
    this.slideOps = {
      initialSlide: 0,
      spaceBetween: 15,
      slidesPerView: 4,
    };
  }

  takePicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.image = `data:image/jpeg;base64,${imageData}`;
      },
      (error) => {
        console.error("takePicture", error);
      }
    );
  }
}