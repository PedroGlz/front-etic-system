import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { InspectionApi } from '@features/inspecciones/data-access/inspection.api';
import { InspectionService } from '@features/inspecciones/data-access/inspection.service';
import { ReportTemplateFile } from '@features/inspecciones/models/inspection.model';

@Component({
  selector: 'app-report-templates-page',
  imports: [ButtonModule],
  templateUrl: './report-templates-page.component.html',
  styleUrl: './report-templates-page.component.scss',
  providers: [InspectionApi, InspectionService],
})
export class ReportTemplatesPageComponent {
  readonly templates = signal<ReportTemplateFile[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);

  constructor(private readonly service: InspectionService) {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.listReportTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar las plantillas', '', 'error');
      },
    });
  }

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement | null)?.files ?? []);
    if (!files.length) {
      return;
    }
    this.uploading.set(true);
    this.service.uploadReportTemplates(files).subscribe({
      next: () => {
        this.uploading.set(false);
        this.load();
        void Swal.fire({ icon: 'success', title: 'Plantillas cargadas', timer: 1200, showConfirmButton: false });
      },
      error: (error) => {
        this.uploading.set(false);
        void Swal.fire('No fue posible cargar las plantillas', error.error?.detail ?? '', 'error');
      },
    });
    (event.target as HTMLInputElement).value = '';
  }

  remove(template: ReportTemplateFile): void {
    this.service.deleteReportTemplates([template.name]).subscribe({
      next: () => {
        this.load();
        void Swal.fire({ icon: 'success', title: 'Plantilla eliminada', timer: 1200, showConfirmButton: false });
      },
      error: (error) => {
        void Swal.fire('No fue posible eliminar la plantilla', error.error?.detail ?? '', 'error');
      },
    });
  }

  download(template: ReportTemplateFile): void {
    this.service.downloadReportTemplate(template.name).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = template.name;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        void Swal.fire('No fue posible descargar la plantilla', '', 'error');
      },
    });
  }

  fileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
}
