# API Export Feature Instruction for LLM

This document describes how to implement a templated Excel export feature for the API part only. It is written for an LLM or developer with basic backend skills.

## Goal

Create a backend API endpoint that:

1. Accepts `tableName` and `templateId` in the request body.
2. Loads an XML template file based on `templateId`.
3. Injects dummy data for now.
4. Generates an `.xlsx` Excel file using the template structure.
5. Returns the Excel file as a download response.

## Supported technology

- Node.js
- NestJS-style API (controllers, services)
- `exceljs` for Excel generation
- `fs/promises` for file reading
- XML template files stored on disk

## Recommended file structure

```
src/
  export/
    export.controller.ts
    export.service.ts
    templates/
      template1.xml
      template2.xml
      template3.xml
```

## XML template format

Each template should define:

- `<title>`: the report title
- optional `<meta>` items: rows of metadata
- `<columns>`: table columns and headers
- optional `<notes>`: footer text lines

Example `template1.xml`:

```xml
<template id="template1">
  <title>Market Pricing • 2025 Bulgaria TRS</title>
  <meta>
    <item key="WEIGHTING">Incumbent Weighted</item>
    <item key="EFFECTIVE DATE">03/01/2025</item>
    <item key="AGEING">Aged to May 2026</item>
    <item key="ACTUAL">Actual Data</item>
    <item key="COMPONENT">Base Salary</item>
    <item key="CURRENCY">USD</item>
    <item key="REFINEMENTS">Location: New York, PC Range: 56</item>
  </meta>
  <columns>
    <column key="jobTitle">JOB TITLE</column>
    <column key="p25">25TH</column>
    <column key="mean">MEAN</column>
    <column key="median">MEDIAN</column>
    <column key="p75">75TH</column>
  </columns>
  <notes>
    <line>* One or more organizations have contributed a proportion of incumbents that may create a dominating influence.</line>
    <line>** Percentiles are suppressed in this analysis due to a dominating influence of one organization. Mercer suggests creating 'Organization Weighted' results to eliminate any dominating influences.</line>
    <line>The employee's salary is positioned slightly above the market median for DevOps Manager (M3) roles and falls within the competitive 50th–75th percentile range based on Mercer benchmarks.</line>
  </notes>
</template>
```

## Service implementation

Create `src/export/export.service.ts` with these methods:

- `generateExcelFromTemplate(templateId: string, tableName: string): Promise<Buffer>`
  - reads the XML file
  - parses title, meta, columns, notes
  - creates an Excel workbook
  - injects dummy rows into the table
  - returns the workbook buffer
- `generateDummyData(columns, count)`
  - returns rows with placeholder values for each template column
- `getDataFromMongo(collectionName: string)`
  - placeholder/stub for future database logic

Example implementation:

```ts
import { Injectable } from "@nestjs/common";
import { Workbook } from "exceljs";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class ExportService {
  async generateExcelFromTemplate(templateId: string, tableName: string): Promise<Buffer> {
    const templatesDir = path.join(__dirname, "templates");
    const templatePath = path.join(templatesDir, `${templateId}.xml`);
    const xml = await fs.readFile(templatePath, "utf8");

    const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : templateId;

    const columnRegex = /<column\s+key="([^"]+)">([^<]+)<\/column>/g;
    const columns: { key: string; header: string }[] = [];
    let colMatch;
    while ((colMatch = columnRegex.exec(xml)) !== null) {
      columns.push({ key: colMatch[1], header: colMatch[2].trim() });
    }

    const metaItems: { key: string; value: string }[] = [];
    const metaMatch = xml.match(/<meta>([\s\S]*?)<\/meta>/);
    if (metaMatch) {
      const itemRegex = /<item\s+key="([^"]+)">([\s\S]*?)<\/item>/g;
      let it;
      while ((it = itemRegex.exec(metaMatch[1])) !== null) {
        metaItems.push({ key: it[1].trim(), value: it[2].trim() });
      }
    }

    const dummyRows = this.generateDummyData(columns, 5);

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(title.substring(0, 31));
    sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 30 }));

    sheet.insertRow(1, [title]);
    sheet.mergeCells(1, 1, 1, columns.length);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([]);

    if (metaItems.length) {
      metaItems.forEach((m) => {
        const row = sheet.addRow([m.key, m.value]);
        if (columns.length >= 2) {
          sheet.mergeCells(row.number, 2, row.number, columns.length);
        }
        row.getCell(1).font = { bold: true };
      });
      sheet.addRow([]);
    }

    const headerRow = sheet.addRow(columns.map((c) => c.header));
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    dummyRows.forEach((r) => {
      const row = sheet.addRow(columns.map((c) => r[c.key] ?? ""));
      row.alignment = { vertical: "middle", wrapText: true };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

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

  private generateDummyData(columns: { key: string; header: string }[], count = 3) {
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        if (/date/i.test(col.key)) {
          row[col.key] = new Date(2020, 0, i + 1).toISOString().substring(0, 10);
        } else if (/open|close|mean|p25|p75|base|total|bonus|volume/i.test(col.key)) {
          row[col.key] = Math.floor(100000 + Math.random() * 100000);
        } else {
          row[col.key] = `${col.header} ${i + 1}`;
        }
      });
      rows.push(row);
    }
    return rows;
  }

  async getDataFromMongo(collectionName: string): Promise<any[]> {
    return [];
  }
}
```

## Controller implementation

Create `src/export/export.controller.ts` with one endpoint:

- `POST /export/template`
  - accepts `{ tableName, templateId }`
  - calls `ExportService.generateExcelFromTemplate(templateId, tableName)`
  - returns the returned buffer with Excel headers

Example controller:

```ts
import { Controller, Post, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { ExportService } from "./export.service";

@Controller("export")
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post("template")
  async exportByTemplate(@Body() body: { tableName: string; templateId: string }, @Res() res: Response) {
    const fileData = await this.exportService.generateExcelFromTemplate(body.templateId, body.tableName);
    const filename = `${body.templateId}_${body.tableName}.xlsx`;

    res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.header("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(fileData);
  }
}
```

## Dependency list

Add these packages if not already present:

```bash
npm install exceljs
```

## How to test manually

Send a request to the API:

```bash
curl -X POST http://localhost:3000/api/export/template \
  -H 'Content-Type: application/json' \
  -d '{"tableName":"market_pricing","templateId":"template1"}' \
  --output export.xlsx
```

Then open `export.xlsx` to confirm:

- Title row at the top
- Meta row section
- Table header row
- Dummy data rows
- Notes at the bottom

## Notes for the LLM

- Only implement the API/server side.
- Do not add frontend code.
- Use simple file-based XML templates.
- Keep the Excel generation generic.
- Add a stub method for MongoDB support, but do not implement actual database queries.
- The exported file should be a valid `.xlsx` workbook.
