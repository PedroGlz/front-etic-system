import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-inactive-records-filter',
  templateUrl: './inactive-records-filter.component.html',
  styleUrl: './inactive-records-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InactiveRecordsFilterComponent {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();

  toggle(): void {
    this.checkedChange.emit(!this.checked());
  }
}
