import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calendarDate', standalone: true })
export class CalendarDatePipe implements PipeTransform {
  transform(value: unknown): string {
    const text = String(value ?? '').trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
  }
}
