import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard';

@UseGuards(AuthThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    res.cookie('access_token', accessToken, {
      ...this.getCookieOptions(),
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        ...this.getCookieOptions(),
        maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
      });
    }
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', this.getCookieOptions());
    res.clearCookie('refresh_token', this.getCookieOptions());
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 900 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);

    if (!result.accessToken) {
      throw new UnauthorizedException(
        'No access token received from auth service',
      );
    }

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    if (!result.accessToken) {
      throw new UnauthorizedException(
        'No access token received from auth service',
      );
    }

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @Post('logout')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  @HttpCode(HttpStatus.OK)
  logout(@Res() res: Response) {
    this.clearAuthCookies(res);
    return res.json({ message: 'Logged out successfully' });
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 2, ttl: 3600 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 2, ttl: 3600 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @Throttle({ default: { limit: 20, ttl: 300 } })
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request) {
    try {
      const accessToken = req.cookies?.access_token;

      // Don't throw error if no token - just return null user
      // This allows client to check auth status without console errors
      if (!accessToken) {
        return { user: null };
      }

      // Service returns null if token is invalid/expired instead of throwing
      const user = await this.authService.getCurrentUser(accessToken);
      return { user };
    } catch {
      // Catch any unexpected errors and return null user instead of throwing
      // This ensures we never return 401/403 errors
      return { user: null };
    }
  }
}
