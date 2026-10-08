import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InspectionStore } from '@features/inspecciones/services/inspection.store';

@Component({
  selector: 'app-inspection-form-dialog',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, DatePickerModule, SelectModule],
  templateUrl: './inspection-form-dialog.component.html',
  styleUrl: './inspection-form-dialog.component.scss',
})
export class InspectionFormDialogComponent {
  readonly store = input.required<InspectionStore>();
}
