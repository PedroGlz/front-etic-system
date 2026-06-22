import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InspectionApi } from '@features/inspecciones/data-access/inspection.api';
import { InspectionService } from '@features/inspecciones/data-access/inspection.service';
import { InspectionStore } from '@features/inspecciones/data-access/inspection.store';

@Component({
  selector: 'app-inspection-workspace-page',
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './inspection-workspace-page.component.html',
  styleUrl: './inspection-workspace-page.component.scss',
  providers: [InspectionApi, InspectionService, InspectionStore],
})
export class InspectionWorkspacePageComponent {
  constructor(readonly store: InspectionStore) {
    this.store.loadCurrentSelection();
  }

  closeSelection(): void {
    this.store.clearSelection();
  }
}
