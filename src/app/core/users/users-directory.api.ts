import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USERS_API_URL } from '@core/config/api-endpoints';
import { UserOption } from './user-option.model';

@Injectable({ providedIn: 'root' })
export class UsersDirectoryApi {
  constructor(private readonly http: HttpClient) {}
  list(): Observable<UserOption[]> { return this.http.get<UserOption[]>(USERS_API_URL, { withCredentials: true }); }
}
