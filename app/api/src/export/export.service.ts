import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ExportService {
  // Basic example that was previously used — kept for reference
  async generateExcel(tableName: string): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.columns = [
      { header: 'A', key: 'a', width: 30 },
      { header: 'B', key: 'b', width: 20 },
    ];
    sheet.addRow(['Sample', 'Data']);
    return workbook.xlsx.writeBuffer();
  }

  // Generate an Excel workbook from a named XML template and inject dummy data
  async generateExcelFromTemplate(templateId: string, tableName: string): Promise<Buffer> {
    const templatesDir = path.join(__dirname, 'templates');
    const templatePath = path.join(templatesDir, `${templateId}.xml`);
    const xml = await fs.readFile(templatePath, 'utf8');

    // Very small, controlled XML parsing for our template schema
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : templateId;

    const columnRegex = /<column\s+key="([^"]+)">([^<]+)<\/column>/g;
    const columns: { key: string; header: string }[] = [];
    let colMatch;
    while ((colMatch = columnRegex.exec(xml)) !== null) {
      columns.push({ key: colMatch[1], header: colMatch[2].trim() });
    }

    // Parse optional <meta> items
    const metaMatch = xml.match(/<meta>([\s\S]*?)<\/meta>/);
    const metaItems: { key: string; value: string }[] = [];
    if (metaMatch) {
      const itemRegex = /<item\s+key="([^"]+)">([\s\S]*?)<\/item>/g;
      let it;
      while ((it = itemRegex.exec(metaMatch[1])) !== null) {
        metaItems.push({ key: it[1].trim(), value: it[2].trim() });
      }
    }

    // For now inject dummy data. In future this can be replaced with DB fetch.
    const dummyRows = this.generateDummyData(columns, 5);

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(title.substring(0, 31));

    sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 30 }));

    // Add header row (ExcelJS already adds header from columns, but we want a title row)
    sheet.insertRow(1, [title]);
    sheet.mergeCells(1, 1, 1, columns.length);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([]);

    // Add meta rows (merge remaining columns for value)
    if (metaItems.length) {
      metaItems.forEach((m) => {
        const row = sheet.addRow([`${m.key}`, `${m.value}`]);
        if (columns.length >= 2) {
          sheet.mergeCells(row.number, 2, row.number, columns.length);
        }
        row.getCell(1).font = { bold: true };
      });
      sheet.addRow([]);
    }

    // Add table header and rows
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    dummyRows.forEach((r) => {
      const row = sheet.addRow(columns.map((c) => r[c.key] ?? ''));
      row.alignment = { vertical: 'middle', wrapText: true };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Add notes if present
    const notesMatch = xml.match(/<notes>([\s\S]*?)<\/notes>/);
    if (notesMatch) {
      const lineRegex = /<line>([\s\S]*?)<\/line>/g;
      let lm;
      sheet.addRow([]);
      while ((lm = lineRegex.exec(notesMatch[1])) !== null) {
        const noteRow = sheet.addRow([lm[1].trim()]);
        sheet.mergeCells(noteRow.number, 1, noteRow.number, columns.length);
        noteRow.getCell(1).alignment = { wrapText: true };
        noteRow.font = { italic: true };
      }
    }

    return workbook.xlsx.writeBuffer();
  }

  // Create dummy rows to inject into a template. Keys are taken from template columns.
  private generateDummyData(columns: { key: string; header: string }[], count = 3) {
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = {};
      columns.forEach((col, idx) => {
        // Provide different value patterns based on column key
        if (/date/i.test(col.key)) row[col.key] = new Date(2020, 0, i + 1).toISOString().substring(0, 10);
        else if (/open|close|mean|p25|p75|base|total|bonus|volume/i.test(col.key)) row[col.key] = Math.floor(100000 + Math.random() * 100000);
        else if (/employee|jobTitle|role|employee/i.test(col.key)) row[col.key] = `${col.header} ${i + 1}`;
        else row[col.key] = `${col.header} ${i + 1}`;
      });
      rows.push(row);
    }
    return rows;
  }

  // Stub for future MongoDB data retrieval. Replace the body with actual DB queries.
  // Example usage (future): const data = await this.getDataFromMongo(collectionName);
  async getDataFromMongo(collectionName: string): Promise<any[]> {
    // TODO: implement MongoDB retrieval logic here. For now, return an empty array.
    // You can inject the dummy data above when testing: return this.generateDummyData(...)
    return [];
  }
}
