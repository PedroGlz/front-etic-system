import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { ApplicationVersion, LicensedApplication } from '../models/licensing.model';
import { LicensingApi } from '../services/licensing.api';

@Component({
  selector: 'app-licensing-versions',
  imports: [DecimalPipe, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, TooltipModule, ModuleTableShellComponent],
  templateUrl: './versions-page.component.html',
  styleUrl: './versions-page.component.scss'
})
export class VersionsPageComponent {
  readonly records = signal<ApplicationVersion[]>([]);
  readonly applications = signal<LicensedApplication[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialog = signal(false);
  file: File | null = null;
  readonly form = new FormGroup({
    applicationId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    versionName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    versionCode: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    minimumAndroid: new FormControl(''),
    releaseNotes: new FormControl(''),
    mandatory: new FormControl(false, { nonNullable: true }),
    published: new FormControl(false, { nonNullable: true })
  });

  constructor(private readonly api: LicensingApi) { this.load(); }

  load(): void {
    this.loading.set(true);
    forkJoin({ versions: this.api.versions(), applications: this.api.applications() }).subscribe({
      next: value => {
        this.records.set(value.versions);
        this.applications.set(value.applications);
        this.loading.set(false);
      },
      error: error => { this.loading.set(false); this.showError(error); }
    });
  }

  selectFile(event: Event): void {
    this.file = (event.target as HTMLInputElement).files?.item(0) ?? null;
  }

  save(): void {
    if (this.form.invalid || !this.file) {
      this.form.markAllAsTouched();
      void Swal.fire('Validación', 'Completa los campos y selecciona un APK', 'warning');
      return;
    }
    const value = this.form.getRawValue();
    const body = new FormData();
    body.append('applicationId', value.applicationId);
    body.append('versionName', value.versionName);
    body.append('versionCode', String(value.versionCode));
    body.append('minimumAndroid', value.minimumAndroid ?? '');
    body.append('releaseNotes', value.releaseNotes ?? '');
    body.append('mandatory', String(value.mandatory));
    body.append('published', String(value.published));
    body.append('file', this.file);
    this.saving.set(true);
    this.api.uploadVersion(body).subscribe({
      next: () => { this.saving.set(false); this.dialog.set(false); this.file = null; this.form.reset(); this.load(); },
      error: error => { this.saving.set(false); this.showError(error); }
    });
  }

  toggle(row: ApplicationVersion): void {
    this.api.publishVersion(row.id, !row.published).subscribe({
      next: () => this.load(),
      error: error => this.showError(error)
    });
  }

  download(row: ApplicationVersion): void {
    this.api.downloadVersion(row.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = row.originalFileName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: error => this.showError(error)
    });
  }

  private showError(error: { error?: { detail?: string } }): void {
    void Swal.fire('Error', error.error?.detail ?? 'No fue posible completar la operación', 'error');
  }
}
