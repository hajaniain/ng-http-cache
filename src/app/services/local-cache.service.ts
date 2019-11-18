import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { isEmpty, isString, isNumber, isDate } from 'lodash';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalCacheService {
  defaultExpires = 86400; // 24Hrs

  constructor(private localstorage: LocalStorageService) {}

  /**
   * Cache or use result from observable
   *
   * If cache key does not exist or is expired, observable supplied in argument is returned and result cached
   *
   */
  public observable<T>(key: string, observable: Observable<T>, expires: number = this.defaultExpires): Observable<T> {
    // First fetch the item from localstorage (even though it may not exist)
    return this.localstorage.getItem(key).pipe(
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
        if (!isEmpty(val)) {
          return of(val.value);
        } else {
          return observable.pipe(flatMap((value: any) => this.value(key, value, expires))); // The result may have 'expires' explicitly set
        }
      })
    );
  }

  value<T>(key: string, value: T, expires: number | string | Date = this.defaultExpires): Observable<T> {
    const expiresSanitized: Date = this.sanitizeAndGenerateDateExpiry(expires);

    return this.localstorage
      .setItem(key, {
        expires: expiresSanitized,
        value
      })
      .pipe(map(val => val.value));
  }

  expire(key: string): Observable<null> {
    return this.localstorage.removeItem(key) as Observable<null>;
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
    if (isNumber(expires)) {
      return new Date(Date.now() + Math.abs(expires as number) * 1000);
    }
    if (isString(expires)) {
      return new Date(expires);
    }
    if (isDate(expires)) {
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
