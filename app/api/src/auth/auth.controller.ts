import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login to get JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        username: { type: 'string', example: 'john' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns JWT access token' })
  @Post('login')
  login(@Body() body: { userId: string; username: string }) {
    return this.authService.generateToken(body.userId, body.username);
  }
}
