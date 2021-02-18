import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { data } from "jquery";
import { from, Observable, Observer } from "rxjs";
import { map, timeout } from "rxjs/operators";
import { Especie } from "../entities/especie";
import { EspecieSugeridaIA } from "../entities/especieSugeridaIA";
import { CONFIG_ENV } from "../shared/config-env-service/const-env";
import {
  FileTransfer,
  FileTransferObject,
  FileUploadOptions,
  FileUploadResult,
} from "@ionic-native/file-transfer/ngx";

@Injectable({
  providedIn: "root",
})
export class AsombrateService {
  private fileTransferObject: FileTransferObject;

  constructor(private http: HttpClient, private fileTransfer: FileTransfer) {
    this.fileTransferObject = this.fileTransfer.create();
  }

  obtenerSugerenciaAvistamiento(objetoImagen): Observable<any> {
    const url = `https://webservices.metropol.gov.co/SIMAPI2/api/Asombrate/ObtenerSugerencia`;

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type",
    });
    return this.http.post(url, objetoImagen, { headers }).pipe(
      map((response: EspecieSugeridaIA) => {
        return response;
      })
    );
  }

  guardarReporteAvistamiento(
    especieReportada: Especie,
    foto: { id: number; url: string },
    geoposition: {
      lat: any;
      lng: any;
    }
  ) {
    const url = CONFIG_ENV.REST_BASE_URL + "/api/avistamiento";
    const bearer = localStorage.getItem("bearer");
    const imageBlob = this.dataURItoBlob(foto?.url.split(",")[1]);
    const reader = new FileReader();

    reader.onload = () => {
      const formData = new FormData();
      const imageName = "avistamiento.png";
      const imgBlob = new Blob([reader.result], { type: "image/png" });
      formData.append("multimedia", imgBlob, imageName);

      const headers = new HttpHeaders({
        //"Content-Type": "application/json",
        //"Content-Type": "multipart/form-data",
        mimeType: 'multipart/form-data',
        // "Content-Type": "application/x-www-form-urlencoded",
        Authorization: bearer !== null ? bearer : "",
        processData: "false",
      });

      const parametrosServicio = {
        nombreComun: especieReportada.nombreComun,
        descripcion: especieReportada.descripcion,
        nombreCientifico: especieReportada.nombreCientifico,
        username: localStorage.getItem("username"),
        nivelCapa: "CAPA",
        idCapaCategoria: "487",
        latitud: geoposition?.lat.toString(),
        longitud: geoposition?.lng.toString(),
        recorridoArbol: " ",
      };

      const paramsCustom = new HttpParams({ fromObject: parametrosServicio });

      console.log(url, formData, formData.get("file"), {
        headers,
        params: paramsCustom,
      });

      this.http
        .post(url, formData, { headers, params: paramsCustom })
        .subscribe(
          (resposne) => {
            console.log(resposne);
          },
          (error) => {
            console.log(error);
          }
        );
    };

    reader.readAsArrayBuffer(imageBlob);
  }

  private dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: "image/png" });
    return blob;
  }

  uploadMedia(urlMedia: string, url: string) {
    const options: FileUploadOptions = {
      fileKey: "multimedia",
      mimeType: "multipart/form-data",
      headers: { Authorization: localStorage.getItem("bearer") },
    };

    from(
      this.fileTransferObject.upload(urlMedia, encodeURI(url), options)
    ).subscribe((response) => {
      console.log("uploadMedia", response);
    });
  }
}
