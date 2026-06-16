import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'compai-init';
  isLoading = false;
  templates = [
    { id: 'template1', label: 'Market Pricing (template1)' },
    { id: 'template2', label: 'Salary Summary (template2)' },
    { id: 'template3', label: 'Stock Data (template3)' },
  ];
  selectedTemplate = this.templates[0].id;

  constructor(private exportService: ExportService) {}

  downloadTemplate() {
    this.isLoading = true;
    const tableName = 'market_pricing';
    const templateId = this.selectedTemplate;

    this.exportService.exportTemplate(tableName, templateId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateId}_${tableName}_${new Date().toISOString().substring(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error downloading templated Excel:', err);
        this.isLoading = false;
      },
    });
  }
}
