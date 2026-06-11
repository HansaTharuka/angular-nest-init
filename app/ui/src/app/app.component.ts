import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'compai-init';
  isLoading = false;

  constructor(private exportService: ExportService) {}

  downloadCsv() {
    this.isLoading = true;
    const tableName = 'stock_data'; // Hardcoded table name for now

    this.exportService.exportTableToCsv(tableName).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tableName}_${new Date().toISOString().substring(0, 10)}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error downloading CSV:', err);
        this.isLoading = false;
      },
    });
  }
}
