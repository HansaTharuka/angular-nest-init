import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  generateCsv(tableName: string): string {
    // Sample data - you can replace this with actual DB queries based on tableName
    const headers = [
      'Date',
      'Open',
      'High',
      'Low',
      'Close',
      'Adj Close',
      'Volume',
      'RSI',
      'Upper Bollinger band',
      'Lower Bollinger band',
    ];

    const data = [
      [
        '2010/02/09',
        '492.209351',
        '494.314392',
        '486.736237',
        '491.9617',
        '445.888885',
        '6595770',
        '77.36356518',
        '538.556974',
        '482.7230332',
      ],
      [
        '2010/02/10',
        '495.255463',
        '495.255463',
        '486.389526',
        '487.924957',
        '442.230225',
        '8427562',
        '77.45099369',
        '534.3796798',
        '480.3622981',
      ],
      [
        '2010/02/11',
        '489.980469',
        '505.11203',
        '489.609009',
        '502.808868',
        '455.720215',
        '10822218',
        '73.80048902',
        '529.7061665',
        '482.2833307',
      ],
    ];

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}
