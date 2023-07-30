import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { IPerson, IResponse } from './api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _httpClient = inject(HttpClient);

  private _baseUrl = 'https://swapi.dev/api/';

  getPeople(page = 1): Observable<IResponse<IPerson[]>> {
    return this._httpClient.get<IResponse<IPerson[]>>(
      this._baseUrl + 'people',
      {
        params: { page },
      }
    );
  }

  getPerson(id: string | number): Observable<IPerson> {
    return this._httpClient.get<IPerson>(`${this._baseUrl}people/${id}`);
  }
}
