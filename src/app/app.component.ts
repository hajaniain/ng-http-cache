import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalCacheService } from './services/local-cache.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'ng-http-cache';
  constructor(public http: HttpClient, public cache: LocalCacheService) {
    //Cache an observable
    let requestObservable = this.http.get('https://restcountries.eu/rest/v2/all').pipe(map(res => res));

    this.cache.observable('my-cache-key', requestObservable, 10).subscribe(result => {
      //Use result
      console.log(result);
    });
  }
}
