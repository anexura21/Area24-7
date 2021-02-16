import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, timeout } from "rxjs/operators";
import { Especie } from "../entities/especie";
import { EspecieSugeridaIA } from "../entities/especieSugeridaIA";
import { CONFIG_ENV } from "../shared/config-env-service/const-env";

@Injectable({
  providedIn: "root",
})
export class AsombrateService {
  constructor(private http: HttpClient) {}

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
      lat: number;
      lng: number;
    }
  ): Observable<any> {
    const url = CONFIG_ENV.REST_BASE_URL + "/api/avistamiento";
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("bearer"),
    });

    const blob = new Blob([foto?.url]);
    const formData = new FormData();
    const file = new File([blob], "avistamiento.jpeg");
    formData.append("image", file);

    const parametrosServicio = {
      nombreComun: especieReportada.nombreComun,
      descripcion: especieReportada.descripcion,
      nombreCientifico: especieReportada.nombreCientifico,
      username: localStorage.getItem("username"),
      nivelCapa: "CAPA",
      idCapaCategoria: "487",
      latitud: geoposition?.lat.toString(),
      longitud: geoposition?.lng.toString(),
      recorridoArbol: "",
    };

    const params = new HttpParams({ fromObject: parametrosServicio });

    console.log(formData, { headers, params });

    return this.http
      .post(url, { multimedia: formData }, { headers, params })
      .pipe(
        map((resposne) => {
          return resposne;
        }),
        timeout(9000)
      );
  }
}
