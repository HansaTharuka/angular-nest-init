import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @ApiOperation({ summary: 'Export table data as CSV' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', example: 'stock_data' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'CSV file data' })
  @Post('csv')
  exportCsv(@Body() body: { tableName: string }, @Res() res: Response) {
    const csvData = this.exportService.generateCsv(body.tableName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${body.tableName}_${timestamp}.csv`;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  }
}
