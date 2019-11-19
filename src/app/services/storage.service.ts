import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public setItem<T>(key: string, value: T): Observable<T> {
    sessionStorage.setItem(key, JSON.stringify(value));
    return this.getItem(key);
  }

  public getItem<T>(key: string): Observable<T> {
    return of(JSON.parse(sessionStorage.getItem(key)));
  }

  public removeItem(key: string): Observable<void> {
    return of(sessionStorage.removeItem(key));
  }
}
