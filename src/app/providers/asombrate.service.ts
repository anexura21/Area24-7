import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Especie } from "../entities/especie";
import { EspecieSugeridaIA } from "../entities/especieSugeridaIA";
import { CONFIG_ENV } from "../shared/config-env-service/const-env";

@Injectable({
  providedIn: "root",
})
export class AsombrateService {
  constructor(private http: HttpClient) {}

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
    },
    idAvistamientoCustom
  ): Observable<any> {
    const url = CONFIG_ENV.REST_BASE_URL + "/api/avistamiento";
    const bearer = localStorage.getItem("bearer");
    const imageBlob = this.dataURItoBlob(foto?.url.split(",")[1]);

    let formData = new FormData();
    const imgBlob = new Blob([imageBlob], { type: "image/png" });
    formData.append("multimedia", imgBlob, 'avistamiento.png');

    let headers = new HttpHeaders({
      mimeType: "multipart/form-data",
      Authorization: bearer !== null ? bearer : "",
      processData: "false",
    });

    let parametrosServicio;
    if (idAvistamientoCustom !== null) {
      parametrosServicio = {
        nombreComun: especieReportada.nombreComun,
        descripcion: especieReportada.descripcion,
        nombreCientifico: especieReportada.nombreCientifico,
        username: localStorage.getItem("username"),
        nivelCapa: "CAPA",
        idCapaCategoria: "487",
        latitud: geoposition?.lat.toString(),
        longitud: geoposition?.lng.toString(),
        recorridoArbol: " ",
        idAvistamiento: idAvistamientoCustom,
      };
    } else {
      parametrosServicio = {
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
    }

    let paramsCustom = new HttpParams({ fromObject: parametrosServicio });

    return this.http.post(url, formData, { headers, params: paramsCustom });
  }
}
