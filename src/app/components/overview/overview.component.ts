import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs';

import { ApiService } from '../../services/api.service';
import { IPerson, IResponse } from '../../services/api.types';

interface Person extends IPerson {
  id: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  private _apiService = inject(ApiService);
  private _router = inject(Router);

  protected readonly _page$ = new BehaviorSubject<number>(1);
  protected readonly page$ = this._page$.pipe(distinctUntilChanged());

  protected readonly _isLoading$ = new BehaviorSubject<boolean>(true);
  protected readonly isLoading$ = this._isLoading$.pipe(distinctUntilChanged());

  protected readonly _searchQuery$ = new BehaviorSubject<string>('');
  protected readonly searchQuery$ = this._searchQuery$.pipe(
    distinctUntilChanged()
  );

  protected readonly _people$ = this._getPeople$();
  protected readonly _filteredPeople$ = this._getFilteredPeople$(
    this._people$,
    this.searchQuery$
  );

  protected _displayedColumns = ['name', 'birthYear'];

  _changePage(page: PageEvent): void {
    this._page$.next(page.pageIndex + 1);
  }

  _openDetail(rowId: number): void {
    this._router.navigate(['detail', rowId]);
  }

  _search(query: string): void {
    this._searchQuery$.next(query);
  }

  private _getPeople$(): Observable<IResponse<Person[]>> {
    return this.page$.pipe(
      tap(() => this._isLoading$.next(true)),
      switchMap((page) => this._apiService.getPeople(page)),
      map((people) => ({
        ...people,
        results: people.results.map((person) => ({
          ...person,
          id: this._extractIdFromUrl(person.url),
        })),
      })),
      tap(() => this._isLoading$.next(false))
    );
  }

  private _extractIdFromUrl(url: string): number {
    const [https, empty, base, api, people, id] = url.split('/');
    return Number(id);
  }

  private _getFilteredPeople$(
    people$: Observable<IResponse<Person[]>>,
    searchQuery$: Observable<string>
  ): Observable<IResponse<Person[]>> {
    return combineLatest([people$, searchQuery$]).pipe(
      map(([people, searchQuery]) => ({
        ...people,
        results: this._filterPeople(people.results, searchQuery),
      }))
    );
  }

  private _filterPeople(people: Person[], searchQuery: string): Person[] {
    const filteredFields: (keyof Person)[] = ['name'];

    return people.filter((person) =>
      filteredFields.some((field) =>
        person[field].toString().includes(searchQuery)
      )
    );
  }
}
