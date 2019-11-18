import * as localforage from 'localforage';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public setItem<T>(key: string, value: T): Observable<T> {
    return from(localforage.setItem(key, value));
  }

  public getItem<T>(key: string): Observable<T> {
    return from(localforage.getItem(key)) as Observable<T>;
  }

  public removeItem(key: string): Observable<void> {
    return from(localforage.removeItem(key));
  }
}
