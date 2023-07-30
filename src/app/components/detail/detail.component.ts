import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Observable, ReplaySubject, filter, map, switchMap, tap } from 'rxjs';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnChanges {
  private _apiService = inject(ApiService);
  private _router = inject(Router);

  @Input({ required: true }) id!: string;

  private readonly _personId$ = new ReplaySubject<string>(1);
  private readonly personId$ = this._getPersonId$();

  protected readonly _personDetail$ = this.personId$.pipe(
    switchMap((id) => this._apiService.getPerson(id))
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this._personId$.next(this.id);
    }
  }

  _navigateBack(): void {
    this._router.navigate(['overview']);
  }

  private _getPersonId$(): Observable<number> {
    return this._personId$.pipe(
      map((id) => (isNaN(Number(id)) ? null : Number(id))),
      tap((id) => {
        if (id == null) {
          this._navigateBack();
        }
      }),
      filter((id): id is number => id !== null)
    );
  }
}
