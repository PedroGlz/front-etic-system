import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-tipos-falla-list',
  imports: [CatalogPageComponent],
  templateUrl: './tipos-falla-list.component.html',
  styleUrl: './tipos-falla-list.component.scss',
})
export class TiposFallaListComponent {}
