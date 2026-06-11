import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt.guard';

@ApiTags('app')
@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Get root message (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get()
  getRoot() {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Get hello message (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }
}
