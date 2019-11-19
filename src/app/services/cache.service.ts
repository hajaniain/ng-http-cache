import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  defaultExpires = 86400; // 24Hrs

  constructor(private storageService: StorageService) {}

  /**
   * Cache or use result from observable
   *
   * If cache key does not exist or is expired, observable supplied in argument is returned and result cached
   *
   */
  public observable<T>(key: string, observable: Observable<T>, expires: number = this.defaultExpires): Observable<T> {
    // First fetch the item from localstorage (even though it may not exist)
    return this.storageService.getItem(key).pipe(
      // If the cached value has expired, nullify it, otherwise pass it through
      map((val: CacheStorageRecord) => {
        if (val) {
          return new Date(val.expires).getTime() > Date.now() ? val : null;
        }
        return null;
      }),
      // At this point, if we encounter a null value, either it doesnt exist in the cache or it has expired.
      // If it doesnt exist, simply return the observable that has been passed in, caching its value as it passes through
      flatMap((val: CacheStorageRecord | null) => {
        if (val) {
          return of(val.value);
        } else {
          // The result may have 'expires' explicitly set
          return observable.pipe(flatMap((value: any) => this.value(key, value, expires)));
        }
      })
    );
  }

  value<T>(key: string, value: T, expires: number | string | Date = this.defaultExpires): Observable<T> {
    const expiresSanitized: Date = this.sanitizeAndGenerateDateExpiry(expires);

    return this.storageService
      .setItem(key, {
        expires: expiresSanitized,
        value
      })
      .pipe(map(val => val.value));
  }

  expire(key: string): Observable<null> {
    return this.storageService.removeItem(key) as Observable<null>;
  }

  private sanitizeAndGenerateDateExpiry(expires: string | number | Date): Date {
    const expiryDate: Date = this.expiryToDate(expires);

    // Dont allow expiry dates in the past
    if (expiryDate.getTime() <= Date.now()) {
      return new Date(Date.now() + this.defaultExpires);
    }

    return expiryDate;
  }

  private expiryToDate(expires: number | string | Date): Date {
    if (typeof expires === 'number') {
      return new Date(Date.now() + Math.abs(expires as number) * 1000);
    }
    if (typeof expires === 'string') {
      return new Date(expires);
    }
    if (expires instanceof Date) {
      return expires as Date;
    }

    return new Date();
  }
}

/**
 * Cache storage record interface
 */
interface CacheStorageRecord {
  expires: Date;
  value: any;
}
