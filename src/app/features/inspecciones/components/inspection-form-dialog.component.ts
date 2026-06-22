import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InspectionStore } from '@features/inspecciones/data-access/inspection.store';

@Component({
  selector: 'app-inspection-form-dialog',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule],
  templateUrl: './inspection-form-dialog.component.html',
  styleUrl: './inspection-form-dialog.component.scss',
})
export class InspectionFormDialogComponent {
  readonly store = input.required<InspectionStore>();
}
