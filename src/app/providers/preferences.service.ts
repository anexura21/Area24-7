import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppPreferences } from '../entities/preferences/app-preferences';
import { TransportPreferences } from '../entities/preferences/transport-preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  private appsPreference = new BehaviorSubject<AppPreferences[]>(new Array<AppPreferences>());
  private transportsPreferences = new BehaviorSubject<TransportPreferences[]>(new Array<TransportPreferences>());

  constructor(private http: HttpClient) { }
}
