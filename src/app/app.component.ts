import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './services/cache.service';
import { map, startWith } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'ng-http-cache';
  countrySelected: any;

  countryCtrl = new FormControl();

  countries$: Observable<any>;
  filteredCountries$: Observable<any[]>;
  filterCountryChange$: Observable<string>;

  constructor(public http: HttpClient, public cache: CacheService) {
    const requestObservable = this.http.get('https://restcountries.eu/rest/v2/all').pipe(map(res => res));

    this.countries$ = this.cache.observable('my-cache-key', requestObservable, 20);

    this.filterCountryChange$ = this.countryCtrl.valueChanges.pipe(startWith(''));

    this.filteredCountries$ = combineLatest([this.countries$, this.filterCountryChange$]).pipe(
      map(([countries, countryString]) =>
        countryString && typeof countryString === 'string'
          ? this._filterCountries(countries, countryString)
          : countries.slice()
      )
    );
  }

  private _filterCountries(countries: any[], value: string): any[] {
    const filterValue = value.toLowerCase();

    return countries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
  }

  selectCountry(event) {
    this.countrySelected = event.option.value;
  }

  displayProperty(country) {
    return country ? country.name : undefined;
  }
}
