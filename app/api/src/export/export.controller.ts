import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @ApiOperation({ summary: 'Export table data as Excel (XLSX)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', example: 'market_pricing' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Excel file data' })
  @Post('xlsx')
  async exportXlsx(@Body() body: { tableName: string }, @Res() res: Response) {
    const fileData = await this.exportService.generateExcel(body.tableName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${body.tableName}_${timestamp}.xlsx`;

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileData);
  }

  @ApiOperation({ summary: 'Export using a named template (templateId + tableName)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', example: 'market_pricing' },
        templateId: { type: 'string', example: 'template1' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Excel file data (templated)' })
  @Post('template')
  async exportByTemplate(@Body() body: { tableName: string; templateId: string }, @Res() res: Response) {
    const { tableName, templateId } = body;
    const fileData = await this.exportService.generateExcelFromTemplate(templateId, tableName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${templateId || 'template'}_${tableName || 'data'}_${timestamp}.xlsx`;

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileData);
  }
}
