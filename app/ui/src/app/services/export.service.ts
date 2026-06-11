import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private apiUrl = 'http://localhost:3000/api/export';

  constructor(private http: HttpClient) {}

  exportTableToCsv(tableName: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/csv`, { tableName }, {
      responseType: 'blob',
    });
  }
}
