import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(userId: string, username: string) {
    const payload = { sub: userId, username };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: '1h',
      }),
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      });
    } catch (error) {
      return null;
    }
  }
}
